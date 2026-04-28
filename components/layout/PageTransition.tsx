"use client";

import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }}>
      {children}
    </motion.div>
  );
}
