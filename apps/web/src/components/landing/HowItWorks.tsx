"use client";

export default function HowItWorks() {
  return (
    <section
      className="py-24 md:py-32 relative gs-section overflow-hidden"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="mb-16">
          <span className="font-mono text-xs text-[#CC0000] tracking-[0.15em] block mb-3">
            THE PROCESS
          </span>
          <h2
            className="font-display font-bold tracking-tight text-4xl md:text-[3.5vw]"
            style={{ color: "var(--text-primary)" }}
          >
            Simple. Transparent. Yours.
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 stack-container">
          {/* Dashed line connecting cards on desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] border-t border-dashed border-[#CC0000] z-0 opacity-30" />

          {/* Card 1 */}
          <div
            className="rounded-[20px] p-8 z-10 relative shadow-theme stack-card"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-start mb-12">
              <span className="font-mono text-xl text-[#CC0000]">01</span>
              <div className="w-12 h-12 relative flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
                  <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1" fill="none" className="ring-anim" style={{ animationDelay: "0s" }} />
                  <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1" fill="none" className="ring-anim" style={{ animationDelay: "0.5s" }} />
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" className="ring-anim" style={{ animationDelay: "1s" }} />
                </svg>
              </div>
            </div>
            <h3
              className="font-display font-bold tracking-tight text-2xl mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Browse &amp; Discover.
            </h3>
            <p style={{ color: "var(--text-secondary)" }} className="font-normal text-sm">
              Explore our curated inventory online or in-person. Detailed specs,
              high-res galleries, and honest condition reports.
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="rounded-[20px] p-8 z-10 relative shadow-theme stack-card"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-start mb-12">
              <span className="font-mono text-xl text-[#CC0000]">02</span>
              <div className="w-16 h-12 relative flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path d="M10,40 L15,25 L35,20 L65,20 L85,25 L90,40 Z" stroke="currentColor" strokeWidth="1" fill="none" className="opacity-30" />
                  <circle cx="25" cy="40" r="6" stroke="currentColor" strokeWidth="1" fill="none" className="opacity-30" />
                  <circle cx="75" cy="40" r="6" stroke="currentColor" strokeWidth="1" fill="none" className="opacity-30" />
                  <line x1="0" y1="0" x2="0" y2="50" stroke="#CC0000" strokeWidth="1" className="animate-scan" />
                </svg>
              </div>
            </div>
            <h3
              className="font-display font-bold tracking-tight text-2xl mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Reserve &amp; Inspect.
            </h3>
            <p style={{ color: "var(--text-secondary)" }} className="font-normal text-sm">
              Secure your chosen vehicle with a fully refundable deposit.
              Schedule a comprehensive test drive at your convenience.
            </p>
          </div>

          {/* Card 3 */}
          <div
            className="rounded-[20px] p-8 z-10 relative shadow-theme stack-card"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-start mb-12">
              <span className="font-mono text-xl text-[#CC0000]">03</span>
              <div className="w-16 h-12 relative flex items-center justify-center">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path d="M0,25 L20,25 L30,5 L45,45 L55,15 L65,25 L100,25" stroke="#CC0000" strokeWidth="1.5" fill="none" strokeLinejoin="round" className="ekg-path" />
                </svg>
              </div>
            </div>
            <h3
              className="font-display font-bold tracking-tight text-2xl mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Finance &amp; Drive.
            </h3>
            <p style={{ color: "var(--text-secondary)" }} className="font-normal text-sm">
              Tailored finance packages and seamless handover process. Drive away
              with complete confidence and peace of mind.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
