import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../hooks/useAuth';

export const SocialLogin = ({ onClose }) => {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await googleLogin();
      if (result && result.error) {
        setError(result.error);
      } else {
        if (onClose) onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {error && (
        <div className="p-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-500 text-sm mb-2">
          {error}
        </div>
      )}
      <motion.button
        onClick={handleGoogleLogin}
        whileHover={!loading ? { y: -2 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        className={`w-full h-12 rounded-[14px] bg-white text-black font-ui font-medium text-body flex items-center justify-center gap-3 transition-shadow ${
          loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_4px_14px_0_rgba(255,255,255,0.2)]'
        }`}
        type="button"
        disabled={loading}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </>
        )}
      </motion.button>
    </div>
  );
};
