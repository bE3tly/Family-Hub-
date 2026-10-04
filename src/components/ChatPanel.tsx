import { useState } from 'react';
import { Message } from '../types';
import { clsx } from 'clsx';

function normalizeTime(time: string): string {
  if (/[ap]m/i.test(time)) return time;
  const [hour, minute] = time.split(':').map(Number);
  if (isNaN(hour) || isNaN(minute)) return time;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

interface ChatPanelProps {
  messages: Message[];
}

function PracticeCard({ question, answer }: { question: string; answer: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
      <p className="text-sm text-gray-200 mb-2">{question}</p>
      <button 
        onClick={() => setShow(!show)}
        className="text-amber-500 text-xs font-semibold hover:text-amber-400"
      >
        {show ? 'Hide answer' : 'Show answer'}
      </button>
      {show && <p className="text-sm text-gray-400 mt-2 pt-2 border-t border-gray-700">{answer}</p>}
    </div>
  );
}

export default function ChatPanel({ messages }: ChatPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className="space-y-4">
          <div
            className={clsx(
              'p-4 rounded-2xl max-w-[80%]',
              msg.role === 'user' ? 'bg-gray-800 ml-auto' : 'bg-gray-900 border border-gray-700'
            )}
          >
            {msg.mode === 'Education' && msg.role === 'assistant' ? (
              msg.content.split('\n\n').map((chunk, i) => (
                <p key={i} className={clsx("text-gray-100", i > 0 && "mt-4")}>{chunk}</p>
              ))
            ) : (
              <p className="text-gray-100">{msg.content}</p>
            )}
          </div>
          
          {msg.data && (
            <div className="ml-4 space-y-4">
              {msg.data.mealPlan && (
                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
                  <h3 className="text-amber-500 font-bold mb-3">Meal Plan</h3>
                  <div className="space-y-2">
                    {msg.data.mealPlan.map((p: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded bg-gray-900/50">
                        <span className="font-bold text-amber-500 min-w-[80px]">{p.day}</span>
                        <span className="text-sm text-gray-200">{p.meal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {msg.data.shoppingList && (
                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
                  <h3 className="text-amber-500 font-bold mb-3">Shopping List</h3>
                  <div className="space-y-4">
                    {msg.data.shoppingList.map((l: any, i: number) => {
                      const uniqueItems = Array.from(new Set(l.items));
                      return (
                        <div key={i}>
                          <h4 className="font-semibold text-amber-400 text-sm mb-1">{l.category}</h4>
                          <ul className="list-disc list-inside text-sm text-gray-300">
                            {uniqueItems.map((item: any, j: number) => <li key={j}>{item}</li>)}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {msg.data.scheduleItems && (
                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
                  <h3 className="text-amber-500 font-bold mb-2">Schedule</h3>
                  <div className="space-y-2">
                    {msg.data.scheduleItems.map((s: any, i: number) => (
                      <div key={i} className={clsx("flex items-center gap-3 p-2 rounded", s.conflict ? "border border-amber-500" : "")}>
                        <span className="text-xs font-mono text-gray-400">{normalizeTime(s.time)}</span>
                        <span className="text-sm text-gray-100">{s.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {msg.data.reminders && (
                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
                  <h3 className="text-amber-500 font-bold mb-2">Reminders</h3>
                  <ul className="list-disc list-inside text-sm text-gray-300">
                    {msg.data.reminders.map((r: any, i: number) => (
                      <li key={i}><span className="font-mono text-xs">{normalizeTime(r.time)}</span>: {r.note}</li>
                    ))}
                  </ul>
                </div>
              )}
              {msg.data.practiceQuestions && (
                <div className="space-y-2">
                  <h3 className="text-amber-500 font-bold mb-2">Practice</h3>
                  {msg.data.practiceQuestions.map((q: any, i: number) => (
                    <PracticeCard key={i} question={q.question} answer={q.answer} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
