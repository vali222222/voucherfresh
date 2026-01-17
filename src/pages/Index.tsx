import { VoucherHeader } from "@/components/VoucherHeader";
import { SearchBar } from "@/components/SearchBar";
import { BrandCard } from "@/components/BrandCard";
import { Footer } from "@/components/Footer";
import { MobileOnlyScreen } from "@/components/MobileOnlyScreen";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useMemo, useCallback, useEffect } from "react";
import { preloadImages } from "@/utils/performance";

import crumblcookieLogo from "@/assets/crumblcookies-logo.png";
import appleLogo from "@/assets/apple-logo.png";
import doordashLogo from "@/assets/doordash-logo.png";
import sephoraLogo from "@/assets/sephora-logo.png";
import costcoLogo from "@/assets/costco-logo.png";
import zaraLogo from "@/assets/zara-logo.png";
import ticketmasterLogo from "@/assets/ticketmaster-logo.png"; // <-- adaugă fișierul

// shadcn/ui dialog + button (dacă le ai în proiect)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type BrandItem = {
  logo: string;
  brand: string;
  offer: string;
  usedToday: number;
  timeLeft: number;
  couponCode?: string; // optional
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  // modal state
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState<BrandItem | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleOpenCoupon = useCallback((brand: BrandItem) => {
    setActiveBrand(brand);
    setRevealed(false);
    setIsCouponOpen(true);
  }, []);

  // Preload critical images on component mount
  useEffect(() => {
    const criticalImages = [
      ticketmasterLogo,
      costcoLogo,
      crumblcookieLogo,
      appleLogo,
      doordashLogo,
      sephoraLogo,
      zaraLogo,
    ];
    preloadImages(criticalImages);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Ticketmaster primul, Costco al doilea
  const brands: BrandItem[] = [
    {
      logo: ticketmasterLogo,
      brand: "Ticketmaster",
      offer: "🎟️ Limited drop — Up to 80% Off",
      usedToday: 221,
      timeLeft: 10,
      couponCode: "TM80OFF", // pune orice cod vrei aici
    },
    {
      logo: costcoLogo,
      brand: "Costco",
      offer: "🔥 $750 Giftcard",
      usedToday: 185,
      timeLeft: 12,
      couponCode: "COSTCO750",
    },
    {
      logo: appleLogo,
      brand: "Apple",
      offer: "⚡ Exclusive offer — Up to 95% Off",
      usedToday: 198,
      timeLeft: 13,
      couponCode: "APPLE95",
    },
    {
      logo: doordashLogo,
      brand: "DoorDash",
      offer: "🍔 Hot deal — Up to 90% Off",
      usedToday: 167,
      timeLeft: 14,
      couponCode: "DASH90",
    },
    {
      logo: crumblcookieLogo,
      brand: "Crumbl Cookies",
      offer: "🍪 Sweet deal — Up to 90% Off",
      usedToday: 324,
      timeLeft: 9,
      couponCode: "CRUMBL90",
    },
    {
      logo: sephoraLogo,
      brand: "Sephora",
      offer: "💄 Beauty picks — Up to 60% Off",
      usedToday: 209,
      timeLeft: 18,
      couponCode: "SEPH60",
    },
    {
      logo: zaraLogo,
      brand: "Zara",
      offer: "🛍️ Style drop — Up to 70% Off",
      usedToday: 246,
      timeLeft: 11,
      couponCode: "ZARA70",
    },
  ];

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brands;

    return brands.filter(
      (b) =>
        b.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.offer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, brands]);

  // Toggle: keep mobile-only restriction or allow desktop preview
  const MOBILE_ONLY_MODE = false;
  if (MOBILE_ONLY_MODE && !isMobile) {
    return <MobileOnlyScreen />;
  }

  return (
    <div className="min-h-screen bg-[#1a1c24]">
      <VoucherHeader />

      <div className="pb-8">
        <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
      </div>

      <main className="max-w-md mx-auto px-4 py-6 pb-12">
        <div className="space-y-4">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand, index) => (
              // Dacă BrandCard NU are prop onClick, wrapper-ul de mai jos e cea mai safe variantă
              <div
                key={index}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenCoupon(brand)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleOpenCoupon(brand);
                }}
                className="cursor-pointer"
              >
                <BrandCard
                  logo={brand.logo}
                  brand={brand.brand}
                  offer={brand.offer}
                  usedToday={brand.usedToday}
                  timeLeft={brand.timeLeft}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nu au fost găsite oferte pentru "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal: Ticketmaster / orice brand selectat */}
      <Dialog open={isCouponOpen} onOpenChange={setIsCouponOpen}>
        <DialogContent className="bg-[#1a1c24] text-white border-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {activeBrand?.brand ?? "Coupon"}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              {activeBrand?.offer ?? "Get your coupon code"}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-white/70 mb-2">Coupon code</div>
            <div className="font-mono text-xl tracking-wide">
              {revealed ? activeBrand?.couponCode ?? "—" : "••••••••"}
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => setRevealed(true)}
            >
              Get coupon code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
