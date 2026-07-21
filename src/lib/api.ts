import { supabase, type EmergencyContact, type EmergencyReport } from '@/lib/supabase';

export async function listContacts(userId: string): Promise<EmergencyContact[]> {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createContact(
  userId: string,
  input: { name: string; relationship: string; phone: string }
): Promise<EmergencyContact> {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert({ user_id: userId, ...input })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateContact(
  id: string,
  input: { name: string; relationship: string; phone: string }
): Promise<EmergencyContact> {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listReports(userId: string): Promise<EmergencyReport[]> {
  const { data, error } = await supabase
    .from('emergency_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createReport(
  userId: string,
  input: Omit<EmergencyReport, 'id' | 'user_id' | 'created_at'>
): Promise<EmergencyReport> {
  const { data, error } = await supabase
    .from('emergency_reports')
    .insert({ user_id: userId, ...input })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getReport(id: string): Promise<EmergencyReport | null> {
  const { data, error } = await supabase
    .from('emergency_reports')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
