import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-war-gray text-xs font-orbitron uppercase tracking-wider">{label}</label>}
    <input 
      className={`bg-war-panel border border-zinc-700 rounded p-2 text-white font-mono focus:border-war-red focus:outline-none transition-colors ${className || ''}`} 
      {...props} 
    />
  </div>
);