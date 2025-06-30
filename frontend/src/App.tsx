import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// Pages temporaires pour la démo de la navigation
const CoursesPage = () => <div className="container mx-auto p-8 text-center"><h1>Page des Cours</h1><p>Le contenu pour les cours sera affiché ici.</p></div>;
const ProgressPage = () => <div className="container mx-auto p-8 text-center"><h1>Page de Suivi des Progrès</h1><p>Les graphiques et statistiques de progression seront affichés ici.</p></div>;

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
      </Layout>
    </Router>
  );
}

export default App;
