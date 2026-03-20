import { useRef, useEffect } from 'react';
import { formatCurrency } from '../types';

type CurrencyInputProps = {
  value: number; // cents
  onChange: (cents: number) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

/**
 * Input monetário estilo ATM brasileiro.
 * Digita-se apenas números, os dígitos preenchem da direita para a esquerda:
 *   "5"    → R$ 0,05
 *   "50"   → R$ 0,50
 *   "4990" → R$ 49,90
 * Sem ambiguidade — o valor é sempre em centavos internamente.
 */
function CurrencyInput({ value, onChange, autoFocus }: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [autoFocus]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Keep only digits
    const digits = e.target.value.replace(/\D/g, '');
    const cents = Number(digits);
    onChange(cents);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // Allow backspace to remove last digit
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValue = Math.floor(value / 10);
      onChange(newValue);
    }
  }

  // Hidden value for the input (just digits for easy editing)
  const rawDigits = value === 0 ? '' : String(value);

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
        inputMode="numeric"
        value={rawDigits}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="0"
        className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-3 text-center text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
      />
      <p className="mt-1 text-center text-[11px] text-text-muted">
        Digite o valor: 4990 = R$ 49,90
      </p>
    </div>
  );
}

export default CurrencyInput;
