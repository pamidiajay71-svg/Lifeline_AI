import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { Layout, GuestOnly } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { AssistantPage } from '@/pages/AssistantPage';
import { ReportPage } from '@/pages/ReportPage';
import { HospitalsPage } from '@/pages/HospitalsPage';
import { ContactsPage } from '@/pages/ContactsPage';
import { FirstAidPage } from '@/pages/FirstAidPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AboutPage } from '@/pages/AboutPage';
import { AuthPage } from '@/pages/AuthPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/hospitals" element={<HospitalsPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/firstaid" element={<FirstAidPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route element={<GuestOnly />}>
                <Route path="/auth" element={<AuthPage />} />
              </Route>
            </Route>
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
