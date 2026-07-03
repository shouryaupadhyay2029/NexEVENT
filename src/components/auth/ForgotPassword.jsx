import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthInput } from './AuthInput';
import { useAuth } from '../../hooks/useAuth';

export const ForgotPassword = ({ onSwitchState, onClose }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const result = await resetPassword(email);
      if (result && result.error) {
        setError(result.error);
      } else {
        setSuccessMsg('Password reset email has been sent.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col w-full h-full" onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 rounded-[10px] bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
          {successMsg}
        </div>
      )}
      
      <div className="flex flex-col gap-4 mb-6">
        <AuthInput 
          type="email" 
          placeholder="Email address" 
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || !!successMsg}
        />
      </div>
      
      <motion.button
        whileHover={(!loading && !successMsg) ? { y: -2 } : {}}
        whileTap={(!loading && !successMsg) ? { scale: 0.98 } : {}}
        className={`w-full h-12 rounded-[14px] bg-accent text-white font-ui font-medium text-body flex items-center justify-center transition-colors shadow-[0_4px_14px_0_rgba(201,106,43,0.3)] mb-4 ${
          (loading || successMsg) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-accent-hover'
        }`}
        type="submit"
        disabled={loading || !!successMsg}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          'Send Reset Link'
        )}
      </motion.button>
      
      <div className="flex justify-center">
        <button 
          type="button"
          onClick={() => onSwitchState('login')}
          className="text-small text-secondary hover:text-primary transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Login
        </button>
      </div>
    </form>
  );
};
