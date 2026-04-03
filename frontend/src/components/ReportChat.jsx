import { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage } from '../api';

// ── Suggestion sets ──────────────────────────────────────────────────────────
const SUGGESTION_SETS = [
  ['What are my most concerning findings?', 'Explain my glucose levels', 'Are there any urgent issues?'],
  ['Tell me more', 'What should I do first?', 'Is this urgent?'],
  ['What supplements help?', 'How long until I see improvement?', 'What diet changes should I make?'],
  ['What medications are relevant?', 'Should I see a specialist?', 'What follow-up tests do I need?'],
];

// Try asking categories (bottom bar)
const TRY_ASKING = [
  'Explain my abnormal values',
  'What lifestyle changes help?',
  'What is my risk level?',
  'What are the next steps?',
];

// ── Streaming hook ────────────────────────────────────────────────────────────
function useStreamText(fullText, active) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active || !fullText) { setDisplayed(fullText || ''); return; }
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(id);
    }, 15);
    return () => clearInterval(id);
  }, [fullText, active]);
  return displayed;
}

// ── Citation parsing ──────────────────────────────────────────────────────────
const KNOWN_TESTS = [
  'glucose', 'hba1c', 'a1c', 'cholesterol', 'ldl', 'hdl', 'triglycerides',
  'creatinine', 'egfr', 'hemoglobin', 'wbc', 'rbc', 'platelets', 'tsh',
  'alt', 'ast', 'bilirubin', 'sodium', 'potassium', 'calcium', 'uric acid',
  'ferritin', 'vitamin d', 'b12', 'insulin',
];

function parseCitations(text, labValues) {
  if (!labValues?.length) return [];
  const lower = text.toLowerCase();
  return labValues.filter(lv => {
    const name = (lv.test_name || lv.name || '').toLowerCase().replace(/_/g, ' ');
    return name && lower.includes(name) && lv.status && lv.status !== 'normal';
  }).slice(0, 5);
}

// ── Citation chip ─────────────────────────────────────────────────────────────
function CitationChip({ lv }) {
  const name = (lv.test_name || lv.name || '').replace(/_/g, ' ');
  const val = lv.value ? `${lv.value}${lv.unit ? ' ' + lv.unit : ''}` : '';
  const arrow = lv.status?.includes('high') ? '↑' : lv.status?.includes('low') ? '↓' : '';
  const color = lv.status?.includes('critical') ? 'bg-accent-red/15 text-accent-red border-accent-red/30'
    : lv.status?.includes('high') ? 'bg-accent-orange/15 text-accent-orange border-accent-orange/30'
    : 'bg-accent-blue/15 text-accent-blue border-accent-blue/30';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.58rem] font-mono border ${color}`}>
      {name}{val ? ` ${val}` : ''}{arrow && <span className="font-bold">{arrow}</span>}
    </span>
  );
}

// ── Streaming assistant bubble ────────────────────────────────────────────────
function AssistantBubble({ msg, labValues, isLatest, onCopy }) {
  const [feedback, setFeedback] = useState(null); // 'up' | 'down' | null
  const [showActions, setShowActions] = useState(false);
  const displayed = useStreamText(msg.text, isLatest && !msg.error);
  const citations = parseCitations(msg.text, labValues);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
        msg.error
          ? 'bg-accent-red/10 border border-accent-red/20 text-accent-red'
          : 'bg-bg-elevated border border-border-subtle text-text-secondary'
      }`}>
        {displayed}
        {isLatest && displayed.length < (msg.text || '').length && (
          <span className="inline-block w-0.5 h-3.5 bg-accent-blue animate-pulse ml-0.5 align-middle" />
        )}
      </div>

      {/* Citations */}
      {citations.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {citations.map((lv, i) => <CitationChip key={i} lv={lv} />)}
        </div>
      )}

      {/* Hover actions */}
      {showActions && !msg.error && (
        <div className="absolute -top-7 right-0 flex items-center gap-1 bg-bg-card border border-border-subtle rounded-lg px-1.5 py-1 shadow-md fade-in">
          <button
            onClick={() => onCopy(msg.text)}
            className="p-1 rounded hover:bg-bg-secondary text-text-muted hover:text-text-primary transition"
            title="Copy"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => setFeedback(f => f === 'up' ? null : 'up')}
            className={`p-1 rounded hover:bg-bg-secondary transition ${feedback === 'up' ? 'text-accent-green' : 'text-text-muted hover:text-text-primary'}`}
            title="Helpful"
          >
            <svg className="w-3 h-3" fill={feedback === 'up' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </button>
          <button
            onClick={() => setFeedback(f => f === 'down' ? null : 'down')}
            className={`p-1 rounded hover:bg-bg-secondary transition ${feedback === 'down' ? 'text-accent-red' : 'text-text-muted hover:text-text-primary'}`}
            title="Not helpful"
          >
            <svg className="w-3 h-3" fill={feedback === 'down' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function ReportChat({ reportId, labValues = [] }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I'm your MedBios AI assistant. I've analyzed this report and I'm ready to answer questions about your lab values, explain findings, or suggest next steps. What would you like to know?",
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestionSet, setSuggestionSet] = useState(0);
  const [tryIndex, setTryIndex] = useState(0);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg, time: new Date() }]);
    setLoading(true);

    try {
      const resp = await sendChatMessage(reportId, msg);
      setMessages(prev => [...prev, { role: 'assistant', text: resp.answer, time: new Date(), isNew: true }]);
      // Advance suggestion set
      setSuggestionSet(s => (s + 1) % SUGGESTION_SETS.length);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "I'm having trouble connecting to the reasoning engine. Please try again in a moment.",
        time: new Date(),
        error: true,
        isNew: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, reportId]);

  const handleClearChat = () => {
    setMessages([{
      role: 'assistant',
      text: "Chat cleared. How can I help you with your report?",
      time: new Date(),
      isNew: true,
    }]);
    setSuggestionSet(0);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 1500);
    });
  };

  const formatTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentSuggestions = SUGGESTION_SETS[suggestionSet % SUGGESTION_SETS.length];
  const lastAssistantIndex = [...messages].reverse().findIndex(m => m.role === 'assistant');
  const latestAssistantGlobalIndex = lastAssistantIndex >= 0 ? messages.length - 1 - lastAssistantIndex : -1;

  return (
    <div className="glass-card flex flex-col h-[580px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-green border-2 border-bg-card" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">AI Report Assistant</h3>
            <p className="text-[0.6rem] text-text-muted">Powered by MedBios Clinical AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {copiedMsg && <span className="text-[0.55rem] text-accent-green">Copied!</span>}
          <button
            onClick={handleClearChat}
            className="text-[0.6rem] text-text-muted hover:text-text-secondary border border-border-subtle rounded-lg px-2 py-1 transition hover:bg-bg-secondary"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 mb-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
            <div className="max-w-[88%]">
              {msg.role === 'assistant' ? (
                <AssistantBubble
                  msg={msg}
                  labValues={labValues}
                  isLatest={i === latestAssistantGlobalIndex && !!msg.isNew}
                  onCopy={handleCopy}
                />
              ) : (
                <div className="rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed bg-gradient-to-r from-accent-blue to-accent-purple text-white">
                  {msg.text}
                </div>
              )}
              <p className={`text-[0.55rem] text-text-muted mt-0.5 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {formatTime(msg.time)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start fade-in">
            <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-bg-elevated border border-border-subtle flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Suggestion chips after assistant responses */}
        {!loading && messages.length > 1 && messages[messages.length - 1]?.role === 'assistant' && (
          <div className="flex flex-wrap gap-1.5 pl-0.5 fade-in">
            {currentSuggestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-full text-[0.62rem] border border-accent-blue/25 text-accent-blue hover:bg-accent-blue/10 transition"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Try asking bar */}
      <div className="shrink-0 mb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[0.58rem] text-text-muted whitespace-nowrap shrink-0">Try:</span>
          {TRY_ASKING.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="shrink-0 px-2 py-0.5 rounded-md text-[0.58rem] bg-bg-secondary border border-border-subtle text-text-muted hover:text-text-secondary hover:border-accent-blue/30 transition whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your results..."
          className="w-full bg-bg-primary/50 border border-border-subtle rounded-xl pl-4 pr-12 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-accent-blue/15 flex items-center justify-center text-accent-blue hover:bg-accent-blue/25 disabled:opacity-30 disabled:hover:bg-accent-blue/15 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ReportChat;
