import { useState } from 'react';

interface NameDialogProps {
  defaultName?: string;
  score: number;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function NameDialog({ defaultName = '', score, onSubmit, onCancel }: NameDialogProps) {
  const [name, setName] = useState(defaultName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      onSubmit(trimmed);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center max-w-sm w-full mx-4">
        <h3 className="text-2xl font-bold text-white mb-2">Save Your Score</h3>
        <p className="text-4xl font-bold text-green-400 mb-6">{score}</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-center text-lg focus:outline-none focus:border-green-500 transition-colors mb-4"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={name.trim().length === 0}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
