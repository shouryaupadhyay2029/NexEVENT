import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for a non-bouncy, premium reveal
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      className="w-full flex-grow flex flex-col"
    >
      {children}
    </motion.div>
  );
};
