import { Tag, Users, Clock } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";

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

export const BrandCard = ({ logo, brand, offer, usedToday, timeLeft }: BrandCardProps) => {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [codeRevealed, setCodeRevealed] = useState(false);
  const captchaMountRef = useRef<HTMLDivElement | null>(null);

  // ✅ Detectează Costco (acceptă și "Costco Wholesale" etc.)
  const isCostco = useMemo(() => brand.toLowerCase().includes("costco"), [brand]);

  // Montează captcha când e cerută
  useEffect(() => {
    if (!showCaptcha || !captchaMountRef.current) return;

    // Golim tot
    captchaMountRef.current.innerHTML = "";

    // Creăm mount nou
    const mount = document.createElement("div");
    mount.setAttribute("data-captcha-enable", "true");
    captchaMountRef.current.appendChild(mount);

    // Nudge pentru scanare
    setTimeout(() => {
      try {
        const api = window.OGAds || window.ogads || window.OGADS;
