import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, UtensilsCrossed, MessageSquareText } from "lucide-react";
import { useTable } from "@/lib/TableContext";
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export default function AppLayout({ children, showNav = true }: AppLayoutProps) {
  const [location] = useLocation();
  const { tableId } = useTable();
  const { data: cart } = useGetCart(tableId || "", { query: { enabled: !!tableId, queryKey: getGetCartQueryKey(tableId || "") } });

  const cartItemCount = cart?.itemCount || 0;

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex justify-center dark">
      <div className="w-full max-w-md bg-card shadow-2xl relative flex flex-col">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24">
          {children}
        </main>

        {/* Bottom Navigation */}
        {showNav && tableId && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-t border-border flex items-center justify-around px-4 z-50">
            <Link href="/menu" className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${location === "/menu" ? "text-primary" : "text-muted-foreground"}`}>
              <UtensilsCrossed className="w-5 h-5" />
              <span className="text-[10px] font-medium">Menu</span>
            </Link>

            <Link href="/chat" className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${location === "/chat" ? "text-primary" : "text-muted-foreground"}`}>
              <MessageSquareText className="w-5 h-5" />
              <span className="text-[10px] font-medium">Zara AI</span>
            </Link>

            <Link href="/cart" className={`flex flex-col items-center justify-center w-16 h-full space-y-1 relative ${location === "/cart" ? "text-primary" : "text-muted-foreground"}`}>
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">Cart</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
