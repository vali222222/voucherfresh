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
import ticketmasterLogo from "@/assets/ticketmaster-logo.png"; // ✅ nou

type BrandItem = {
  logo: string;
  brand: string;
  offer: string;
  usedToday: number;
  timeLeft: number;
  ctaUrl?: string; // ✅ optional: link direct
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const criticalImages = [
      ticketmasterLogo,
      crumblcookieLogo,
      appleLogo,
      doordashLogo,
      sephoraLogo,
      costcoLogo,
      zaraLogo,
    ];
    preloadImages(criticalImages);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const brands: BrandItem[] = [
    {
      logo: ticketmasterLogo,
      brand: "Ticketmaster",
      offer: "🔥 Get $1000 Giftcard", // ✅ ca la Costco
      usedToday: 210,
      timeLeft: 12,
      ctaUrl: "https://trkio.org/aff_c?offer_id=1326&aff_id=14999&source=ticket", // ✅ direct link
    },
    {
      logo: costcoLogo,
      brand: "Costco",
      offer: "🔥 $750 Giftcard",
      usedToday: 185,
      timeLeft: 12,
    },
    {
      logo: appleLogo,
      brand: "Apple",
      offer: "⚡ Exclusive offer — Up to 95% Off",
      usedToday: 198,
      timeLeft: 13,
    },
    {
      logo: doordashLogo,
      brand: "DoorDash",
      offer: "🍔 Hot deal — Up to 90% Off",
      usedToday: 167,
      timeLeft: 14,
    },
    {
      logo: crumblcookieLogo,
      brand: "Crumbl Cookies",
      offer: "🍪 Sweet deal — Up to 90% Off",
      usedToday: 324,
      timeLeft: 9,
    },
    {
      logo: sephoraLogo,
      brand: "Sephora",
      offer: "💄 Beauty picks — Up to 60% Off",
      usedToday: 209,
      timeLeft: 18,
    },
    {
      logo: zaraLogo,
      brand: "Zara",
      offer: "🛍️ Style drop — Up to 70% Off",
      usedToday: 246,
      timeLeft: 11,
    },
  ];

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brands;

    return brands.filter(
      (brand) =>
        brand.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.offer.toLowerCase().includes(searchQuery.toLowerCase())
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
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
      </div>

      <main className="max-w-md mx-auto px-4 py-6 pb-12">
        <div className="space-y-4">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand, index) => (
              // ✅ Interceptăm click-ul ÎNAINTE de BrandCard (capture),
              // ca să nu mai ruleze niciun flux intern (ex: captcha) pentru Ticketmaster
              <div
                key={`${brand.brand}-${index}`}
                className={brand.ctaUrl ? "cursor-pointer" : undefined}
                role={brand.ctaUrl ? "link" : undefined}
                tabIndex={brand.ctaUrl ? 0 : undefined}
                onClickCapture={(e) => {
                  if (!brand.ctaUrl) return;
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = brand.ctaUrl;
                }}
                onKeyDownCapture={(e) => {
                  if (!brand.ctaUrl) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = brand.ctaUrl;
                  }
                }}
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
    </div>
  );
};

export default Index;
