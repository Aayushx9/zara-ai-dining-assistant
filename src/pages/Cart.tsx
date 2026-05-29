import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, ChevronRight, UtensilsCrossed } from "lucide-react";
import { useGetCart, useUpdateCartItem, useRemoveCartItem, useClearCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTable } from "@/lib/TableContext";
import AppLayout from "@/components/layout/AppLayout";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { tableId } = useTable();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useGetCart(tableId || "", { query: { enabled: !!tableId, queryKey: getGetCartQueryKey(tableId || "") } });
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey(tableId || "") });

  if (!tableId) {
    setLocation("/");
    return null;
  }

  const handleQuantityChange = (itemId: string, delta: number, current: number) => {
    const newQty = current + delta;
    if (newQty <= 0) {
      removeItem.mutate({ tableId, itemId }, { onSuccess: invalidate });
    } else {
      updateItem.mutate({ tableId, itemId, data: { quantity: newQty } }, { onSuccess: invalidate });
    }
  };

  const handleRemove = (itemId: string) => {
    removeItem.mutate({ tableId, itemId }, { onSuccess: invalidate });
  };

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[hsl(240,10%,5%)]/90 backdrop-blur-xl border-b border-white/8 px-4 py-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">Your Cart</h1>
        {!isEmpty && (
          <button
            data-testid="button-clear-cart"
            onClick={() => clearCart.mutate({ tableId }, { onSuccess: invalidate })}
            className="text-[hsl(240,5%,55%)] text-xs hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="px-4 py-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse mb-3" />
          ))
        ) : isEmpty ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-[hsl(240,5%,40%)]" />
            </div>
            <p className="text-white font-semibold text-lg mb-2">Your cart is empty</p>
            <p className="text-[hsl(240,5%,55%)] text-sm mb-6">Kuch add karo menu se!</p>
            <button
              data-testid="button-browse-menu"
              onClick={() => setLocation("/menu")}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 text-black font-bold text-sm"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Browse Menu
            </button>
          </motion.div>
        ) : (
          <>
            <AnimatePresence>
              {cart.items.map((item) => (
                <motion.div
                  key={item.menuItemId}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  data-testid={`cart-item-${item.menuItemId}`}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/8 mb-3"
                >
                  {/* Veg dot */}
                  <span className={`w-3 h-3 rounded-full shrink-0 ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{item.name}</p>
                    <p className="text-amber-400 text-xs font-semibold">₹{(item.price * item.quantity).toFixed(0)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      data-testid={`button-cart-decrease-${item.menuItemId}`}
                      onClick={() => handleQuantityChange(item.menuItemId, -1, item.quantity)}
                      className="w-7 h-7 rounded-lg bg-white/10 text-white text-sm font-bold flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-white font-bold text-sm w-4 text-center">{item.quantity}</span>
                    <button
                      data-testid={`button-cart-increase-${item.menuItemId}`}
                      onClick={() => handleQuantityChange(item.menuItemId, 1, item.quantity)}
                      className="w-7 h-7 rounded-lg bg-amber-500 text-black text-sm font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  <button
                    data-testid={`button-remove-${item.menuItemId}`}
                    onClick={() => handleRemove(item.menuItemId)}
                    className="w-7 h-7 rounded-lg bg-white/5 text-[hsl(240,5%,50%)] hover:text-red-400 flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Bill summary */}
            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/8 space-y-2 mb-4">
              <p className="text-[hsl(240,5%,55%)] text-xs font-semibold uppercase tracking-wider mb-3">Bill Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(240,5%,65%)]">Subtotal ({cart.itemCount} items)</span>
                <span className="text-white">₹{cart.total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(240,5%,65%)]">GST (5%)</span>
                <span className="text-white">₹{(cart.total * 0.05).toFixed(0)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between">
                <span className="text-white font-bold">Total</span>
                <span className="text-amber-400 font-bold text-lg">₹{(cart.total * 1.05).toFixed(0)}</span>
              </div>
            </div>

            <button
              data-testid="button-checkout"
              onClick={() => setLocation("/checkout")}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-transform"
            >
              Proceed to Checkout
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </AppLayout>
  );
}
