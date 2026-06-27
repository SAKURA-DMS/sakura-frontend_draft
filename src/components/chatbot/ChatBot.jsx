import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "@/services/chatbotService";
import { useApp } from "@/contexts/AppContext";
import aichatbotSakura from "@/assets/aichatbot_sakura.gif";

// ── Komponen bubble pesan ──────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      {!isUser && (
        <img
          src={aichatbotSakura}
          alt="SAKURA AI"
          className="w-7 h-7 rounded-full mr-2 flex-shrink-0 self-end"
        />
      )}
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : msg.isError
            ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-bl-sm"
            : "bg-secondary text-secondary-foreground rounded-bl-sm"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

// ── Komponen utama ChatBot ─────────────────────────────────────────────────────
export default function ChatBot() {
  const { isLoggedIn } = useApp();

  const [isOpen,   setIsOpen]   = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Halo! Saya SAKURA AI 🌸\nAda yang bisa saya bantu cari di sistem SAKURA?",
    },
  ]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // Auto-scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Fokus input saat jendela dibuka
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Hanya tampilkan jika user sudah login
  if (!isLoggedIn) return null;

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const answer = await sendChatMessage(text);
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    } catch (err) {
      // Ambil pesan error dari response server jika ada
      const serverMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Terjadi kesalahan saat menghubungi AI. Silakan coba lagi.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ ${serverMsg}`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* ── Chat Window ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-5 z-50 w-80 sm:w-96 flex flex-col rounded-2xl shadow-2xl border border-border bg-card overflow-hidden"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground flex-shrink-0">
            <img
              src={aichatbotSakura}
              alt="SAKURA AI"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <p className="font-semibold text-sm leading-none">SAKURA AI</p>
              <p className="text-xs opacity-75 mt-0.5">AI Search Assistant</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors ml-2 text-lg leading-none"
              aria-label="Tutup chatbot"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && (
              <div className="flex justify-start mb-2">
                <img
                  src={aichatbotSakura}
                  alt="SAKURA AI"
                  className="w-7 h-7 rounded-full mr-2 flex-shrink-0 self-end"
                />
                <div className="bg-secondary text-secondary-foreground px-3 py-2 rounded-2xl rounded-bl-sm text-sm">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce [animation-delay:0ms]">●</span>
                    <span className="animate-bounce [animation-delay:150ms]">●</span>
                    <span className="animate-bounce [animation-delay:300ms]">●</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 px-3 py-3 border-t border-border bg-background flex-shrink-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan sesuatu tentang dokumen…"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-xl border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 max-h-28 overflow-y-auto"
              style={{ lineHeight: "1.4" }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Kirim pesan"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 rotate-45"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Button ─────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30"
        aria-label="Buka SAKURA AI Assistant"
        title="SAKURA AI Search Assistant"
      >
        <img
          src={aichatbotSakura}
          alt="SAKURA AI"
          className="w-14 h-14 rounded-full object-cover"
        />
      </button>
    </>
  );
}