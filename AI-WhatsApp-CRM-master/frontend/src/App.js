import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useThemeStore from './services/themeStore';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import DeveloperLogin from './pages/DeveloperLogin';
import DeveloperRegister from './pages/DeveloperRegister';
import Dashboard from './pages/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to='/login' />;
};

function App() {
  const { isDarkMode, setDarkMode } = useThemeStore();

  useEffect(() => {
    // Initialize theme from localStorage or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }
  }, [setDarkMode]);

  return (
    <div className='crm-container'>
      <Router>
        <ToastContainer 
          position='bottom-right'
          theme={isDarkMode ? 'dark' : 'light'}
          autoClose={3000}
        />
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/developer-login' element={<DeveloperLogin />} />
          <Route path='/developer-register' element={<DeveloperRegister />} />
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path='*' element={<Navigate to='/login' />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

