import React, { useState } from 'react';
import { FiMic, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const VoiceInput = ({ onVoiceText }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('❌ Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript(transcript);
          onVoiceText(transcript);
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error('❌ Error in speech recognition');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={startListening}
        disabled={isListening}
        className={`p-3 rounded-full transition-all ${
          isListening
            ? 'bg-red-100 text-red-600 animate-pulse'
            : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
        }`}
      >
        <motion.div
          animate={isListening ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <FiMic size={24} />
        </motion.div>
      </motion.button>
      
      {isListening && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-blue-400 font-medium"
        >
          🎤 Listening...
        </motion.span>
      )}
      
      {transcript && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 flex-1"
        >
          <span className="text-sm text-slate-700 max-w-xs truncate">
            {transcript}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setTranscript('')}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <FiX size={18} />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VoiceInput;

