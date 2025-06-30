import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import ProfilePage from './pages/ProfilePage';
import FAQPage from './pages/FAQPage';
import AIServicesPage from './pages/AIServicesPage';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPageSimple from './pages/AnalyticsPageSimple';
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/faq" element={<FAQPage />} />
        
        {/* Protected routes with layout */}
        <Route 
          path="/dashboard" 
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          } 
        />
        <Route 
          path="/courses" 
          element={
            <AppLayout>
              <CoursesPage />
            </AppLayout>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          } 
        />
        <Route 
          path="/ai-services" 
          element={
            <AppLayout>
              <AIServicesPage />
            </AppLayout>
          } 
        />
        {/* TODO: Add more protected routes */}
        <Route 
          path="/analytics" 
          element={
            <AppLayout>
              <AnalyticsPageSimple />
            </AppLayout>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          } 
        />
        <Route 
          path="/support" 
          element={
            <AppLayout>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Support - En développement</h1>
              </div>
            </AppLayout>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
