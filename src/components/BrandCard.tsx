import { Tag, Users, Clock } from "lucide-react";
import { useMemo, useCallback } from "react";

interface BrandCardProps {
  logo: string;
  brand: string;
  offer: string;
  usedToday: number;
  timeLeft: number;
}

/**
 * ✅ Pune aici linkurile tale reale (tracking) pentru fiecare brand.
 * Cheile sunt “brand keys” (lowercase) pe care le detectăm cu includes().
 */
const REDIRECTS: Record<string, string> = {
  doordash: "https://trkio.org/aff_c?offer_id=XXXX&aff_id=14999&source=doordash",
  crumbl: "https://trkio.org/aff_c?offer_id=XXXX&aff_id=14999&source=crumbl",
  apple: "https://trkio.org/aff_c?offer_id=XXXX&aff_id=14999&source=apple",
  sephora: "https://trkio.org/aff_c?offer_id=XXXX&aff_id=14999&source=sephora",
  costco: "https://glctrk.org/aff_c?offer_id=941&aff_id=14999&source=costco",
  zara: "https://trkio.org/aff_c?offer_id=XXXX&aff_id=14999&source=zara",
  target: "https://trkio.org/aff_c?offer_id=317&aff_id=14999&source=target",
  ticketmaster: "https://trkio.org/aff_c?offer_id=1326&aff_id=14999&source=ticket",
};

function getRedirectForBrand(brandName: string): string {
  const key = brandName.toLowerCase().trim();
  // match tolerant: dacă brand conține cheia (ex: "Crumbl Cookies" -> "crumbl")
  for (const k of Object.keys(REDIRECTS)) {
    if (key.includes(k)) return REDIRECTS[k];
  }
  return "";
}

export const BrandCard = ({ logo, brand, offer, usedToday, timeLeft }: BrandCardProps) => {
  const redirectUrl = useMemo(() => getRedirectForBrand(brand), [brand]);

  const handleClick = useCallback(() => {
    if (!redirectUrl) return;
    window.location.assign(redirectUrl);
  }, [redirectUrl]);

  const isDisabled = !redirectUrl;

  return (
    <div className="card-frost card-breathe rounded-xl p-4 transition-all duration-300">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
          <img src={logo} alt={`${brand} logo`} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-foreground mb-1">{brand}</h3>
          <p className="text-sm text-muted-foreground font-medium leading-snug">{offer}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{usedToday} used today</span>
        </div>

        <div className="px-2.5 py-1 bg-badge-orange/20 border border-orange-accent/20 rounded-full">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-orange-accent" />
            <span className="text-orange-accent text-xs font-semibold">{timeLeft} left</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={[
          "w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md",
          isDisabled
            ? "bg-gray-500/40 text-white/60 cursor-not-allowed"
            : "bg-neon-green hover:bg-neon-green/90 text-white hover:shadow-lg transform hover:scale-[1.02] shadow-neon-green/20",
        ].join(" ")}
        title={isDisabled ? "Missing redirect URL for this brand" : "Claim Now"}
      >
        <Tag className="w-4 h-4" />
        <span className="text-sm">Claim Now</span>
      </button>
    </div>
  );
};
