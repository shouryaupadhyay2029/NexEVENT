import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthenticationLayout } from '../../components/layout/AuthenticationLayout';
import { FormField } from '../../components/ui/FormField';
import { PasswordField } from '../../components/ui/PasswordField';
import { Button } from '../../components/ui/Button';
import { staggerItem, staggerContainer } from '../../animations/framerPresets';

export const SignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/discover');
    }, 1500);
  };

  return (
    <AuthenticationLayout
      title="Join the NexEvent community."
      subtitle="Create an account to start discovering and organizing university events."
    >
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem} className="mb-8">
          <h2 className="text-section-heading text-primary mb-2">Create Account</h2>
          <p className="text-secondary text-body">Enter your details to get started.</p>
        </motion.div>

        <motion.form variants={staggerItem} onSubmit={handleSubmit} className="space-y-6">
          <FormField
            id="fullName"
            type="text"
            label="Full Name"
            required
            autoComplete="name"
          />
          
          <FormField
            id="email"
            type="email"
            label="College Email"
            required
            autoComplete="email"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              id="department"
              type="text"
              label="Department"
              required
            />
            <FormField
              id="year"
              type="text"
              label="Year"
              required
            />
          </div>

          <PasswordField
            id="password"
            label="Password"
            required
            autoComplete="new-password"
          />
          
          <PasswordField
            id="confirmPassword"
            label="Confirm Password"
            required
            autoComplete="new-password"
          />

          <Button 
            type="submit" 
            className="w-full mt-4"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </motion.form>

        <motion.p variants={staggerItem} className="mt-8 text-center text-body text-secondary">
          Already have an account?{' '}
          <Link 
            to="/auth/login" 
            className="text-primary hover:text-accent transition-colors border-b border-transparent hover:border-accent"
          >
            Sign In
          </Link>
        </motion.p>
      </motion.div>
    </AuthenticationLayout>
  );
};
