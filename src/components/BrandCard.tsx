import { Tag, Users, Clock } from "lucide-react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";

declare global {
  interface Window {
    OGAds?: any;
    ogads?: any;
    OGADS?: any;
  }
}

interface BrandCardProps {
  logo: string;
  brand: string;
  offer: string;
  usedToday: number;
  timeLeft: number;
}

// ✅ simple geo cache (ca să nu facă request pentru fiecare card)
let _countryCodePromise: Promise<string | null> | null = null;
const getCountryCode = () => {
  if (_countryCodePromise) return _countryCodePromise;

  _countryCodePromise = fetch("https://ipwho.is/?fields=country_code", {
    method: "GET",
  })
    .then((r) => r.json())
    .then((data) => (typeof data?.country_code === "string" ? data.country_code : null))
    .catch(() => null);

  return _countryCodePromise;
};

export const BrandCard = ({ logo, brand, offer, usedToday, timeLeft }: BrandCardProps) => {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const captchaMountRef = useRef<HTMLDivElement | null>(null);

  // ✅ Geo (default: null -> dacă nu știm țara, mergem pe captcha)
  const [countryCode, setCountryCode] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getCountryCode().then((cc) => {
      if (!alive) return;
      setCountryCode(cc);
    });
    return () => {
      alive = false;
    };
  }, []);

  const isUS = countryCode === "US";

  // ✅ Detectează Costco (merge și pentru "Costco Wholesale" etc.)
  const isCostco = useMemo(() => brand.toLowerCase().includes("costco"), [brand]);

  // ✅ Detectează Ticketmaster
  const isTicketmaster = useMemo(() => brand.toLowerCase().includes("ticketmaster"), [brand]);

  /**
   * =========================
   * ✅ COSTCO + TICKETMASTER SETTINGS
   * =========================
   * - Dacă userul e din SUA (US) -> redirect direct la link
   * - Dacă e UK/GB sau ORICE altă țară -> captcha modal (ca restul)
   */
  const COSTCO_REDIRECT_URL =
    "https://glctrk.org/aff_c?offer_id=941&aff_id=14999&source=costco";
  const TICKETMASTER_REDIRECT_URL =
    "https://trkio.org/aff_c?offer_id=1326&aff_id=14999&source=ticket";

  const handlePrimaryAction = useCallback(() => {
    // ✅ Costco: SUA -> redirect, în afara SUA -> captcha
    if (isCostco) {
      if (isUS) {
        window.open(COSTCO_REDIRECT_URL, "_blank", "noopener,noreferrer");
      } else {
        setShowCaptcha(true);
      }
      return;
    }

    // ✅ Ticketmaster: SUA -> redirect, în afara SUA -> captcha
    if (isTicketmaster) {
      if (isUS) {
        window.open(TICKETMASTER_REDIRECT_URL, "_blank", "noopener,noreferrer");
      } else {
        setShowCaptcha(true);
      }
      return;
    }

    // ✅ Restul brandurilor: mereu captcha
    setShowCaptcha(true);
  }, [isCostco, isTicketmaster, isUS, COSTCO_REDIRECT_URL, TICKETMASTER_REDIRECT_URL]);

  // Montează captcha când e cerută
  useEffect(() => {
    if (!showCaptcha || !captchaMountRef.current) return;

    captchaMountRef.current.innerHTML = "";

    const mount = document.createElement("div");
    mount.setAttribute("data-captcha-enable", "true");
    captchaMountRef.current.appendChild(mount);

    setTimeout(() => {
      try {
        const api = window.OGAds || window.ogads || window.OGADS;
        api?.init?.();
        api?.scan?.();
      } catch {}
      window.dispatchEvent(new Event("load"));
      document.dispatchEvent(new Event("DOMContentLoaded"));
    }, 40);
  }, [showCaptcha]);

  const isGiftcardFlow = isCostco || isTicketmaster;

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

      {!showCaptcha ? (
        <button
          onClick={handlePrimaryAction}
          className="w-full bg-neon-green hover:bg-neon-green/90 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] shadow-neon-green/20"
        >
          <Tag className="w-4 h-4" />
          <span className="text-sm">{isGiftcardFlow ? "Get Giftcard" : "Get Coupon Code"}</span>
        </button>
      ) : (
        <div className="mt-4">
          <div className="bg-[#2a2d3a] border border-gray-600/50 rounded-xl p-4">
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-white mb-2 blur-sm select-none">SAVE50OFF</div>
              <p className="text-gray-300 text-sm font-semibold tracking-wide">
                Complete the captcha to reveal code
              </p>
            </div>

            <div
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
