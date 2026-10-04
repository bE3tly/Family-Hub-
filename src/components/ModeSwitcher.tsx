import { AssistantMode } from '../types';
import { clsx } from 'clsx';

interface ModeSwitcherProps {
  currentMode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
}

const modes: AssistantMode[] = ['Productivity', 'Home & Lifestyle', 'Education'];

export default function ModeSwitcher({ currentMode, onModeChange }: ModeSwitcherProps) {
  return (
    <div className="flex bg-[#15151A] p-1 rounded-full border border-gray-800 shadow-inner w-full sm:w-auto">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={clsx(
            'flex-1 sm:flex-none px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap',
            currentMode === mode 
              ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-900/40' 
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
          )}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
