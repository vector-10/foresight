'use client';
import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [messages, setMessages] = useState<Array<{role: 'user'|'agent', text: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Call your treasury analysis
      const res = await fetch('/api/analyze', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'agent', text: data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'agent', text: 'Error analyzing treasury' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Messages */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl rounded-lg p-4 ${
                msg.role === 'user' 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-slate-800 text-white border border-cyan-400/20'
              }`}>
                <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
              </div>
            </div>
          ))}
          {loading && <div className="flex items-center gap-2 text-cyan-400"><Loader2 className="animate-spin" /> Analyzing...</div>}
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about treasury health..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400"
            />
            <button onClick={sendMessage} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg disabled:opacity-50">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}