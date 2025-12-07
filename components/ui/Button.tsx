import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, children, ...props }) => {
  const baseStyles = "font-orbitron uppercase tracking-wider font-bold py-3 px-6 rounded transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]";
  
  const variants = {
    primary: "bg-war-red text-white hover:bg-red-600 shadow-[0_0_10px_rgba(255,45,45,0.3)]",
    secondary: "bg-zinc-800 text-gray-300 border border-zinc-600 hover:bg-zinc-700 hover:text-white",
    danger: "bg-red-900/50 text-red-200 border border-red-800 hover:bg-red-900",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};