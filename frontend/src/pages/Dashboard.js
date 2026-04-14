import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI, paymentAPI, userAPI, automationAPI } from '../services/api';
import useThemeStore from '../services/themeStore';
import { toast } from 'react-toastify';
import { FiLogOut, FiMessageSquare, FiUser, FiActivity, FiSend, FiInbox, FiCheck, FiX } from 'react-icons/fi';
import UsageChart from '../components/UsageChart';
import ChatMessage from '../components/ChatMessage';
import PaymentModal from '../components/PaymentModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const openPaymentModal = (planName, amount) => {
    setSelectedPlan({ name: planName, amount });
    setShowPaymentModal(true);
  };

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      userAPI.getProfile().then((res) => {
        const refreshedUser = res.data.user;
        setUser(refreshedUser);
        localStorage.setItem('user', JSON.stringify(refreshedUser));
      }).catch((err) => console.error('Failed to refresh user profile:', err));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handlePaymentSubmit = async (method) => {
    if (!selectedPlan) {
      toast.error('Please select a plan first');
      return;
    }
    setPaymentLoading(true);
    try {
      const planKey = selectedPlan.name.toLowerCase();
      if (planKey === 'demo mode') {
        toast.info('Demo Mode: UI Test Only');
        setTimeout(() => setShowPaymentModal(false), 1000);
        return;
      }

      if (method === 'razorpay') {
        toast.info('Initializing Razorpay Gateway...');
        const res = await paymentAPI.createRazorpayOrder({ plan: planKey, duration: 'monthly' });
        
        const options = {
          key: 'rzp_test_SdReO2k6OvfoTy', 
          amount: res.data.order.amount,
          currency: res.data.order.currency,
          name: `WhatsApp CRM ${planKey.charAt(0).toUpperCase() + planKey.slice(1)}`,
          description: `${selectedPlan.name} Subscription`,
          order_id: res.data.order.id,
          handler: async function (response) {
            try {
              toast.info('Verifying Payment...');
              await paymentAPI.verifyRazorpayPayment({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                plan: planKey,
                duration: 'monthly'
              });
              
              // Refresh user profile logic
              const resProfile = await userAPI.getProfile();
              const refreshedUser = resProfile.data.user;
              setUser(refreshedUser);
              localStorage.setItem('user', JSON.stringify(refreshedUser));
              
              toast.success('Payment Successful! Subscription Upgraded.');
              setShowPaymentModal(false);
            } catch (err) {
              toast.error('Payment verification failed.');
            }
          },
          prefill: {
            name: user?.name || user?.firstName || 'User',
            email: user?.email || 'user@example.com',
            contact: '9999999999'
          },
          theme: {
            color: '#10b981'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();

      } else if (method === 'stripe') {
        toast.info('Initializing Stripe Checkout...');
        const res = await paymentAPI.createStripeIntent({ plan: planKey, duration: 'monthly' });
        
        // Use Stripe.js
        window.Stripe(process.env.REACT_APP_STRIPE_KEY || 'pk_test_5123456');
        
        toast.success(`Stripe Intent Created: ${res.data.clientSecret.substring(0, 10)}... (Test UI Flow)`);
        setTimeout(() => setShowPaymentModal(false), 1500);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to initiate payment. Ensure Backend is running and API keys are set.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = { content: inputText, role: 'user' };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await chatAPI.sendMessage({
        message: inputText,
        customerId: 'local-test-123'
      });
      
      const reply = response.data.reply || { role: 'assistant', content: 'Success but no reply content in response.' };
      setMessages(prev => [...prev, reply]);
    } catch (err) {
      toast.error('Failed to send message: ' + (err.response?.data?.error || err.message));
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠�  Error: The API is currently unreachable. Make sure the backend server and Gemini API key are configured correctly.' }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Additional states for Contacts & Automations
  const [contacts, setContacts] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (activeTab === 'contacts') {
      fetchContacts();
    } else if (activeTab === 'automations') {
      fetchAutomations();
    }
    setShowProfileMenu(false);
  }, [activeTab]);

  const fetchContacts = async () => {
    setLoadingData(true);
    try {
      const res = await userAPI.getCustomers();
      setContacts(res.data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };



  const fetchAutomations = async () => {
    setLoadingData(true);
    try {
      const res = await automationAPI.getAutomations();
      setAutomations(res.data.automations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  // State for Create Automation Modal
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    type: 'followup',
    triggerEvent: 'message_received',
    actionType: 'send_message',
    template: '',
  });

  // State for Contact Import Modal
  const [showContactModal, setShowContactModal] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: '',
    phone: '',
  });

  // State for Profile Settings Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    company: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        company: user.company || '',
      });
    }
  }, [user]);

  const handleCreateAutomationSubmit = async (e) => {
    e.preventDefault();
    if (!newAutomation.name.trim() || !newAutomation.template.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      name: newAutomation.name,
      type: newAutomation.type,
      trigger: { event: newAutomation.triggerEvent },
      action: { type: newAutomation.actionType, template: newAutomation.template },
      isActive: true
    };

    try {
      await toast.promise(
        automationAPI.createAutomation(payload).then(() => {
          fetchAutomations();
          setShowAutomationModal(false);
          setNewAutomation({ name: '', type: 'followup', triggerEvent: 'message_received', actionType: 'send_message', template: '' });
        }),
        {
          pending: 'Creating automation...',
          success: 'Automation created successfully!',
          error: 'Failed to create automation'
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const createDummyAutomation = async () => {
    const payload = {
      name: `Welcome Sequence ${Math.floor(Math.random() * 100)}`,
      type: 'followup',
      trigger: { event: 'message_received' },
      action: { type: 'send_message', template: 'Hello! Thank you for contacting us. How can we help?' },
      isActive: true
    };
    try {
      await toast.promise(
        automationAPI.createAutomation(payload).then(() => fetchAutomations()),
        {
          pending: 'Creating automation...',
          success: 'Automation created successfully!',
          error: 'Failed to create automation'
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportContactSubmit = async (e) => {
    e.preventDefault();
    if (!newContact.firstName.trim() || !newContact.phone.trim()) {
      toast.error('Please enter name and phone number');
      return;
    }
    try {
      await toast.promise(
        userAPI.addCustomer({ ...newContact }).then(() => {
          fetchContacts();
          setShowContactModal(false);
          setNewContact({ firstName: '', phone: '' });
        }),
        {
          pending: 'Saving contact...',
          success: 'Contact saved successfully!',
          error: 'Failed to save contact'
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await toast.promise(
        userAPI.updateProfile(profileData).then((res) => {
          setShowProfileModal(false);
          const refreshedUser = res.data.user;
          setUser(refreshedUser);
          localStorage.setItem('user', JSON.stringify(refreshedUser));
        }),
        {
          pending: 'Updating profile...',
          success: 'Profile updated!',
          error: 'Failed to update profile'
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const calculateDaysLeft = (endDate) => {
    if (!endDate) return 0;
    const diffTime = Math.abs(new Date(endDate) - new Date());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDeleteAutomation = async (automationId) => {
    try {
      await toast.promise(
        automationAPI.deleteAutomation(automationId).then(() => {
          fetchAutomations();
        }),
        {
          pending: 'Deleting automation...',
          success: 'Automation deleted successfully!',
          error: 'Failed to delete automation'
        }
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete automation');
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await toast.promise(
        userAPI.deleteCustomer(contactId).then(() => {
          fetchContacts();
        }),
        {
          pending: 'Deleting contact...',
          success: 'Contact deleted successfully!',
          error: 'Failed to delete contact'
        }
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete contact');
    }
  };

  return (
    <div className='crm-container flex h-screen bg-gray-50 dark:bg-gray-950 flex-col md:flex-row text-gray-800 dark:text-gray-100 font-sans'>
      {/* Sidebar */}
      <div className='w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between shrink-0 shadow-sm z-10'>
        <div>
          <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
            <h1 className='text-2xl font-black tracking-tight text-gray-900 dark:text-white'>CRM {user?.isDeveloper ? 'Max' : (user?.subscription?.plan ? user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1) : 'Standard')}</h1>
            <p className='text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-wider'>
              {user?.isDeveloper ? 'Developer Edition' : (user?.subscription?.plan ? `${user.subscription.plan} Tier` : 'Free Tier')}
            </p>
          </div>
          <nav className='p-4 space-y-2'>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center px-4 py-3 rounded-lg font-bold shadow-sm transition-all border ${activeTab === 'dashboard' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-700' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'}`}
            >
              <FiActivity className='mr-3 h-5 w-5' /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('automations')} 
              className={`w-full flex items-center px-4 py-3 rounded-lg font-bold shadow-sm transition-all border ${activeTab === 'automations' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-700' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'}`}
            >
              <FiMessageSquare className='mr-3 h-5 w-5' /> Automations
            </button>
            <button 
              onClick={() => setActiveTab('contacts')} 
              className={`w-full flex items-center px-4 py-3 rounded-lg font-bold shadow-sm transition-all border ${activeTab === 'contacts' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-700' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'}`}
            >
              <FiUser className='mr-3 h-5 w-5' /> CRM Contacts
            </button>
            <button 
              onClick={() => setActiveTab('billing')} 
              className={`w-full flex items-center px-4 py-3 rounded-lg font-bold shadow-sm transition-all border ${activeTab === 'billing' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-700' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'}`}
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="mr-3 h-5 w-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg> Billing & API
            </button>
          </nav>
        </div>
        <div className='p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'>
          <div className='mb-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>Account Settings</div>
          <button onClick={handleLogout} className='flex gap-2 items-center text-sm w-full font-bold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'>
            <FiLogOut className='h-4 w-4' /> Logout Session
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className='flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950'
        onClick={(e) => {
          if (showProfileMenu && !e.target.closest('.profile-dropdown-container')) {
            setShowProfileMenu(false);
          }
        }}
      >
        <header className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16 flex justify-between items-center px-8 shadow-sm z-40 relative'>
          <h2 className='text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight'>Overview</h2>
          <div className='flex items-center gap-3'>
            <button 
              onClick={() => openPaymentModal('Pro', 199900)}
              className='px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold rounded-full shadow-sm hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-1'
            >
              <span>✨</span> Upgrade Plan
            </button>
            <span className='px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full'>System Active</span>
            
            <div className='relative profile-dropdown-container'>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className='h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 border border-emerald-200 hover:ring-2 hover:ring-emerald-500 transition-all focus:outline-none'
              >
                {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'A'}
              </button>
              
              {showProfileMenu && (
                <div className='absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50'>
                  <div className='px-4 py-3 border-b border-gray-100 dark:border-gray-700'>
                    <p className='text-sm font-bold text-gray-800 dark:text-gray-100 truncate'>{user?.firstName || user?.name || 'Developer User'}</p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>{user?.email || 'dev@crm.local'}</p>
                  </div>
                  <div className='py-1'>
                    <button onClick={() => { setShowProfileMenu(false); setShowProfileModal(true); }} className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'>Profile Settings</button>
                    <button onClick={() => { setShowProfileMenu(false); setActiveTab('billing'); }} className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'>Billing & Plan</button>
                    <button 
                      onClick={() => toggleDarkMode()}
                      className='w-full text-left px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium'
                    >
                      {isDarkMode ? 'Switch to Light Theme' : 'Dark Theme'}
                    </button>
                  </div>
                  <div className='border-t border-gray-100 dark:border-gray-700 py-1'>
                    <button onClick={handleLogout} className='w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium'>Sign out</button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        <main className='flex-1 overflow-y-auto w-full p-4 md:p-8 bg-gray-50 dark:bg-gray-950'>
          <div className='max-w-6xl mx-auto space-y-8'>
            
            {activeTab === 'dashboard' && (
              <>
                {/* Top Stat row */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden transition-colors duration-300'>
                    <div className='absolute top-0 right-0 p-4 opacity-10'><FiUser size={48} className='text-gray-900 dark:text-gray-500 transition-colors duration-300' /></div>
                    <p className='text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300'>Total Customers</p>
                    <p className='text-4xl font-black text-gray-900 dark:text-white mt-2 transition-colors duration-300'>1,240</p>
                    <p className='text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center transition-colors duration-300'>+12% from last week</p>
                  </div>
                  <div className='bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden transition-colors duration-300'>
                    <div className='absolute top-0 right-0 p-4 opacity-10'><FiMessageSquare size={48} className='text-gray-900 dark:text-gray-500 transition-colors duration-300' /></div>
                    <p className='text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300'>Messages Sent</p>
                    <p className='text-4xl font-black text-gray-900 dark:text-white mt-2 transition-colors duration-300'>45,021</p>
                    <p className='text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center transition-colors duration-300'>+5% from last week</p>
                  </div>
                  <div className='bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden transition-colors duration-300'>
                    <div className='absolute top-0 right-0 p-4 opacity-10'><FiActivity size={48} className='text-gray-900 dark:text-gray-500 transition-colors duration-300' /></div>
                    <p className='text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300'>API Health</p>
                    <p className='text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-2 transition-colors duration-300'>99.9%</p>
                    <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300'>All endpoints running</p>
                  </div>
                </div>

                {user?.role === 'developer' && (
                  <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm p-6 rounded-xl transition-colors duration-300'>
                     <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300'>API Integration Keys</h3>
                     <p className='text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300'>Use these keys to authenticate your system requests via REST. Keep them secret.</p>
                     <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 overflow-x-auto flex justify-between items-center transition-colors duration-300'>
                       <span>API_KEY: pk_test_8f7d92ndjs82h1...</span>
                       <button className='text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-600 font-semibold transition-colors duration-300'>Copy</button>
                     </div>
                  </div>
                )}

                {/* Analytics & Chat Row */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  
                  {/* Left Column: Analytics Chart */}
                  <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm p-6 rounded-xl flex flex-col transition-colors duration-300'>
                    <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2 transition-colors duration-300'>
                      <FiActivity className='text-emerald-600'/> System Analytics
                    </h3>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300'>Volume breakdown over the last 30 days.</p>
                    <div className='flex-1 min-h-[300px]'>
                      <UsageChart usage={user?.usage} />
                    </div>
                  </div>

                  {/* Right Column: AI Chat Simulator */}
                  <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl flex flex-col overflow-hidden h-[500px] transition-colors duration-300'>
                    <div className='bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between transition-colors duration-300'>
                      <div>
                        <h3 className='font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300'>
                          <FiMessageSquare className='text-emerald-600' /> AI Chat Interface Test
                        </h3>
                        <p className='text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300'>Live sandbox connection to CRM backend.</p>
                      </div>
                      <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse'></span>
                    </div>
                    
                    {/* Chat window */}
                    <div className='flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-800 transition-colors duration-300'>
                      {messages.length === 0 ? (
                        <div className='h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-400 transition-colors duration-300'>
                          <FiInbox size={48} className='mb-4 opacity-30 text-gray-400 dark:text-gray-500 transition-colors duration-300' />
                          <p className='font-sembol text-sm text-gray-500 dark:text-gray-300 transition-colors duration-300'>Sandbox active.</p>
                          <p className='text-xs mt-1 text-gray-400 dark:text-gray-400 transition-colors duration-300'>Type a message to test the AI.</p>
                        </div>
                      ) : (
                        messages.map((msg, idx) => (
                          <ChatMessage key={idx} message={msg} isUser={msg.role === 'user'} />
                        ))
                      )}
                      {isTyping && (
                        <div className='flex justify-start mb-4'>
                          <div className='bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg px-4 py-2 text-sm italic transition-colors duration-300'>
                            Generating reply...
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input area */}
                    <form onSubmit={handleSendMessage} className='p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-colors duration-300'>
                      <div className='relative flex items-center'>
                        <input 
                          type='text' 
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder='Type to interact with AI agent...'
                          className='w-full border border-gray-300 dark:border-gray-700 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-sm font-medium placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300'
                          disabled={isTyping}
                        />
                        <button 
                          type='submit' 
                          disabled={isTyping || !inputText.trim()}
                          className='absolute right-2 p-2 bg-emerald-600 dark:bg-emerald-700 text-white rounded-md hover:bg-emerald-700 dark:hover:bg-emerald-800 disabled:opacity-50 transition-colors duration-300'
                        >
                          <FiSend size={16} />
                        </button>
                      </div>
                    </form>

                  </div>
                  
                </div>
              </>
            )}

            {activeTab === 'automations' && (
              <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm p-8 rounded-xl min-h-[400px] flex flex-col items-start transition-colors duration-300'>
                <div className="flex justify-between w-full items-center mb-6">
                  <div>
                    <h2 className='text-2xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300'>WhatsApp Automations</h2>
                    <p className='text-gray-500 dark:text-gray-400 text-sm max-w-md transition-colors duration-300'>Create automated reply sequences, scheduled broadcasts, and drip campaigns.</p>
                  </div>
                  <button onClick={() => setShowAutomationModal(true)} className='px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition-all text-sm flex items-center gap-2'>
                    <span>+</span> Create Campaign
                  </button>
                </div>
                
                <div className="w-full">
                  {loadingData ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400 transition-colors duration-300">Loading automations...</div>
                  ) : automations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {automations.map((a, i) => (
                        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 flex flex-col justify-between hover:shadow-sm dark:hover:shadow-lg transition-all duration-300">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-gray-800 dark:text-white transition-colors duration-300">{a.name || 'Campaign'}</h4>
                              <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full transition-colors duration-300 ${a.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                {a.isActive ? 'Active' : 'Paused'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate transition-colors duration-300">Trigger: {a.trigger?.event || 'Unknown'} &rarr; Action: {a.action?.type || 'Unknown'}</p>
                            <div className="text-sm bg-white dark:bg-gray-900 p-2 rounded border border-gray-100 dark:border-gray-600 italic text-gray-600 dark:text-gray-300 truncate transition-colors duration-300">
                              "{a.action?.template || a.action?.message || 'No template defined'}"
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button 
                              onClick={() => {
                                toast.promise(
                                  automationAPI.triggerAutomation(a._id).then((res) => {
                                    const { messagesSent, totalCustomers, errors } = res.data;
                                    
                                    // Show error details if any failed
                                    if (errors && errors.length > 0) {
                                      const errorDetails = errors.slice(0, 3).join('\n');
                                      toast.error(`Sent ${messagesSent}/${totalCustomers}. Errors:\n${errorDetails}`);
                                      return Promise.reject(new Error(`${errors.length} messages failed`));
                                    }
                                    
                                    if (messagesSent === 0) {
                                      return Promise.reject(new Error('No messages sent. Check phone numbers.'));
                                    }
                                    
                                    return Promise.resolve(`Sent ${messagesSent}/${totalCustomers} messages`);
                                  }),
                                  { 
                                    pending: 'Sending messages...', 
                                    success: 'Messages sent successfully! 📤', 
                                    error: (err) => err.message || 'Failed to send messages' 
                                  }
                                );
                              }}
                              className="flex-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all duration-300 flex items-center justify-center gap-1"
                            >
                              📤 Send Now
                            </button>
                            <button 
                              onClick={() => { if (window.confirm('Delete this automation? This cannot be undone.')) { handleDeleteAutomation(a._id); } }}
                              className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-300 flex items-center justify-center gap-1"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center text-center py-16 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl transition-colors duration-300'>
                      <FiMessageSquare size={48} className='text-gray-300 dark:text-gray-600 mb-4 transition-colors duration-300' />
                      <p className='text-gray-500 dark:text-gray-400 mb-4 text-sm transition-colors duration-300'>No active campaigns found. Start automating your workflow!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm p-8 rounded-xl min-h-[400px] flex flex-col items-start transition-colors duration-300'>
                <div className="flex justify-between w-full items-center mb-6">
                  <div>
                    <h2 className='text-2xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300'>CRM Contacts</h2>
                    <p className='text-gray-500 dark:text-gray-400 text-sm max-w-md transition-colors duration-300'>Manage your WhatsApp contacts, segment lists, and view engagement histories.</p>
                  </div>
                  <button onClick={() => setShowContactModal(true)} className='px-5 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-all text-sm flex items-center gap-2'>
                    <span>+</span> Add Contact
                  </button>
                </div>
                
                <div className="w-full">
                  {loadingData ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400 transition-colors duration-300">Loading contacts...</div>
                  ) : contacts.length > 0 ? (
                    <div className="overflow-x-auto w-full border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-300">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 transition-colors duration-300">Name</th>
                            <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 transition-colors duration-300">Phone</th>
                            <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 transition-colors duration-300">Segment</th>
                            <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 transition-colors duration-300">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 transition-colors duration-300">
                          {contacts.map((c, i) => (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300">
                              <td className="px-4 py-3 font-medium text-gray-800 dark:text-white transition-colors duration-300">{c.firstName || c.name || 'Unnamed Lead'}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 transition-colors duration-300">{c.phone || c.whatsappNumber || 'N/A'}</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded text-xs font-semibold transition-colors duration-300">✅ WhatsApp Ready</span></td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => { if (window.confirm('Delete this contact? This cannot be undone.')) { handleDeleteContact(c._id); } }}
                                  className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-300"
                                >
                                  🗑️ Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center text-center py-16 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl transition-colors duration-300'>
                      <FiUser size={48} className='text-gray-300 dark:text-gray-600 mb-4 transition-colors duration-300' />
                      <p className='text-gray-500 dark:text-gray-400 mb-4 text-sm transition-colors duration-300'>No contacts in your CRM. Import them to start sending messages.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm p-8 rounded-xl min-h-[400px] flex flex-col items-start transition-colors duration-300'>
                <h2 className='text-2xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300'>Billing & Payments</h2>
                <p className='text-gray-500 dark:text-gray-400 mb-6 text-sm transition-colors duration-300'>Manage your subscription, view payment history, and update billing methods.</p>
                
                {user?.isDeveloper ? (
                  <div className="w-full bg-gradient-to-r from-slate-800 dark:from-slate-900 to-gray-900 dark:to-gray-950 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4 mb-8 shadow-md border border-gray-700 dark:border-gray-600 transition-all duration-300">
                    <div>
                      <div className="flex items-center gap-3"><h3 className="text-lg font-bold text-white dark:text-white transition-colors duration-300">Current Plan: Max Tier</h3><span className="bg-emerald-500 dark:bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider transition-colors duration-300">Developer Unlocked</span></div>
                      <p className="text-sm text-gray-300 dark:text-gray-400 mt-1 transition-colors duration-300">All premium features are unlocked forever for testing and maintenance.</p>
                    </div>
                  </div>
                ) : (
                  <div className={`w-full ${user?.subscription?.plan && user?.subscription?.plan !== 'free' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700' : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-700'} border rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4 mb-8 transition-colors duration-300`}>
                    <div>
                      <h3 className={`text-lg font-bold ${user?.subscription?.plan && user?.subscription?.plan !== 'free' ? 'text-emerald-900 dark:text-emerald-400' : 'text-indigo-900 dark:text-indigo-400'} transition-colors duration-300`}>
                        Current Plan: {user?.subscription?.plan && user?.subscription?.plan !== 'free' ? user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1) : 'Free / Trial'} Tier
                      </h3>
                      {user?.subscription?.plan && user?.subscription?.plan !== 'free' ? (
                        <p className={`text-sm mt-1 ${user?.subscription?.plan && user?.subscription?.plan !== 'free' ? 'text-emerald-700 dark:text-emerald-400' : 'text-indigo-700 dark:text-indigo-400'} transition-colors duration-300`}>
                          Active subscription. Valid until {new Date(user.subscription.endDate).toLocaleDateString()}.
                        </p>
                      ) : (
                        <p className={`text-sm mt-1 text-indigo-700 dark:text-indigo-400 transition-colors duration-300`}>
                          {user?.trial?.isActive ? `Trial active (${calculateDaysLeft(user.trial.endDate)} days left). ` : 'Trial ended! '}
                          Upgrade to unlock unlimited API limits and advanced integrations.
                        </p>
                      )}
                    </div>
                    {(!user?.subscription?.plan || user?.subscription?.plan === 'free') && (
                      <button onClick={() => openPaymentModal('Extension', 14900)} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-bold rounded-xl shadow-md border-b-4 border-amber-700 dark:border-amber-800 active:border-b-0 active:translate-y-1 transition-all whitespace-nowrap flex items-center justify-center gap-2">
                        <span>⚡</span> Extend Trial (2 Days) for ₹149
                      </button>
                    )}
                  </div>
                )}

                <h3 className='text-lg font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300'>Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  {/* Basic */}
                  <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col hover:shadow-lg dark:hover:shadow-lg/50 transition-all items-start duration-300 relative">
                    <div className="absolute top-0 left-0 bg-blue-500 dark:bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg rounded-tl-xl transition-colors duration-300">STARTER</div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white transition-colors duration-300 pt-2">Basic</h4>
                    <p className="text-3xl font-black text-gray-900 dark:text-white mt-4 mb-1 transition-colors duration-300">₹999<span className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">/mo</span></p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 block w-full border-b border-gray-100 dark:border-gray-700 pb-4 transition-colors duration-300">Essential features for small businesses.</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-3 mb-6 w-full transition-colors duration-300">
                      <li className="flex items-center"><FiCheck className="text-emerald-500 dark:text-emerald-400 mr-2"/> 20 Automations</li>
                      <li className="flex items-center"><FiCheck className="text-emerald-500 dark:text-emerald-400 mr-2"/> 50 Contacts</li>
                      <li className="flex items-center"><FiCheck className="text-emerald-500 dark:text-emerald-400 mr-2"/> Create & Delete</li>
                      <li className="flex items-center"><FiCheck className="text-emerald-500 dark:text-emerald-400 mr-2"/> 1,000 Messages/mo</li>
                      <li className="flex items-center"><FiCheck className="text-emerald-500 dark:text-emerald-400 mr-2"/> Basic AI Bot</li>
                    </ul>
                    <button onClick={() => openPaymentModal('Basic', 99900)} className="w-full py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors duration-300 mt-auto">Choose Basic</button>
                  </div>
                  {/* Pro */}
                  <div className="border-2 border-emerald-500 dark:border-emerald-600 bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col shadow-md dark:shadow-lg/50 relative items-start transition-colors duration-300">
                    <div className="absolute top-0 right-0 bg-emerald-500 dark:bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-sm transition-colors duration-300">RECOMMENDED</div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Pro</h4>
                    <p className="text-3xl font-black text-gray-900 dark:text-white mt-4 mb-1 transition-colors duration-300">₹1,999<span className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">/mo</span></p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 block w-full border-b border-gray-100 dark:border-gray-700 pb-4 transition-colors duration-300">Advanced automations and unlimited chats.</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-3 mb-6 w-full transition-colors duration-300">
                      <li className="flex items-center"><FiCheck className="text-emerald-500 dark:text-emerald-400 mr-2"/> 100 Automations</li>
                      <li className="flex items-center"><FiCheck className="text-emerald-500 dark:text-emerald-400 mr-2"/> 500 Contacts</li>
                      <li className="flex items-center"><FiCheck className="text-emerald-500 dark:text-emerald-400 mr-2"/> Full Manage & Delete</li>
                      <li className="flex items-center"><FiCheck className="text-emerald-500 dark:text-emerald-400 mr-2"/> 10,000 Messages/mo</li>
                      <li className="flex items-center"><FiCheck className="text-emerald-500 dark:text-emerald-400 mr-2"/> Advanced AI Models</li>
                      <li className="flex items-center"><FiCheck className="text-emerald-500 dark:text-emerald-400 mr-2"/> Webhook Access</li>
                    </ul>
                    <button onClick={() => openPaymentModal('Pro', 199900)} className="w-full py-2 bg-emerald-600 dark:bg-emerald-700 text-white  font-bold rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-800 transition-colors duration-300 mt-auto">Choose Pro</button>
                  </div>
                  {/* Max */}
                  <div className="border-2 border-emerald-600 dark:border-emerald-500 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20 rounded-xl p-6 flex flex-col shadow-lg dark:shadow-lg/50 relative items-start transition-all duration-300">
                    <div className="absolute top-0 right-0 bg-emerald-600 dark:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl transition-colors duration-300">BEST VALUE</div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Max</h4>
                    <p className="text-3xl font-black text-gray-900 dark:text-white mt-4 mb-1 transition-colors duration-300">₹4,999<span className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">/mo</span></p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 block w-full border-b border-gray-100 dark:border-gray-700 pb-4 transition-colors duration-300">Full API access and custom integrations.</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-3 mb-6 w-full transition-colors duration-300">
                      <li className="flex items-start gap-2"><FiCheck className="text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5"/> <span>Complete Management Tools</span></li>
                      <li className="flex items-start gap-2"><FiCheck className="text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5"/> <span>Batch Create & Delete</span></li>
                      <li className="flex items-start gap-2"><FiCheck className="text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5"/><span><span className="font-semibold text-emerald-700 dark:text-emerald-400 transition-colors duration-300">Unlimited</span> Messages</span></li>
                      <li className="flex items-start gap-2"><FiCheck className="text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5"/> <span>24/7 Dedicated Support</span></li>
                      <li className="flex items-start gap-2"><FiCheck className="text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5"/> <span>Custom Integrations</span></li>
                    </ul>
                    <button onClick={() => openPaymentModal('Max', 499900)} className="w-full py-2 bg-emerald-600 dark:bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-colors duration-300 mt-auto shadow-md">Choose Max</button>
                  </div>
                </div>
              </div>
            )}



          </div>
        </main>
      </div>


      {/* Payment Upgrade Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal 
          plan={selectedPlan.name}
          amount={selectedPlan.amount} 
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePaymentSubmit}
          loading={paymentLoading}
        />
      )}

      {/* Create Automation Modal */}
      {showAutomationModal && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-colors duration-300" onClick={() => setShowAutomationModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl dark:shadow-2xl/50 p-8 max-w-lg w-full border border-slate-200 dark:border-gray-700 transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Create New Campaign</h2>
              <button 
                onClick={() => setShowAutomationModal(false)}
                className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <FiX className="text-gray-500 dark:text-gray-400 transition-colors duration-300" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAutomationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Campaign Name</label>
                <input 
                  type="text" 
                  value={newAutomation.name}
                  onChange={(e) => setNewAutomation({...newAutomation, name: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300" 
                  placeholder="e.g., Welcome Sequence"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Trigger Event</label>
                  <select 
                    value={newAutomation.triggerEvent}
                    onChange={(e) => setNewAutomation({...newAutomation, triggerEvent: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300"
                  >
                    <option value="message_received">Message Received</option>
                    <option value="user_inactive">User Inactive</option>
                    <option value="booking_upcoming">Booking Upcoming</option>
                    <option value="payment_pending">Payment Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Action</label>
                  <select 
                    value={newAutomation.actionType}
                    onChange={(e) => setNewAutomation({...newAutomation, actionType: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300"
                  >
                    <option value="send_message">Send Reply</option>
                    <option value="send_whatsapp">Send WhatsApp Message</option>
                    <option value="send_email">Send Email</option>
                    <option value="send_sms">Send SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Message Template</label>
                <textarea 
                  value={newAutomation.template}
                  onChange={(e) => setNewAutomation({...newAutomation, template: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-emerald-400 h-28 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300" 
                  placeholder="Type your message template here..."
                ></textarea>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Variables permitted: &#123;name&#125;, &#123;company&#125;</p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 transition-colors duration-300">
                <button type="button" onClick={() => setShowAutomationModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors duration-300 shadow-md">Create Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-colors duration-300" onClick={() => setShowContactModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl dark:shadow-2xl/50 p-8 max-w-sm w-full border border-slate-200 dark:border-gray-700 transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Add CRM Contact</h2>
              <button 
                onClick={() => setShowContactModal(false)}
                className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <FiX className="text-gray-500 dark:text-gray-400 transition-colors duration-300" size={20} />
              </button>
            </div>

            <form onSubmit={handleImportContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">First Name</label>
                <input 
                  type="text" 
                  value={newContact.firstName}
                  onChange={(e) => setNewContact({...newContact, firstName: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300" 
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">WhatsApp Target Phone</label>
                <input 
                  type="text" 
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300" 
                  placeholder="e.g., +1234567890"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 transition-colors duration-300">
                <button type="button" onClick={() => setShowContactModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-xl font-bold transition-colors duration-300 shadow-md">Add Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl dark:shadow-2xl p-8 max-w-md w-full border border-slate-200 dark:border-gray-700 transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Profile Settings</h2>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
              >
                <FiX className="text-gray-500 dark:text-gray-400 transition-colors duration-300" size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">First Name</label>
                  <input 
                    type="text" 
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Last Name</label>
                  <input 
                    type="text" 
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Company / Branch</label>
                <input 
                  type="text" 
                  value={profileData.company}
                  onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300" 
                  placeholder="e.g., Acme Corp."
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 hover:cursor-pointer mt-4 transition-colors duration-300">
                <button type="button" onClick={() => setShowProfileModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white rounded-xl font-bold transition-all duration-300 shadow-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
