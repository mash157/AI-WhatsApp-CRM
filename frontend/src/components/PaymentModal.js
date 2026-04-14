import React from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const PaymentModal = ({ plan, amount, onClose, onConfirm, loading }) => {
  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <motion.div
      variants={backgroundVariants}
      initial="hidden"
      animate="visible"
      onClick={onClose}
      className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-slate-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text">Upgrade Plan</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-all"
          >
            <FiX className="text-red-500" size={20} />
          </motion.button>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 mb-6 border border-blue-200">
          <p className="text-slate-600 text-sm mb-2">Plan: {plan.toUpperCase()}</p>
          <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text mb-2">
            ₹{(amount / 100).toFixed(0)}
          </div>
          <p className="text-slate-600">{plan.toLowerCase().includes('extension') ? 'One-time payment • 2 Days Access' : 'per month • Billed monthly'}</p>
        </div>

        <div className="space-y-3 mb-8">
          {[
            'Unlimited chat messages',
            'Advanced AI features',
            'Priority support',
            'Custom workflows',
            'Team collaboration',
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="p-1 rounded-lg bg-green-500/20 mt-1">
                <FiCheck className="text-green-400" size={16} />
              </div>
              <span className="text-slate-800">{feature}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onConfirm('razorpay')}
            disabled={loading}
            className="w-full bg-[#3395FF] hover:bg-[#2b80df] text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-all shadow-md flex justify-center items-center gap-2"
          >
            {loading ? 'Processing...' : 'Pay with Razorpay (INR / UPI)'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onConfirm('stripe')}
            disabled={loading}
            className="w-full bg-[#635BFF] hover:bg-[#5249e5] text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-all shadow-md flex justify-center items-center gap-2"
          >
            {loading ? 'Processing...' : 'Pay with Stripe (USD / Card)'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full bg-slate-100 rounded-xl py-3 font-semibold text-slate-900 hover:bg-slate-200 transition-all mt-2"
          >
            Cancel
          </motion.button>
        </div>

        <p className="text-slate-500 text-xs text-center mt-4">
          Secure payment options • 256-bit encryption
        </p>
      </motion.div>
    </motion.div>
  );
};

export default PaymentModal;

