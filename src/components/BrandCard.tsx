import { Tag, Users, Clock } from "lucide-react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";

declare global {
  interface Window {
    OGAds?: any;
    ogads?: any;
    OGADS?: any;
  }
}

/** Redirects (Claim Now) */
const COSTCO_REDIRECT_URL =
  "https://glctrk.org/aff_c?offer_id=941&aff_id=14999&source=costco";
const TARGET_REDIRECT_URL =
  "https://trkio.org/aff_c?offer_id=317&aff_id=14999&source=target";

// Pune linkul real:
const DOORDASH_REDIRECT_URL =
  "https://trkio.org/aff_c?offer_id=XXXX&aff_id=14999&source=doordash";

/** Map pentru Claim Now => redirect direct */
const CLAIM_NOW_REDIRECTS: Record<string, string> = {
  costco: COSTCO_REDIRECT_URL,
  target: TARGET_REDIRECT_URL,
  doordash: DOORDASH_REDIRECT_URL,
};

interface BrandCardProps {
  logo: string;
  brand: string;
  offer: string;
  usedToday: number;
  timeLeft: number;
}

export const BrandCard = ({ logo, brand, offer, usedToday, timeLeft }: BrandCardProps) => {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaNonce, setCaptchaNonce] = useState(0);

  const captchaHostRef = useRef<HTMLDivElement | null>(null);

  const brandKey = useMemo(() => brand.toLowerCase().trim(), [brand]);

  const claimNowUrl = useMemo(() => {
    for (const k of Object.keys(CLAIM_NOW_REDIRECTS)) {
      if (brandKey.includes(k)) return CLAIM_NOW_REDIRECTS[k];
    }
    return "";
  }, [brandKey]);

  const isClaimNowFlow = !!claimNowUrl;
  const primaryButtonText = isClaimNowFlow ? "Claim Now" : "Get Coupon Code";

  const goTo = useCallback((url: string) => {
    window.location.assign(url);
  }, []);

  const handlePrimaryAction = useCallback(() => {
    // Claim Now => redirect direct
    if (isClaimNowFlow && claimNowUrl) {
      goTo(claimNowUrl);
      return;
    }

    // Get Coupon Code => arată captcha + forțează remount/re-init de fiecare dată
    setShowCaptcha(true);
    setCaptchaNonce((n) => n + 1);
  }, [isClaimNowFlow, claimNowUrl, goTo]);

  // ✅ La fiecare click (captchaNonce), recreăm exact HTML-ul cerut și re-scanăm
  useEffect(() => {
    if (!showCaptcha || isClaimNowFlow) return;
    if (!captchaHostRef.current) return;

    // 1) recreează containerul exact cum cere providerul
    captchaHostRef.current.innerHTML = `<div data-captcha-enable="true"></div>`;

    // 2) încearcă să forțezi init/scan (dacă providerul expune API)
    const t = window.setTimeout(() => {
      try {
        const api = window.OGAds || window.ogads || window.OGADS;
        api?.init?.();
        api?.scan?.();
      } catch {}
    }, 60);

    return () => window.clearTimeout(t);
  }, [showCaptcha, captchaNonce, isClaimNowFlow]);

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
        onClick={handlePrimaryAction}
        className="w-full bg-neon-green hover:bg-neon-green/90 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] shadow-neon-green/20"
      >
        <Tag className="w-4 h-4" />
        <span className="text-sm">{primaryButtonText}</span>
      </button>

      {showCaptcha && !isClaimNowFlow && (
        <div className="mt-4">
          <div className="bg-[#2a2d3a] border border-gray-600/50 rounded-xl p-4">
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-white mb-2 blur-sm select-none">SAVE50OFF</div>
              <p className="text-gray-300 text-sm font-semibold tracking-wide">
                Complete the captcha to reveal code
              </p>
            </div>

            {/* host în care injectăm EXACT div-ul cerut */}
            <div
              key={`captcha-host-${brandKey}-${captchaNonce}`}
              ref={captchaHostRef}
              className="w-full min-h-[110px] pointer-events-auto bg-[#1a1c24] rounded-xl border border-gray-600/50 overflow-hidden"
              style={{ position: "relative" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
