import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Car,
  Clock,
  ExternalLink,
  Minimize2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const AUTO_CONSULT_CATEGORIES = [
  {
    id: 'vehiculos',
    label: 'Vehículos & Specs',
    prompt: '¿Qué modelos destacados y especificaciones mecánicas tienen en la colección?',
  },
  {
    id: 'financiacion',
    label: 'Requisitos Financiación',
    prompt: '¿Cuáles son los requisitos de financiación, enganche mínimo y plazos disponibles?',
  },
  {
    id: 'stock',
    label: 'Disponibilidad Stock',
    prompt: '¿Cuántos vehículos certificados hay disponibles en stock para entrega inmediata?',
  },
];

const QUICK_SUGGESTIONS = [
  '¿Qué autos JDM tienen en stock?',
  '¿Cuáles son los requisitos de financiación?',
  '¿Tienen disponible el Porsche GT3 RS?',
  '¿Cuál es el auto más rápido de 0 a 100?',
  '¿Puedo apartar un auto con $1,500 USD?',
  '¿Cuánto es el enganche mínimo recomendado?',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-01',
  role: 'model',
  text: '¡Bienvenido a **Elite Motors Concierge**! Soy tu asesor digital inteligente potenciado por **Gemini 3.8 Flash**.\n\nPuedo responderte al instante sobre:\n• 🏎️ **Vehículos:** Fichas técnicas, motorización, potencia y precios de nuestros 44 modelos.\n• 💳 **Financiación:** Requisitos, enganche desde el 10%, plazos y tasas fijas desde 4.9% APR.\n• 📦 **Stock:** Unidades verificadas con entrega inmediata y proceso de apartado oficial.\n\nSelecciona una consulta automática rápida abajo o escribe tu pregunta libremente.',
  timestamp: 'Ahora'
};

export const ConciergeChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (userTextToSend?: string) => {
    const text = (userTextToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/concierge-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const modelReply = data.reply || 'Disculpa, no pude procesar la consulta en este instante.';

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: modelReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setTypingMessageId(botMessage.id);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error contacting concierge API:', error);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: 'Estimado cliente, tuvimos una breve interrupción en la conexión. Por favor reintenta tu pregunta o consulta directamente las fichas técnicas en el catálogo.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTypingMessageId(errorMessage.id);
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setTypingMessageId(null);
  };

  // Basic markdown-like formatter for bold text and bullet points
  const formatMessageText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Replace **bold** with <strong>
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="text-[#e5b869] font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');

      return (
        <span key={idx} className={`block ${isBullet ? 'pl-2 text-zinc-300 my-0.5' : 'my-1'}`}>
          {formattedLine}
        </span>
      );
    });
  };

  // Typewriter text animator for incoming Gemini responses
  const TypewriterText: React.FC<{
    text: string;
    isNew: boolean;
    onFinish?: () => void;
    onStep?: () => void;
  }> = ({ text, isNew, onFinish, onStep }) => {
    const [displayedLength, setDisplayedLength] = useState(isNew ? 0 : text.length);
    const [isTyping, setIsTyping] = useState(isNew);

    useEffect(() => {
      if (!isNew) {
        setDisplayedLength(text.length);
        setIsTyping(false);
        return;
      }

      let currentLength = 0;
      // Smooth dynamic typing step based on length
      const step = Math.max(2, Math.ceil(text.length / 55));
      const interval = setInterval(() => {
        currentLength = Math.min(text.length, currentLength + step);
        setDisplayedLength(currentLength);
        if (onStep) onStep();

        if (currentLength >= text.length) {
          clearInterval(interval);
          setIsTyping(false);
          if (onFinish) onFinish();
        }
      }, 18);

      return () => clearInterval(interval);
    }, [text, isNew]);

    const displayedContent = isTyping ? text.slice(0, displayedLength) : text;

    return (
      <div className="transition-opacity duration-500 ease-out">
        {formatMessageText(displayedContent)}
        {isTyping && (
          <span
            className="inline-block w-1.5 h-3.5 bg-[#e5b869] ml-1 rounded-[1px] animate-pulse align-middle shadow-sm shadow-[#e5b869]/50"
            title="Escribiendo..."
          />
        )}
      </div>
    );
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
          {/* Welcome Tooltip / Badge */}
          <div
            onClick={() => setIsOpen(true)}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-[#12141a]/95 border border-[#e5b869]/40 rounded-xl shadow-xl backdrop-blur-md cursor-pointer hover:border-[#e5b869] transition-all animate-in fade-in slide-in-from-right-3 duration-300"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-left">
              <span className="text-[11px] font-bold text-white block leading-tight">
                Concierge IA en Vivo
              </span>
              <span className="text-[10px] text-zinc-400 block leading-tight">
                Pregunta por autos, financiación o stock
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsOpen(true);
              setHasUnread(false);
            }}
            className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#14161f] via-[#1a1d27] to-[#11131a] border border-[#e5b869]/60 hover:border-[#e5b869] shadow-2xl hover:shadow-[#e5b869]/25 transition-all duration-300 flex items-center justify-center cursor-pointer group active:scale-95"
            aria-label="Abrir chat de consultas automáticas con Gemini"
            title="Chat con el Concierge IA de Elite Motors"
          >
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#090a0d] animate-pulse" />
            <Sparkles className="w-6 h-6 text-[#e5b869] group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {/* Expanded Floating Chat Widget Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[410px] h-[580px] max-h-[86vh] rounded-2xl bg-[#0c0e14]/98 border border-[#e5b869]/40 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#141620] via-[#171a25] to-[#12141c] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e5b869] to-[#9e7529] p-0.5 flex items-center justify-center shadow-md shadow-[#e5b869]/20">
                <div className="w-full h-full bg-[#12141a] rounded-[10px] flex items-center justify-center text-[#e5b869]">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white font-display">
                    Concierge Elite Motors
                  </h3>
                  <span className="text-[9px] font-mono uppercase bg-[#e5b869]/15 text-[#e5b869] px-1.5 py-0.5 rounded border border-[#e5b869]/30 font-bold">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-emerald-400 font-medium">
                    En línea • Consultas en tiempo real
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                title="Reiniciar conversación"
                aria-label="Reiniciar chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                title="Minimizar chat"
                aria-label="Cerrar chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Fast Auto-Consultation Category Buttons */}
          <div className="px-3 py-2 bg-[#0d0f17] border-b border-white/[0.08] shrink-0">
            <div className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#e5b869]" />
              <span>Consultas automáticas rápidas:</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {AUTO_CONSULT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  disabled={isLoading}
                  onClick={() => handleSendMessage(cat.prompt)}
                  className="px-2 py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#e5b869]/15 border border-white/10 hover:border-[#e5b869]/50 text-left transition-all group disabled:opacity-40 cursor-pointer"
                  title={cat.prompt}
                >
                  <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-[#e5b869] block truncate">
                    {cat.label}
                  </span>
                  <span className="text-[9px] text-zinc-400 block truncate">
                    Consultar IA
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Suggestions Chips (Horizontal Scroll) */}
          <div className="px-3 py-1.5 bg-[#090b10] border-b border-white/[0.06] overflow-x-auto no-scrollbar shrink-0 flex items-center gap-1.5">
            <span className="text-[9px] uppercase font-bold text-zinc-500 shrink-0">
              Ejemplos:
            </span>
            {QUICK_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                disabled={isLoading}
                onClick={() => handleSendMessage(sug)}
                className="shrink-0 text-[10px] font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-[#e5b869]/15 hover:border-[#e5b869]/40 border border-white/10 rounded-full px-2.5 py-0.5 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#090a0f]/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                } transition-all duration-500 ease-out animate-in fade-in-0 slide-in-from-bottom-2`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-lg bg-[#e5b869]/15 border border-[#e5b869]/30 flex items-center justify-center shrink-0 text-[#e5b869] mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-lg transition-opacity duration-500 ease-out ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#b38b3b] to-[#e5b869] text-black font-medium rounded-tr-none'
                      : 'bg-[#14161f] text-zinc-200 border border-white/[0.08] rounded-tl-none'
                  }`}
                >
                  <div className="space-y-0.5 transition-opacity duration-500">
                    {msg.role === 'model' ? (
                      <TypewriterText
                        text={msg.text}
                        isNew={typingMessageId === msg.id}
                        onFinish={() => setTypingMessageId(null)}
                        onStep={scrollToBottom}
                      />
                    ) : (
                      msg.text
                    )}
                  </div>
                  <div
                    className={`text-[9px] mt-1.5 text-right ${
                      msg.role === 'user' ? 'text-black/60' : 'text-zinc-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 text-white mt-0.5 shadow-sm">
                    <User className="w-4 h-4 text-zinc-300" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator with Smooth Opacity & Pulse Animation */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center transition-all duration-300 ease-out animate-in fade-in-0 slide-in-from-bottom-2">
                <div className="w-7 h-7 rounded-lg bg-[#e5b869]/15 border border-[#e5b869]/30 flex items-center justify-center shrink-0 text-[#e5b869] relative shadow-sm">
                  <Bot className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="bg-[#14161f] border border-[#e5b869]/30 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-zinc-300 flex items-center gap-3 shadow-lg shadow-black/40">
                  <div className="flex gap-1.5 items-center">
                    <span
                      className="w-2 h-2 rounded-full bg-[#e5b869] animate-bounce"
                      style={{ animationDuration: '0.9s' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-[#e5b869] animate-bounce"
                      style={{ animationDuration: '0.9s', animationDelay: '180ms' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-[#e5b869] animate-bounce"
                      style={{ animationDuration: '0.9s', animationDelay: '360ms' }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <Sparkles className="w-3 h-3 text-[#e5b869] animate-pulse" />
                    <span className="font-medium text-zinc-300">
                      Concierge IA está redactando la respuesta...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#0d0f16] border-t border-white/10 shrink-0">
            <div className="flex items-center gap-2 bg-[#161822] border border-white/15 focus-within:border-[#e5b869] rounded-xl px-3 py-1.5 transition-all shadow-inner">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta sobre vehículos, financiación o stock..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-none text-white text-xs placeholder:text-zinc-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="w-8 h-8 rounded-lg bg-[#e5b869] hover:bg-[#d4a34b] disabled:opacity-40 disabled:hover:bg-[#e5b869] text-black flex items-center justify-center transition-all cursor-pointer shrink-0"
                aria-label="Enviar mensaje"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1.5 px-1">
              <span>Respuestas en tiempo real con datos de 44 autos</span>
              <span className="text-[#e5b869]/80 font-mono">IA Oficial</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
