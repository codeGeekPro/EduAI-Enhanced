import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import ProgressPage from './pages/ProgressPage';
import LoginPage from './pages/LoginPage';
import PWAInstaller from './components/pwa/PWAInstaller';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Les autres routes peuvent être ajoutées ici au fur et à mesure de leur refonte */}
        </Routes>
        <PWAInstaller />
      </Layout>
    </Router>
  );
}

export default App;
