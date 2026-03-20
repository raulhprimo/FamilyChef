import { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../types';

type CurrencyInputProps = {
  value: number; // cents
  onChange: (cents: number) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

/**
 * Input monetário que aceita valores em reais (ex: "49,90" ou "49.90")
 * e converte internamente para centavos.
 */
function CurrencyInput({ value, onChange, placeholder = 'R$ 0,00', className, autoFocus }: CurrencyInputProps) {
  const [display, setDisplay] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync display when value changes externally
  useEffect(() => {
    if (value === 0) {
      setDisplay('');
    } else {
      setDisplay((value / 100).toFixed(2).replace('.', ','));
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [autoFocus]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;

    // Allow only digits, comma, dot
    const cleaned = raw.replace(/[^\d,\.]/g, '');
    setDisplay(cleaned);

    // Convert to cents
    // Replace comma with dot for parsing
    const normalized = cleaned.replace(',', '.');
    const parsed = parseFloat(normalized);

    if (isNaN(parsed)) {
      onChange(0);
    } else {
      onChange(Math.round(parsed * 100));
    }
  }

  return (
    <div>
      <div className="mb-2 text-center">
        <p className="font-display text-3xl font-extrabold" style={{ color: '#4ECDC4' }}>
          {formatCurrency(value)}
        </p>
      </div>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        className={className ?? 'w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-3 text-center text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30'}
      />
      <p className="mt-1 text-center text-[11px] text-text-muted">
        Digite em reais (ex: 49,90) ou centavos (ex: 4990)
      </p>
    </div>
  );
}

export default CurrencyInput;
