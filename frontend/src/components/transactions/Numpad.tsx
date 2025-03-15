import React from 'react';

interface NumpadProps {
  onInput: (value: string) => void;
  onClear: () => void;
}

export const Numpad: React.FC<NumpadProps> = ({ onInput, onClear }) => {
  const numbers = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '0',
  ];

  return (
    <div className="grid grid-cols-3 gap-2" data-testid="numpad">
      {numbers.map((num) => (
        <button
          key={num}
          onClick={() => onInput(num)}
          className={`
            p-4 text-xl font-medium rounded-lg
            bg-gray-100 hover:bg-gray-200
            active:bg-gray-300 transition-colors
            ${num === '0' ? 'col-span-2' : ''}
          `}
        >
          {num}
        </button>
      ))}
      <button
        onClick={onClear}
        className="p-4 text-xl font-medium rounded-lg bg-red-100 hover:bg-red-200 active:bg-red-300 transition-colors text-red-600"
      >
        クリア
      </button>
    </div>
  );
}; 