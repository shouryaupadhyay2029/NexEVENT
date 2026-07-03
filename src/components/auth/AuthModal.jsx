import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPassword } from './ForgotPassword';
import { AuthDivider } from './AuthDivider';
import { SocialLogin } from './SocialLogin';

export const AuthModal = ({ isOpen, onClose, initialView = 'login' }) => {
  const [view, setView] = useState(initialView);
  const modalRef = useRef(null);

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const titles = {
    login: {
      title: "Welcome Back",
      subtitle: "Continue to your NexEvent account."
    },
    signup: {
      title: "Create Account",
      subtitle: "Join the NexEvent community."
    },
    forgotPassword: {
      title: "Reset Password",
      subtitle: "We'll send you a link to reset it."
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/55 backdrop-blur-[10px]"
            onClick={handleBackdropClick}
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0.95, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0.95, scale: 0.97, y: 12 }}
            transition={{ duration: 0.32, ease: [0.25, 1, 0.5, 1] }}
            className="relative w-full max-w-[480px] bg-[#111111]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[32px] overflow-hidden flex flex-col"
          >
            {/* Inner Padding */}
            <div className="p-8 sm:p-10 flex flex-col h-full">
              
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-section-heading text-primary mb-2 font-display">
                  {titles[view].title}
                </h2>
                <p className="text-body text-secondary">
                  {titles[view].subtitle}
                </p>
              </div>

              {/* Dynamic Form Area */}
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {view === 'login' && <LoginForm onSwitchState={setView} onClose={onClose} />}
                    {view === 'signup' && <SignupForm onSwitchState={setView} onClose={onClose} />}
                    {view === 'forgotPassword' && <ForgotPassword onSwitchState={setView} onClose={onClose} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Social Login & Footer (Only for Login/Signup) */}
              {view !== 'forgotPassword' && (
                <div className="mt-2">
                  <AuthDivider text="or continue with" />
                  <SocialLogin onClose={onClose} />
                </div>
              )}

              {/* Footer Links */}
              {view !== 'forgotPassword' && (
                <div className="mt-8 text-center">
                  <p className="text-body text-secondary">
                    {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                      className="text-primary hover:text-accent font-medium transition-colors outline-none focus-visible:underline"
                    >
                      {view === 'login' ? "Create account" : "Sign in"}
                    </button>
                  </p>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
