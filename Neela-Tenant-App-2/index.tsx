import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import App from './App';
import TenantLoginPage from './components/TenantLoginPage';
import AdminLoginPage from './components/AdminLoginPage';
import PropertyManagerLoginPage from './components/PropertyManagerLoginPage';
import PropertyManagerSignupPage from './components/PropertyManagerSignupPage';
import PropertyManagerView from './components/PropertyManagerView';
import LeaseSigningPage from './components/LeaseSigningPage';
import ShortStaysPublicPage from './components/ShortStaysPublicPage';
import { isAuthenticated, getCurrentUser } from './services/auth';

function AdminEntry() {
  const [, setAuthTick] = useState(0);
  const user = getCurrentUser('admin');
  const isStaff = !!(user?.is_staff || user?.is_superuser);
  if (isAuthenticated('admin') && isStaff) {
    return <App variant="admin" />;
  }
  return <AdminLoginPage onSuccess={() => setAuthTick((n) => n + 1)} />;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Site-root staff URLs (not under /portal) */}
        <Route path="/admin" element={<AdminEntry />} />
        <Route path="/manager/login" element={<PropertyManagerLoginPage />} />
        <Route path="/manager/signup" element={<PropertyManagerSignupPage />} />
        <Route path="/manager" element={<PropertyManagerView />} />

        {/* Legacy redirects from old /portal/admin|manager URLs */}
        <Route path="/portal/admin" element={<Navigate to="/admin" replace />} />
        <Route path="/portal/manager/login" element={<Navigate to="/manager/login" replace />} />
        <Route path="/portal/manager" element={<Navigate to="/manager" replace />} />

        {/* Tenant / public portal under /portal */}
        <Route path="/portal/short-stays/:propertyId" element={<ShortStaysPublicPage />} />
        <Route path="/portal/short-stays" element={<ShortStaysPublicPage />} />
        <Route path="/portal/tenant" element={<TenantLoginPage />} />
        <Route path="/portal/sign-lease" element={<LeaseSigningPage />} />
        <Route path="/portal/*" element={<App variant="portal" />} />
        <Route path="/portal" element={<App variant="portal" />} />

        {/* Default: send bare app hits to portal */}
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
