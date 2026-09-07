import React, { useState } from 'react';
import { FiAlertCircle, FiX, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';

const TrialAlert = ({ daysRemaining, onUpgrade, onDismiss }) => {
  const [dismissed, setDismissed] = useState(false);

  if (daysRemaining > 1 || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl p-4 mb-6 border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-transparent shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-3 rounded-full bg-amber-100"
          >
            <FiZap className="text-amber-600" size={24} />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-lg">Trial Expiring Soon!</h3>
            <p className="text-slate-600 text-sm mt-2 mb-4">
              Your free trial expires in <span className="font-semibold text-amber-600">{daysRemaining} day{daysRemaining > 1 ? 's' : ''}</span>. 
              Upgrade now to continue using all premium features.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUpgrade}
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-semibold text-sm transition-all shadow-lg"
            >
              Upgrade Now
            </motion.button>
          </div>
        </div>
        <motion.button
          whileHover={{ rotate: 90 }}
          onClick={handleDismiss}
          className="text-slate-400 hover:text-amber-600 transition-colors flex-shrink-0"
        >
          <FiX size={24} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TrialAlert;

