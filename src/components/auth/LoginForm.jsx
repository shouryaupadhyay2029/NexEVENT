import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthInput } from './AuthInput';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm = ({ onSwitchState, onClose }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        // Success
        if (onClose) onClose();
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
      
      <div className="flex flex-col gap-4 mb-6">
        <AuthInput 
          type="email" 
          placeholder="Email address" 
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <AuthInput 
          type="password" 
          placeholder="Password" 
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <div className="flex justify-end mt-1">
          <button 
            type="button"
            onClick={() => onSwitchState('forgotPassword')}
            className="text-small text-secondary hover:text-accent transition-colors"
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>
      </div>
      
      <motion.button
        whileHover={!loading ? { y: -2 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        className={`w-full h-12 rounded-[14px] bg-accent text-white font-ui font-medium text-body flex items-center justify-center transition-colors shadow-[0_4px_14px_0_rgba(201,106,43,0.3)] ${
          loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-accent-hover'
        }`}
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          'Continue'
        )}
      </motion.button>
    </form>
  );
};
