import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Split name into firstName and lastName for the backend
    const [firstName, ...lastNameArr] = formData.name.trim().split(' ');
    const lastName = lastNameArr.join(' ') || 'User';

    try {
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        firstName,
        lastName
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Account created!');
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
          <h2 className='text-2xl font-bold text-gray-900'>Create Account</h2>
          <p className='text-gray-500 mt-2'>Join our CRM system</p>
        </div>
        
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <User className='h-5 w-5 text-gray-400' />
              </div>
              <input type='text' className='crm-input pl-10' placeholder='John Doe'
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Mail className='h-5 w-5 text-gray-400' />
              </div>
              <input type='email' className='crm-input pl-10' placeholder='admin@example.com'
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Lock className='h-5 w-5 text-gray-400' />
              </div>
              <input type='password' className='crm-input pl-10' placeholder='••••••••'
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>
          </div>

          <button type='submit' disabled={loading} className='crm-button w-full flex justify-center items-center py-2'>
            {loading ? 'Processing...' : <><UserPlus className='w-5 h-5 mr-2' /> Sign Up</>}
          </button>
        </form>

        <div className='mt-6 text-center text-sm border-b border-gray-200 pb-6 mb-4'>
          <Link to='/login' className='text-emerald-600 hover:text-emerald-700 font-medium'>Already have an account? Login</Link>
        </div>
        
        <div className='text-center text-sm'>
          <Link to='/developer-register' className='text-gray-500 hover:text-gray-900'>API Developer Registration</Link>
        </div>
      </div>
    </div>
  );
};
export default Register;
