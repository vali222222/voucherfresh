import { Tag, Users, Clock } from "lucide-react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";

declare global {
  interface Window {
    OGAds?: any;
    ogads?: any;
    OGADS?: any;
  }
}

/** ===== OGAds / Captcha script ===== */
const OGADS_SCRIPT_SRC = "https://lockedpage1.website/cp/js/n00dp";

let ogadsScriptPromise: Promise<void> | null = null;

function loadOgadsScriptOnce() {
  if (typeof window === "undefined") return Promise.resolve();

  if (window.OGAds || window.ogads || window.OGADS) return Promise.resolve();
  if (ogadsScriptPromise) return ogadsScriptPromise;

  ogadsScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${OGADS_SCRIPT_SRC}"]`);
    if (existing) {
      resolve();
      return;
    }

    const s = document.createElement("script");
    s.src = OGADS_SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("OGAds script failed to load"));
    document.head.appendChild(s);
  });

  return ogadsScriptPromise;
}

/** ===== Redirect settings (outside component) ===== */
const COSTCO_REDIRECT_URL =
  "https://glctrk.org/aff_c?offer_id=941&aff_id=14999&source=costco";
const TARGET_REDIRECT_URL =
  "https://trkio.org/aff_c?offer_id=317&aff_id=14999&source=target";

// 🔁 înlocuiește cu linkul tău real
const DOORDASH_REDIRECT_URL =
  "https://trkio.org/aff_c?offer_id=XXXX&aff_id=14999&source=doordash";

/**
 * Tot ce e aici va avea CTA "Claim Now" + redirect direct.
 * Restul => "Get Coupon Code" + captcha.
 */
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

  // 🔥 asta forțează re-mount + re-scan de fiecare dată când apeși Get Coupon
  const [captchaNonce, setCaptchaNonce] = useState(0);

  const captchaMountRef = useRef<HTMLDivElement | null>(null);

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
    // ✅ Claim Now => direct link
    if (isClaimNowFlow && claimNowUrl) {
      goTo(claimNowUrl);
      return;
    }

    // ✅ Get Coupon Code => de fiecare dată: deschide + retriggerează captcha
    setShowCaptcha(true);
    setCaptchaNonce((n) => n + 1);
  }, [isClaimNowFlow, claimNowUrl, goTo]);

  /**
   * Montăm captcha:
   * - rulează la showCaptcha
   * - rulează iar la fiecare click Get Coupon (captchaNonce se schimbă)
   */
  useEffect(() => {
    if (!showCaptcha || !captchaMountRef.current) return;

    const container = captchaMountRef.current;

    // curățăm complet ca să nu rămână “resturi” de la scan-ul anterior
    container.innerHTML = "";
    container.removeAttribute("data-captcha-enable");

    // OGAds scanează după atributul ăsta
    container.setAttribute("data-captcha-enable", "true");

    let cancelled = false;

    (async () => {
      try {
        await loadOgadsScriptOnce();
        if (cancelled) return;

        // mic delay ca DOM-ul să fie stabil
        window.setTimeout(() => {
          try {
            const api = window.OGAds || window.ogads || window.OGADS;

            // unele builduri au nevoie de init înainte de scan la fiecare mount
            api?.init?.();
            api?.scan?.();
          } catch {}
        }, 60);
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showCaptcha, captchaNonce]);

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

      {/* Butonul rămâne disponibil și când captcha e deschisă,
          ca să poți apăsa iar Get Coupon și să reîncarce captcha */}
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

            <div
              // key forțează re-mount DOM când nonce se schimbă
              key={`captcha-${brandKey}-${captchaNonce}`}
              ref={captchaMountRef}
              className="w-full min-h-[80px] max-h-[100px] pointer-events-auto bg-[#1a1c24] rounded-xl border border-gray-600/50 overflow-hidden"
              style={{ position: "relative" }}
            />
          </div>

          <div className="mt-4 rounded-xl p-4 details-frost">
            <h3 className="text-white font-bold text-lg mb-2">
              <span className="text-neon-green">Offer Details:</span>
            </h3>
            <p className="text-gray-200 text-sm leading-relaxed">
              Apply this discount code when you checkout to get {offer.toLowerCase()} your {brand} purchase and
              receive immediate savings on various products.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
