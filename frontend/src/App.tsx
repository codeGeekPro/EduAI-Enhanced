import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import { ThemeToggle } from './components/ui/ThemeToggle';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Router>
        <header className="p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">EduAI Enhanced</h1>
          <ThemeToggle />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
