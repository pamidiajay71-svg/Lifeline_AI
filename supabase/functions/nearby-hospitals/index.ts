import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type Hospital = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: number | null;
  travelTime: string | null;
  phone: string | null;
  mapsUrl: string;
};

const EARTH_RADIUS_M = 6371000;

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

function formatDistance(m: number) {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function estimateTravelTime(m: number) {
  // Rough: 30 km/h urban average
  const minutes = Math.max(1, Math.round((m / 1000) / 30 * 60));
  return `${minutes} min`;
}

async function fetchWithTimeout(url: string, opts: RequestInit, ms = 8000): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

// Nominatim (OpenStreetMap geocoding) — fast, reliable, no key required.
// Searches for hospitals/clinics near the given coordinates.
async function nominatimSearch(lat: number, lng: number, radiusM = 5000): Promise<Hospital[]> {
  const q = encodeURIComponent('[hospital]');
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=20&addressdetails=1&extratags=1&namedetails=1&countrycode=&viewbox=${lng - 0.1}%2C${lat + 0.1}%2C${lng + 0.1}%2C${lat - 0.1}&bounded=1`;
  const res = await fetchWithTimeout(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'LifelineAI/1.0 (emergency triage assistant)',
    },
  });
  if (!res.ok) throw new Error(`Nominatim failed: ${res.status}`);
  const json = await res.json();

  const seen = new Set<string>();
  const hospitals: Hospital[] = [];
  for (const place of json ?? []) {
    const latE = parseFloat(place.lat);
    const lngE = parseFloat(place.lon);
    if (Number.isNaN(latE) || Number.isNaN(lngE)) continue;
    const name = place.display_name?.split(',')[0] ?? place.name;
    if (!name) continue;
    const key = `${name}@${latE.toFixed(3)},${lngE.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const dist = haversineMeters(lat, lng, latE, lngE);
    if (dist > radiusM) continue;
    hospitals.push({
      name,
      address: place.display_name ?? '',
      lat: latE,
      lng: lngE,
      distance: dist,
      travelTime: estimateTravelTime(dist),
      phone: place.extratags?.phone || place.extratags?.['contact:phone'] || null,
      mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${latE},${lngE}`,
    });
  }
  hospitals.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  return hospitals.slice(0, 12);
}

// Overpass (OpenStreetMap) — secondary fallback. Can be slow; wrapped in a timeout.
async function overpassFetch(query: string): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'text/plain',
    'User-Agent': 'LifelineAI/1.0 (emergency triage assistant)',
  };
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];
  let lastErr: unknown;
  for (const url of endpoints) {
    try {
      const res = await fetchWithTimeout(url, { method: 'POST', headers, body: query }, 10000);
      if (res.ok) return res;
      lastErr = new Error(`Overpass ${url} failed: ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Overpass failed');
}

async function overpassSearch(lat: number, lng: number, radiusM = 5000): Promise<Hospital[]> {
  const query = `
    [out:json][timeout:20];
    (
      node["amenity"="hospital"](around:${radiusM},${lat},${lng});
      way["amenity"="hospital"](around:${radiusM},${lat},${lng});
      node["amenity"="clinic"](around:${radiusM},${lat},${lng});
      way["amenity"="clinic"](around:${radiusM},${lat},${lng});
    );
    out center 30;
  `;
  const res = await overpassFetch(query);
  const json = await res.json();

  const seen = new Set<string>();
  const hospitals: Hospital[] = [];
  for (const el of json.elements ?? []) {
    const latE = el.lat ?? el.center?.lat;
    const lngE = el.lon ?? el.center?.lng;
    if (latE == null || lngE == null) continue;
    const name = el.tags?.name || el.tags?.["name:en"];
    if (!name) continue;
    const key = `${name}@${latE.toFixed(3)},${lngE.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const dist = haversineMeters(lat, lng, latE, lngE);
    hospitals.push({
      name,
      address: el.tags?.["addr:full"] || el.tags?.operator || "",
      lat: latE,
      lng: lngE,
      distance: dist,
      travelTime: estimateTravelTime(dist),
      phone: el.tags?.phone || el.tags?.["contact:phone"] || null,
      mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${latE},${lngE}`,
    });
  }
  hospitals.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  return hospitals.slice(0, 12);
}

// Google Places (Nearby Search) — used when GOOGLE_MAPS_API_KEY is configured.
async function googleSearch(lat: number, lng: number, radiusM = 5000): Promise<Hospital[]> {
  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!apiKey) throw new Error("no key");

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusM}&type=hospital&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Places failed: ${res.status}`);
  const json = await res.json();
  if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places status: ${json.status}`);
  }

  const hospitals: Hospital[] = [];
  for (const place of json.results ?? []) {
    const latE = place.geometry?.location?.lat;
    const lngE = place.geometry?.location?.lng;
    if (latE == null || lngE == null) continue;
    const dist = haversineMeters(lat, lng, latE, lngE);
    hospitals.push({
      name: place.name,
      address: place.vicinity || place.formatted_address || "",
      lat: latE,
      lng: lngE,
      distance: dist,
      travelTime: estimateTravelTime(dist),
      phone: place.formatted_phone_number || null,
      mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${latE},${lngE}&destination_place_id=${place.place_id ?? ""}`,
    });
  }
  hospitals.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  return hospitals.slice(0, 12);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { lat, lng } = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number") {
      return new Response(JSON.stringify({ error: "lat and lng numbers required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let hospitals: Hospital[] = [];
    let source = 'nominatim';

    if (Deno.env.get('GOOGLE_MAPS_API_KEY')) {
      try {
        hospitals = await googleSearch(lat, lng);
        source = 'google';
      } catch {
        try {
          hospitals = await nominatimSearch(lat, lng);
        } catch {
          hospitals = await overpassSearch(lat, lng);
          source = 'overpass';
        }
      }
    } else {
      try {
        hospitals = await nominatimSearch(lat, lng);
      } catch {
        hospitals = await overpassSearch(lat, lng);
        source = 'overpass';
      }
    }

    const formatted = hospitals.map((h) => ({
      ...h,
      distance: h.distance != null ? formatDistance(h.distance) : null,
    }));
    const body = JSON.stringify({ hospitals, source, formatted });
    return new Response(body, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
