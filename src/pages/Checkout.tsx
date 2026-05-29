import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, ChevronLeft } from "lucide-react";
import { useGetCart, usePlaceOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTable } from "@/lib/TableContext";
import AppLayout from "@/components/layout/AppLayout";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { tableId } = useTable();
  const queryClient = useQueryClient();
  const { data: cart } = useGetCart(tableId || "", { query: { enabled: !!tableId, queryKey: getGetCartQueryKey(tableId || "") } });
  const placeOrder = usePlaceOrder();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  if (!tableId) {
    setLocation("/");
    return null;
  }

  const handlePlaceOrder = () => {
    setError("");
    if (otp.length < 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    if (!cart?.items.length) {
      setError("Your cart is empty");
      return;
    }

    placeOrder.mutate(
      {
        data: {
          tableId,
          otp,
          items: cart.items.map((i) => ({
            menuItemId: i.menuItemId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        },
      },
      {
        onSuccess: (order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey(tableId) });
          setLocation(`/order-confirmation/${order.id}`);
        },
        onError: () => {
          setError("Invalid OTP. Try 123456.");
        },
      }
    );
  };

  const total = cart ? cart.total * 1.05 : 0;

  return (
    <AppLayout showNav={false}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[hsl(240,10%,5%)]/90 backdrop-blur-xl border-b border-white/8 px-4 py-4 flex items-center gap-3">
        <button
          data-testid="button-back"
          onClick={() => setLocation("/cart")}
          className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <h1 className="text-white font-bold text-xl">Checkout</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Order summary */}
        {cart && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/8">
            <p className="text-[hsl(240,5%,55%)] text-xs font-semibold uppercase tracking-wider mb-3">Order Summary</p>
            {cart.items.map((item) => (
              <div key={item.menuItemId} className="flex justify-between text-sm py-1.5 border-b border-white/6 last:border-0">
                <span className="text-[hsl(240,5%,75%)]">{item.name} × {item.quantity}</span>
                <span className="text-white">₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
            <div className="flex justify-between mt-3 pt-1">
              <span className="text-white font-bold">Total (incl. GST)</span>
              <span className="text-amber-400 font-bold text-lg">₹{total.toFixed(0)}</span>
            </div>
          </div>
        )}

        {/* OTP input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-white/5 border border-white/8"
        >
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <p className="text-white font-semibold">Verify with OTP</p>
          </div>
          <p className="text-[hsl(240,5%,55%)] text-sm mb-4">
            Enter the OTP sent to your phone to confirm your order.
          </p>

          <input
            data-testid="input-otp"
            type="tel"
            maxLength={6}
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
            placeholder="Enter 6-digit OTP"
            className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white text-lg font-mono tracking-widest text-center focus:outline-none focus:border-amber-500 transition-colors"
          />

          <p className="text-[hsl(240,5%,45%)] text-xs text-center mt-2">
            Demo OTP: <span className="text-amber-400 font-mono font-bold">123456</span>
          </p>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center mt-2"
              data-testid="text-error"
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        <button
          data-testid="button-place-order"
          onClick={handlePlaceOrder}
          disabled={placeOrder.isPending}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 disabled:opacity-60 active:scale-[0.98] transition-transform"
        >
          {placeOrder.isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
          ) : (
            <>Confirm Order · ₹{total.toFixed(0)}</>
          )}
        </button>
      </div>
    </AppLayout>
  );
}
