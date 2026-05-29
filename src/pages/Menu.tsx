import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Star, Flame, Search } from "lucide-react";
import { useGetMenu, useGetCart, useAddCartItem, useUpdateCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTable } from "@/lib/TableContext";
import AppLayout from "@/components/layout/AppLayout";

interface MenuItem {
  id: string;
  name: string;
  nameHindi?: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  isSpicy: boolean;
  isBestseller: boolean;
  rating: number;
  image?: string;
}

function VegBadge({ isVeg }: { isVeg: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${isVeg ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}`}>
      <span className={`w-2 h-2 rounded-full ${isVeg ? "bg-green-500" : "bg-red-500"}`} />
      {isVeg ? "VEG" : "NON-VEG"}
    </span>
  );
}

function MenuCard({ item, tableId }: { item: MenuItem; tableId: string }) {
  const queryClient = useQueryClient();
  const { data: cart } = useGetCart(tableId, { query: { enabled: !!tableId, queryKey: getGetCartQueryKey(tableId) } });
  const addItem = useAddCartItem();
  const updateItem = useUpdateCartItem();

  const cartItem = cart?.items.find((i) => i.menuItemId === item.id);
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    addItem.mutate(
      { tableId, data: { menuItemId: item.id, quantity: 1 } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey(tableId) }) }
    );
  };

  const handleIncrease = () => {
    updateItem.mutate(
      { tableId, itemId: item.id, data: { quantity: qty + 1 } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey(tableId) }) }
    );
  };

  const handleDecrease = () => {
    updateItem.mutate(
      { tableId, itemId: item.id, data: { quantity: qty - 1 } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey(tableId) }) }
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      data-testid={`card-menu-${item.id}`}
      className="flex gap-3 p-3 rounded-2xl bg-white/5 border border-white/8 hover:border-amber-500/30 transition-all"
    >
      {/* Image */}
      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-white/10">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-1">
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{item.name}</p>
            {item.nameHindi && <p className="text-[hsl(240,5%,55%)] text-xs">{item.nameHindi}</p>}
          </div>
          {item.isBestseller && (
            <span className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
              <Star className="w-2.5 h-2.5 fill-amber-400" /> Best
            </span>
          )}
        </div>

        <p className="text-[hsl(240,5%,55%)] text-xs leading-relaxed line-clamp-2 mb-2">{item.description}</p>

        <div className="flex items-center gap-2 mb-2">
          <VegBadge isVeg={item.isVeg} />
          {item.isSpicy && (
            <span className="flex items-center gap-0.5 text-[10px] text-orange-400">
              <Flame className="w-3 h-3" /> Spicy
            </span>
          )}
          <span className="text-[hsl(240,5%,55%)] text-[10px] ml-auto">★ {item.rating}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-amber-400 font-bold text-sm">₹{item.price}</span>

          {qty === 0 ? (
            <button
              data-testid={`button-add-${item.id}`}
              onClick={handleAdd}
              disabled={addItem.isPending}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors active:scale-95"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center gap-2" data-testid={`quantity-control-${item.id}`}>
              <button
                data-testid={`button-decrease-${item.id}`}
                onClick={handleDecrease}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center active:scale-95 transition-all"
              >
                −
              </button>
              <span className="text-amber-400 font-bold text-sm w-4 text-center">{qty}</span>
              <button
                data-testid={`button-increase-${item.id}`}
                onClick={handleIncrease}
                className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center justify-center active:scale-95 transition-all"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Menu() {
  const [, setLocation] = useLocation();
  const { tableId } = useTable();
  const { data: menu, isLoading } = useGetMenu();
  const { data: cart } = useGetCart(tableId || "", { query: { enabled: !!tableId, queryKey: getGetCartQueryKey(tableId || "") } });
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const categories = [{ id: "all", name: "All", icon: "✨" }, ...(menu?.categories ?? [])];
  const items = menu?.items ?? [];

  const filtered = items.filter((item) => {
    const matchCat = activeCategory === "all" || item.category === activeCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (!tableId) {
    setLocation("/");
    return null;
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[hsl(240,10%,5%)]/90 backdrop-blur-xl border-b border-white/8 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-white font-bold text-xl">Our Menu</h1>
            <p className="text-[hsl(240,5%,55%)] text-xs">{tableId}</p>
          </div>
          {cart && cart.itemCount > 0 && (
            <button
              data-testid="button-view-cart"
              onClick={() => setLocation("/cart")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500 text-black font-bold text-sm active:scale-95 transition-transform"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.itemCount} items · ₹{cart.total}
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(240,5%,45%)]" />
          <input
            data-testid="input-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/8 border border-white/10 text-white placeholder-[hsl(240,5%,45%)] text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              data-testid={`button-category-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-amber-500 text-black"
                  : "bg-white/8 text-[hsl(240,5%,65%)] hover:bg-white/12"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="px-4 py-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-white font-semibold">Nothing found</p>
            <p className="text-[hsl(240,5%,55%)] text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} tableId={tableId} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </AppLayout>
  );
}
