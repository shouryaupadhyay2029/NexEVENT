import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/layout/Layout';
import { PageContainer } from './components/layout/PageContainer';
import { SectionWrapper } from './components/layout/SectionWrapper';
import { PageTransition } from './components/layout/PageTransition';
import { Button } from './components/ui/Button';
import { LandingPage } from './pages/LandingPage';
import { SignIn } from './pages/Auth/SignIn';
import { SignUp } from './pages/Auth/SignUp';
import { ForgotPassword } from './pages/Auth/ForgotPassword';

const DummyPage = ({ title, desc }) => (
  <PageTransition>
    <PageContainer>
      <SectionWrapper className="min-h-[80vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-display-lg text-primary mb-6">{title}</h1>
        <p className="text-body-lg text-secondary max-w-2xl mx-auto mb-12">
          {desc}
        </p>
        <Button variant="secondary">Back to Top</Button>
      </SectionWrapper>
    </PageContainer>
  </PageTransition>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <LandingPage />
          </PageTransition>
        } />
        
        {/* Authentication Routes */}
        <Route path="/auth/login" element={
          <PageTransition>
            <SignIn />
          </PageTransition>
        } />
        <Route path="/auth/register" element={
          <PageTransition>
            <SignUp />
          </PageTransition>
        } />
        <Route path="/auth/forgot-password" element={
          <PageTransition>
            <ForgotPassword />
          </PageTransition>
        } />

        {/* Existing Routes */}
        <Route path="/events" element={<DummyPage title="Events Directory" desc="Notice the tiny orange underline and brightened typography on the active navigation link above." />} />
        <Route path="/discover" element={<DummyPage title="Discover" desc="Scroll down to see the transparent navigation bar smoothly transition to a blurred state with a hairline bottom border." />} />
        <Route path="/about" element={<DummyPage title="About Us" desc="This page inherited the editorial grid overlay, the noise texture, and the global background system automatically." />} />
        <Route path="/support" element={<DummyPage title="Support" desc="Premium architectural foundation complete." />} />
        <Route path="*" element={<DummyPage title="404 Not Found" desc="This route doesn't exist." />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
