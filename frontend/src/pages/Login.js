import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Mail, Lock, LogIn, Sun, Moon } from 'lucide-react';
import useThemeStore from '../services/themeStore';

const Login = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('isDarkMode') === 'true';
    if (savedDarkMode !== isDarkMode) {
      if (savedDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, [isDarkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-300'>
      <div className='absolute top-4 right-4'>
        <button
          onClick={() => toggleDarkMode()}
          className='p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center gap-2'
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun className='w-5 h-5 text-gray-600 dark:text-yellow-400 transition-colors duration-300' />
          ) : (
            <Moon className='w-5 h-5 text-gray-600 dark:text-blue-400 transition-colors duration-300' />
          )}
          <span className='text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300'>
            {isDarkMode ? 'Light' : 'Dark'}
          </span>
        </button>
      </div>
      <div className='crm-card w-full max-w-md bg-white dark:bg-gray-900 shadow-lg dark:shadow-2xl transition-colors duration-300'>
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300'>CRM Login</h2>
          <p className='text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300'>Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300'>Email</label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Mail className='h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300' />
              </div>
              <input type='email' className='crm-input pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300' placeholder='admin@example.com'
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300'>Password</label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Lock className='h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300' />
              </div>
              <input type='password' className='crm-input pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300' placeholder='••••••••'
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>
          </div>

          <button type='submit' disabled={loading} className='crm-button w-full flex justify-center items-center py-2 bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 focus:ring-gray-900 dark:focus:ring-gray-700 transition-colors duration-300'>
            {loading ? 'Processing...' : <><LogIn className='w-5 h-5 mr-2' /> Sign In</>}
          </button>
        </form>

        <div className='mt-6 text-center text-sm mb-4 border-b border-gray-200 dark:border-gray-700 pb-6 transition-colors duration-300'>
          <Link to='/register' className='text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-500 font-medium transition-colors duration-300'>Create an account</Link>
        </div>

        <div className='text-center text-sm'>
          <Link to='/developer-login' className='text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-300'>Developer Portal</Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
