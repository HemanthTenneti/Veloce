import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@iconify/react";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer id="site-footer" className="bg-[#0D0D0D] text-white px-6 md:px-12 relative z-20 pt-16 gs-section">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        {/* Left */}
        <div>
          <div className="font-display font-bold tracking-tight text-3xl text-white mb-2">
            VELOCE.
          </div>
          <p className="font-normal text-sm text-[#666666] max-w-xs mb-8">
            {t("tagline")}
          </p>
          <div className="flex items-center gap-4 text-white/70">
            <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
              <Icon icon="mdi:instagram" width={20} />
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Email">
              <Icon icon="mdi:email" width={20} />
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Phone">
              <Icon icon="mdi:phone" width={20} />
            </a>
          </div>
        </div>

         {/* Centre */}
         <div>
           <h4 className="font-mono text-[11px] text-[#ff8c00] tracking-[0.12em] mb-6 uppercase">
             {t("navigate")}
           </h4>
           <ul className="space-y-3 font-mono text-sm text-white/80">
             <li>
               <Link href="/" className="hover:text-[#ff8c00] transition-colors">
                 {t("home")}
               </Link>
             </li>
             <li>
               <Link href="/inventory" className="hover:text-[#ff8c00] transition-colors">
                 {t("inventory")}
               </Link>
             </li>
           </ul>
         </div>

         {/* Right */}
         <div>
           <h4 className="font-mono text-[11px] text-[#ff8c00] tracking-[0.12em] mb-6 uppercase">
             {t("getInTouch")}
           </h4>
           <div className="font-mono text-sm text-white space-y-3">
             <div className="flex items-center gap-3">
               <Icon icon="mdi:phone" width={16} className="text-[#ff8c00]" />
               <span>+91 98765 43210</span>
             </div>
             <div className="flex items-center gap-3">
               <Icon icon="mdi:email" width={16} className="text-[#ff8c00]" />
               <span>showroom@veloce.in</span>
             </div>
           </div>
         </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1440px] mx-auto border-t border-[#2A2A2A] py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-normal text-[12px] text-[#444444] flex items-center gap-1">
          <Icon icon="mdi:copyright" width={14} />
          <span>{t("copyright")}</span>
        </div>
        <div className="font-normal text-[12px] text-[#444444] flex gap-6">
          <a href="#" className="hover:text-[#666666] flex items-center gap-1 transition-colors">
            <Icon icon="mdi:shield-check" width={14} />
            <span>{t("privacyPolicy")}</span>
          </a>
          <a href="#" className="hover:text-[#666666] flex items-center gap-1 transition-colors">
            <Icon icon="mdi:file-document" width={14} />
            <span>{t("terms")}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
