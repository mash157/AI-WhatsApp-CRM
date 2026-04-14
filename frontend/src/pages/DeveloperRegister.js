import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

const DeveloperRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Split name into firstName and lastName for the backend
    const [firstName, ...lastNameArr] = formData.name.trim().split(' ');
    const lastName = lastNameArr.join(' ') || 'Developer';

    try {
      const response = await authAPI.developerRegister({
        email: formData.email,
        password: formData.password,
        firstName,
        lastName,
        company: 'Independent' // Default company
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Developer Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='crm-container justify-center items-center'>
      <div className='crm-card w-full max-w-md'>
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-bold text-gray-900'>API Setup</h2>
          <p className='text-gray-500 mt-2'>Register for developer access</p>
        </div>
        
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Developer Name</label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <User className='h-5 w-5 text-gray-400' />
              </div>
              <input type='text' className='crm-input pl-10' placeholder='Jane Doe'
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Mail className='h-5 w-5 text-gray-400' />
              </div>
              <input type='email' className='crm-input pl-10' placeholder='dev@company.com'
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Lock className='h-5 w-5 text-gray-400' />
              </div>
              <input type='password' className='crm-input pl-10' placeholder='��������'
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>
          </div>

          <button type='submit' disabled={loading} className='crm-button w-full flex justify-center items-center py-2 bg-gray-900 hover:bg-black focus:ring-gray-900'>
            {loading ? 'Processing...' : <><UserPlus className='w-5 h-5 mr-2' /> Create Dev Account</>}
          </button>
        </form>

        <div className='mt-6 text-center text-sm'>
          <span className='text-gray-500'>Already have an API account? </span>
          <Link to='/developer-login' className='text-gray-900 hover:text-black font-medium'>Sign In</Link>
        </div>
      </div>
    </div>
  );
};
export default DeveloperRegister;
