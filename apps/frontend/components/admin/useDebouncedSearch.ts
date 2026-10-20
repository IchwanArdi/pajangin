'use client';

import { useEffect, useRef, useState } from 'react';

// Menunda nilai pencarian agar request tidak dikirim pada setiap ketikan.
// Filter berupa select tidak memakai hook ini karena perubahannya jarang.
export function useDebouncedSearch(delay = 350) {
  const [value, setValue] = useState('');
  const [applied, setApplied] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function update(next: string) {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setApplied(next.trim()), delay);
  }

  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setValue('');
    setApplied('');
  }

  return { value, applied, update, reset };
}
