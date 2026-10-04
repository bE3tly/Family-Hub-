/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * README:
 * This is the FOUNDATION LAYER ONLY of "Family Hub".
 * - Visual shell implemented with Tailwind and Framer Motion.
 * - Conversation UI uses mock data and hardcoded responses.
 * - Boundary seam is in `services/assistant.ts` for future API integration.
 */

import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { AssistantMode, Message, OrbState } from './types';
import VoiceOrb from './components/VoiceOrb';
import ChatPanel from './components/ChatPanel';
import ModeSwitcher from './components/ModeSwitcher';
import { getAssistantResponse } from './services/assistant';

export default function App() {
  const [mode, setMode] = useState<AssistantMode>('Productivity');
  const [messages, setMessages] = useState<Message[]>([]);
  const [histories, setHistories] = useState<Record<AssistantMode, HistoryItem[]>>({
    'Productivity': [],
    'Home & Lifestyle': [],
    'Education': []
  });
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        setInputValue(event.results[0][0].transcript);
        setIsListening(false);
        setOrbState('idle');
      };
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setOrbState('idle');
        setMicError('Voice input unavailable — try typing instead');
        setTimeout(() => setMicError(null), 3000);
      };
      recognition.onend = () => {
        setIsListening(false);
        setOrbState('idle');
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setMicError(null);
      try {
        setIsListening(true);
        setOrbState('listening');
        recognitionRef.current?.start();
      } catch (e) {
        console.error('Speech recognition start error', e);
        setIsListening(false);
        setOrbState('idle');
        setMicError('Voice input unavailable — try typing instead');
        setTimeout(() => setMicError(null), 3000);
      }
    }
  };

  const speak = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onstart = () => setOrbState('speaking');
    utterance.onend = () => setOrbState('idle');
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: inputValue, mode };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setOrbState('thinking');

    const { content, data } = await getAssistantResponse(mode, userMessage.content, histories[mode]);
    
    const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content, mode, data };
    setMessages((prev) => [...prev, assistantMessage]);
    
    setHistories(prev => {
      const modeHistory = [...prev[mode], { role: 'user', content: userMessage.content }, { role: 'assistant', content }];
      return { ...prev, [mode]: modeHistory.slice(-6) };
    });
    
    speak(content);
  };

  const [showClearMenu, setShowClearMenu] = useState(false);
  const handleClearChat = () => {
    setMessages(prev => prev.filter(m => m.mode !== mode));
    setHistories(prev => ({ ...prev, [mode]: [] }));
    setShowClearMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-gray-100 flex flex-col font-sans overflow-x-hidden">
      <header className="p-4 sm:p-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-gray-800 w-full relative">
        <div />
        <h1 className="text-2xl font-bold tracking-tight text-center whitespace-nowrap">Family Hub</h1>
        <div className="flex justify-end">
          <button 
            onClick={() => setShowClearMenu(!showClearMenu)} 
            className="p-2 text-gray-500 hover:text-amber-500 transition-colors"
            title="Options"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>
        </div>
        
        <div className="col-span-3">
          <ModeSwitcher currentMode={mode} onModeChange={setMode} />
        </div>
        
        {showClearMenu && (
          <div className="absolute right-4 top-16 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-1 z-50">
            <button 
              onClick={handleClearChat} 
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-red-400 rounded"
            >
              Clear Chat
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 gap-8">
        <VoiceOrb state={orbState} />
        
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm italic animate-pulse">
            {mode === 'Productivity' ? 'Ask me about your schedule' : 
             mode === 'Home & Lifestyle' ? 'Ask me about meal planning' : 
             'Ask me an educational question'}
          </p>
        )}

        <ChatPanel messages={messages} />
        
        {micError && (
          <p className="text-red-500 text-xs text-center">{micError}</p>
        )}
        
        <div className="w-full max-w-2xl bg-[#15151A]/50 border border-gray-800 rounded-3xl p-3 flex flex-col gap-3">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${mode} assistant...`}
            className="w-full bg-transparent p-1 focus:outline-none resize-none overflow-y-auto text-gray-100 placeholder-gray-500"
            style={{ maxHeight: '120px', minHeight: '24px' }}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              {recognitionRef.current && (
                <button 
                  onClick={handleMicToggle}
                  className={clsx(
                    "p-2 rounded-xl transition-colors duration-300", 
                    isListening ? "bg-red-500/20 text-red-500" : "bg-gray-800 text-gray-400"
                  )}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-xl bg-gray-800 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMuted ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12.707 11.293a1 1 0 010 1.414M19.071 5.05a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  )}
                </svg>
              </button>
            </div>
            <button onClick={handleSend} className="px-5 py-2 bg-amber-500 rounded-xl text-black font-bold shadow-lg shadow-amber-900/20 text-sm">Send</button>
          </div>
        </div>
      </main>
    </div>
  );
}
