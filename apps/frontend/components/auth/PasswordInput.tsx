'use client';

import { useState } from 'react';
import { inputClass } from './AuthShell';

// Input kata sandi dengan tombol tampilkan/sembunyikan
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
        className={`${inputClass} pr-20`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        className="absolute inset-y-0 right-0 px-4 text-xs font-semibold text-ink-2 hover:text-ink focus-visible:outline-none focus-visible:underline"
      >
        {visible ? 'Sembunyi' : 'Lihat'}
      </button>
    </div>
  );
}
