import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string | number }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, placeholder, className, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-war-gray text-xs font-orbitron uppercase tracking-wider">{label}</label>}
    <select 
      className={`bg-war-panel border border-zinc-700 rounded p-2 text-white font-roboto focus:border-war-red focus:outline-none transition-colors ${className || ''}`} 
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);