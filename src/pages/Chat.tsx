import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, ShoppingBag, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { useTable } from "@/lib/TableContext";
import { useGetCart, useAddCartItem, getGetCartQueryKey, useZaraRecommend } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_CHIPS = [
  "What's popular today?",
  "Kuch veg recommend karo",
  "Spicy dishes dikhao",
  "Best combo for 2 log?",
];

export default function Chat() {
  const [, setLocation] = useLocation();
  const { tableId } = useTable();
  const queryClient = useQueryClient();
  const { data: cart } = useGetCart(tableId || "", { query: { enabled: !!tableId, queryKey: getGetCartQueryKey(tableId || "") } });
  const addItem = useAddCartItem();
  const recommend = useZaraRecommend();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! I'm Zara, your AI dining guide. Aaj kya khana hai? I can help you explore the menu, suggest dishes based on your mood, or answer anything about our food. What are you craving?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  if (!tableId) {
    setLocation("/");
    return null;
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsStreaming(true);
    setStreamingText("");

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/zara/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          tableId,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.content) {
                  full += parsed.content;
                  setStreamingText(full);
                }
                if (parsed.done) break;
              } catch { /* skip */ }
            }
          }
        }
      }

      setMessages([...newHistory, { role: "assistant", content: full }]);
    } catch {
      setMessages([...newHistory, { role: "assistant", content: "Thoda issue ho gaya, phir try karo! 😅" }]);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  };

  const handleRecommend = async (preference: string) => {
    recommend.mutate(
      { data: { preference, tableId } },
      {
        onSuccess: (data) => {
          const names = data.recommendations.map((r: { name: string }) => r.name).join(", ");
          setMessages((prev) => [
            ...prev,
            { role: "user", content: preference },
            { role: "assistant", content: `${data.message}\n\nMy picks: **${names}**` },
          ]);
        },
      }
    );
  };

  const handleAddToCart = (itemId: string, itemName: string) => {
    if (!tableId) return;
    addItem.mutate(
      { tableId, data: { menuItemId: itemId, quantity: 1 } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey(tableId) }) }
    );
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[hsl(240,10%,5%)]/90 backdrop-blur-xl border-b border-white/8 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Zara AI</p>
            <p className="text-green-400 text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Online
            </p>
          </div>
        </div>
        {cart && cart.itemCount > 0 && (
          <button
            data-testid="button-view-cart-chat"
            onClick={() => setLocation("/cart")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {cart.itemCount}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="px-4 py-4 space-y-4 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                data-testid={`message-${i}`}
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-amber-500 text-black font-medium rounded-tr-sm"
                    : "bg-white/8 border border-white/10 text-white rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming bubble */}
        {isStreaming && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shrink-0 mt-1">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-tl-sm bg-white/8 border border-white/10 text-white text-sm leading-relaxed whitespace-pre-wrap">
              {streamingText || (
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Quick chips (show only at start) */}
        {messages.length === 1 && !isStreaming && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 mt-2">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                data-testid={`chip-${chip.toLowerCase().replace(/\s/g, "-")}`}
                onClick={() => sendMessage(chip)}
                className="px-3 py-1.5 rounded-xl bg-white/8 border border-white/10 text-[hsl(240,5%,75%)] text-xs hover:border-amber-500/40 hover:text-amber-400 transition-all"
              >
                {chip}
              </button>
            ))}
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar — fixed at bottom above nav */}
      <div className="sticky bottom-16 z-20 px-4 pb-3 pt-2 bg-gradient-to-t from-[hsl(240,10%,5%)] to-transparent">
        <div className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-2xl px-4 py-2">
          <input
            data-testid="input-chat"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask Zara anything..."
            disabled={isStreaming}
            className="flex-1 bg-transparent text-white placeholder-[hsl(240,5%,45%)] text-sm focus:outline-none disabled:opacity-50"
          />
          <button
            data-testid="button-send"
            onClick={() => sendMessage(input)}
            disabled={isStreaming || !input.trim()}
            className="w-8 h-8 rounded-xl bg-amber-500 disabled:opacity-40 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
          >
            <Send className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
