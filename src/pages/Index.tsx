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

// ✅ adaugi tu poza asta după ce o încarci (pune exact numele fișierului aici)
import targetLogo from "@/assets/target-logo.png";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const criticalImages = [
      doordashLogo, // ✅ DoorDash primul
      crumblcookieLogo, // ✅ Crumbl al doilea
      appleLogo,
      sephoraLogo,
      costcoLogo,
      zaraLogo,
      targetLogo, // ✅ spre final
    ];
    preloadImages(criticalImages);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // ✅ DoorDash #1, Crumbl #2, Target spre final
  const brands = [
    {
      logo: doordashLogo,
      brand: "DoorDash",
      offer: "🍔 $500 Giftcard",
      usedToday: 167,
      timeLeft: 14,
    },
    {
      logo: crumblcookieLogo,
      brand: "Crumbl Cookies",
      offer: "🍪 $750 Giftcard",
      usedToday: 324,
      timeLeft: 9,
    },
    {
      logo: appleLogo,
      brand: "Apple",
      offer: "⚡ $100 Giftcard",
      usedToday: 198,
      timeLeft: 23,
    },
    {
      logo: sephoraLogo,
      brand: "Sephora",
      offer: "💄 $750 Giftcard",
      usedToday: 209,
      timeLeft: 18,
    },
    {
      logo: costcoLogo,
      brand: "Costco",
      offer: "🎟️ $750 Giftcard",
      usedToday: 185,
      timeLeft: 8,
    },
    {
      logo: zaraLogo,
      brand: "Zara",
      offer: "🛍️ $500 Giftcard",
      usedToday: 246,
      timeLeft: 11,
    },
    {
      logo: targetLogo,
      brand: "Target",
      offer: "🎯 $500 Giftcard",
      usedToday: 260,
      timeLeft: 12,
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
              <BrandCard
                key={`${brand.brand}-${index}`}
                logo={brand.logo}
                brand={brand.brand}
                offer={brand.offer}
                usedToday={brand.usedToday}
                timeLeft={brand.timeLeft}
              />
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
    </div>
  );
};

export default Index;
