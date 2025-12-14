'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Key } from 'lucide-react';

interface MagicCodeInputProps {
  onCodeComplete: (code: string) => void;
  isLoading?: boolean;
  error?: string;
  autoFocus?: boolean;
}

export function MagicCodeInput({ 
  onCodeComplete, 
  isLoading = false, 
  error,
  autoFocus = true 
}: MagicCodeInputProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all digits are filled, call onCodeComplete
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      onCodeComplete(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newCode = [...code];
      digits.forEach((digit, index) => {
        if (index < 6) {
          newCode[index] = digit;
        }
      });
      setCode(newCode);
      
      // Focus the last input
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
      
      // Call onCodeComplete if all digits are filled
      if (newCode.every(digit => digit !== '')) {
        onCodeComplete(newCode.join(''));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center gap-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-12 h-14 bg-surface border border-border rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className="w-12 h-14 text-center text-2xl font-mono font-bold bg-background border border-border rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ))}
      </div>
      
      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 text-sm text-red-400 text-center">
          {error}
        </div>
      )}
    </div>
  );
}

