'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authInputClass } from './AuthShell';

// Input kata sandi dengan tombol tampilkan/sembunyikan.
export default function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  placeholder?: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={visible ? 'text' : 'password'}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${authInputClass} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        title={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-paper/50 transition-colors hover:bg-paper/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {visible ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
      </button>
    </div>
  );
}
