import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, UtensilsCrossed, MessageSquareText, Clock } from "lucide-react";
import { useGetOrder } from "@workspace/api-client-react";
import AppLayout from "@/components/layout/AppLayout";

export default function OrderConfirmation() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { data: order, isLoading } = useGetOrder(params.id || "", {
    query: { enabled: !!params.id, queryKey: ["getOrder", params.id || ""] },
  });

  return (
    <AppLayout showNav={false}>
      <div className="flex flex-col items-center px-4 py-10 text-center">
        {isLoading ? (
          <div className="w-20 h-20 rounded-full bg-white/5 animate-pulse mb-6" />
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30 mb-6"
            >
              <CheckCircle className="w-14 h-14 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-white font-bold text-2xl mb-2">Order Confirmed!</h1>
              <p className="text-[hsl(240,5%,55%)] text-sm mb-1">
                Bahut achha choice! Your order is being prepared.
              </p>
              {order && (
                <p className="text-amber-400 text-xs font-mono font-semibold mb-6">
                  Order ID: {order.id}
                </p>
              )}
            </motion.div>

            {/* Est. time */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 text-sm font-medium mb-8"
            >
              <Clock className="w-4 h-4" />
              Estimated time: 20–30 minutes
            </motion.div>

            {/* Order items */}
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/8 text-left mb-8"
              >
                <p className="text-[hsl(240,5%,55%)] text-xs font-semibold uppercase tracking-wider mb-3">Your Order</p>
                {order.items.map((item: { menuItemId: string; name: string; quantity: number; price: number }) => (
                  <div key={item.menuItemId} className="flex justify-between text-sm py-1.5 border-b border-white/6 last:border-0">
                    <span className="text-[hsl(240,5%,75%)]">{item.name} × {item.quantity}</span>
                    <span className="text-white">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <div className="flex justify-between mt-3 pt-2">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-amber-400 font-bold">₹{(order.total * 1.05).toFixed(0)}</span>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full space-y-3"
            >
              <button
                data-testid="button-back-to-menu"
                onClick={() => setLocation("/menu")}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold flex items-center justify-center gap-2"
              >
                <UtensilsCrossed className="w-4 h-4" />
                Order More
              </button>
              <button
                data-testid="button-chat-zara"
                onClick={() => setLocation("/chat")}
                className="w-full py-3 rounded-2xl bg-white/8 border border-white/10 text-white font-semibold flex items-center justify-center gap-2"
              >
                <MessageSquareText className="w-4 h-4 text-amber-400" />
                Chat with Zara
              </button>
            </motion.div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
