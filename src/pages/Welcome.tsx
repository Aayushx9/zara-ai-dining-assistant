import { useState } from "react";
import { useLocation } from "wouter";
import { useTable } from "@/lib/TableContext";
import { motion } from "framer-motion";
import { Sparkles, QrCode, ChevronRight } from "lucide-react";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { setTableId } = useTable();
  const [tableInput, setTableInput] = useState("");
  const [error, setError] = useState("");

  const handleStart = () => {
    const val = tableInput.trim();
    if (!val) {
      setError("Please enter your table number");
      return;
    }
    setTableId(val);
    setLocation("/menu");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleStart();
  };

  return (
    <div className="min-h-[100dvh] w-full flex justify-center dark bg-[hsl(240,10%,5%)]">
      <div className="w-full max-w-md relative overflow-hidden flex flex-col">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative flex flex-col flex-1 px-6 pt-16 pb-10">
          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center mb-12"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-white mb-2">Zara</h1>
            <p className="text-amber-400 text-sm font-medium tracking-widest uppercase mb-4">AI Smart Dining</p>
            <p className="text-[hsl(240,5%,65%)] text-base leading-relaxed max-w-xs">
              Your personal AI food guide. Browse the menu, chat with Zara, and order together with your table.
            </p>
          </motion.div>

          {/* QR hint */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 mb-8"
          >
            <QrCode className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-[hsl(240,5%,65%)] text-sm">Scanned a QR code? Your table number is on the card.</p>
          </motion.div>

          {/* Table number input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-auto space-y-4"
          >
            <div>
              <label className="block text-[hsl(240,5%,65%)] text-xs font-semibold uppercase tracking-wider mb-2">
                Enter Your Table Number
              </label>
              <input
                data-testid="input-table-number"
                type="text"
                value={tableInput}
                onChange={(e) => { setTableInput(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Table 7"
                className="w-full px-4 py-4 rounded-2xl bg-white/8 border border-white/15 text-white placeholder-[hsl(240,5%,45%)] text-lg focus:outline-none focus:border-amber-500 focus:bg-white/10 transition-all"
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <button
              data-testid="button-start-dining"
              onClick={handleStart}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-transform"
            >
              Start Dining
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Quick demo shortcut */}
            <button
              data-testid="button-demo"
              onClick={() => { setTableId("Table 7"); setLocation("/menu"); }}
              className="w-full py-3 text-[hsl(240,5%,55%)] text-sm hover:text-amber-400 transition-colors"
            >
              Quick demo — use Table 7
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
