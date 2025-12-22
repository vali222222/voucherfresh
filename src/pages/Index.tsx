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
import hmLogo from "@/assets/hm-logo.png";
import zaraLogo from "@/assets/zara-logo.png";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  // Preload critical images on component mount
  useEffect(() => {
    const criticalImages = [
      crumblcookieLogo,
      appleLogo,
      doordashLogo,
      sephoraLogo,
      hmLogo,
      zaraLogo,
    ];
    preloadImages(criticalImages);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const brands = [
  {
    logo: appleLogo,
    brand: "Apple",
    offer: "🎄 Christmas Discount - 95% Off",
    usedToday: 198,
    timeLeft: 13,
  },
  {
    logo: doordashLogo,
    brand: "DoorDash",
    offer: "🎄 Christmas Discount - 90% Off",
    usedToday: 167,
    timeLeft: 14,
  },
  {
    logo: crumblcookieLogo,
    brand: "Crumbl Cookies",
    offer: "🎄 Christmas Discount - 90% Off",
    usedToday: 324,
    timeLeft: 9,
  },
  {
    logo: sephoraLogo,
    brand: "Sephora",
    offer: "🎄 Christmas Discount - 60% Off",
    usedToday: 209,
    timeLeft: 18,
  },
  {
    logo: hmLogo,
    brand: "H&M",
    offer: "🎄 Christmas Discount - 45% Off",
    usedToday: 185,
    timeLeft: 21,
  },
  {
    logo: zaraLogo,
    brand: "Zara",
    offer: "🎄 Christmas Discount - 70% Off",
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

  // Toggle: keep mobile-only restriction or allow desktop preview
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
              <BrandCard
                key={index}
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
