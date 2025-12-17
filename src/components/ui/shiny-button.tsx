"use client";

import React from "react";
import { motion, type AnimationProps } from "framer-motion";

import { cn } from "@/lib/utils";

const animationProps: AnimationProps = {
  initial: { "--x": "100%", scale: 0.8 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
};

interface ShinyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const ShinyButton: React.FC<ShinyButtonProps> = ({
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <motion.button
      {...(disabled ? {} : animationProps)}
      {...props}
      disabled={disabled}
      className={cn(
        "relative overflow-hidden rounded-lg px-6 py-2 font-medium transition-all duration-300 ease-in-out bg-[var(--accent)] hover:bg-[#8ba5f0] hover:shadow-[0_0_20px_rgba(124,153,227,0.4)]",
        className
      )}
    >
      <span
        className="relative z-20 block size-full text-sm uppercase tracking-wide font-semibold text-white"
        style={{
          maskImage:
            "linear-gradient(-75deg, rgba(255,255,255,1) calc(var(--x) + 20%), rgba(255,255,255,0.4) calc(var(--x) + 30%), rgba(255,255,255,1) calc(var(--x) + 100%))",
          WebkitMaskImage:
            "linear-gradient(-75deg, rgba(255,255,255,1) calc(var(--x) + 20%), rgba(255,255,255,0.4) calc(var(--x) + 30%), rgba(255,255,255,1) calc(var(--x) + 100%))",
        }}
      >
        {children}
      </span>
      <span
        style={{
          mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
        className="absolute right-0 bottom-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,rgba(255,255,255,0.1)_calc(var(--x)+20%),rgba(255,255,255,0.5)_calc(var(--x)+25%),rgba(255,255,255,0.1)_calc(var(--x)+100%))] p-px"
      ></span>
    </motion.button>
  );
};

export default { ShinyButton };

