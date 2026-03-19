import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../api';

function ReportChat({ reportId }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm your MedBios AI clinical assistant. I've analyzed this report. What would you like to know about the results?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const resp = await sendChatMessage(reportId, userMsg);
      setMessages(prev => [...prev, { role: 'assistant', text: resp.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting to the reasoning engine right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card flex flex-col h-[500px]">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-subtle">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-blue"></span>
        </span>
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">AI Report Assistant</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white' 
                : 'bg-white/5 border border-border-subtle text-text-secondary'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white/5 border border-border-subtle flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="relative mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about high glucose, diet, or risks..."
          className="w-full bg-bg-primary/50 border border-border-subtle rounded-xl pl-4 pr-12 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-accent-blue hover:bg-accent-blue/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ReportChat;
