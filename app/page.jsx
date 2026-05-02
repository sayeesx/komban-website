import HeroSection from "@/components/HeroSection";
import FleetShowcase from "@/components/FleetShowcase";
import GalleryGrid from "@/components/GalleryGrid";
import AnimatedCount from "@/components/AnimatedCount";

/* ─────────────────────── small reusable atoms ─────────────────────── */
const CONTACT_NUMBERS = {
  kerala: "7594 007 005",
  karnataka: "7594 007 004",
};

const GALLERY_IMAGES = [
  "https://res.cloudinary.com/dhh2nd2bg/image/upload/v1777682980/20260502_060202_1_fcz3zn.png",
  "https://res.cloudinary.com/dhh2nd2bg/image/upload/v1777682980/20260502_060343_1_owx7fs.png",
  "https://res.cloudinary.com/dhh2nd2bg/image/upload/v1777682980/20260502_060232_1_nztdsb.png",
  "https://res.cloudinary.com/dhh2nd2bg/image/upload/v1777682979/20260502_060322_1_zhxjhn.png",
  "https://res.cloudinary.com/dhh2nd2bg/image/upload/v1777682979/20260502_060256_1_buyfie.png",
  "https://res.cloudinary.com/dhh2nd2bg/image/upload/v1777682979/20260502_060107_1_i0rhs7.jpg",
];

function PremiumIcon({ type }) {
  const base = "w-6 h-6 text-accent";
  if (type === "private") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18" />
        <path d="M6 12v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-5" />
        <path d="M7 12V8a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }
  if (type === "events") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7-4.3-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.7-7 10-7 10Z" />
      </svg>
    );
  }
  if (type === "tours") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16" />
      <path d="M6 4h12v16H6z" />
      <path d="M9 11h6M9 15h4" />
    </svg>
  );
}

function WhyIcon({ type }) {
  const base = "w-8 h-8 text-accent";
  if (type === "maintained") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4l-6.9 6.9-3.6 1 1-3.6 6.5-6.9z" />
        <path d="M4 20h16" />
      </svg>
    );
  }
  if (type === "drivers") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </svg>
    );
  }
  if (type === "pricing") {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M7 12h10M7 9h4M7 15h4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-[10px] uppercase tracking-[0.35em] text-white/50 font-body mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
      {children}
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
      {children}
    </h2>
  );
}

function Divider() {
  return <div className="divider-fade" />;
}

/* ─────────────────────────────────────────────────────────────────────
 * PAGE
 * ─────────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    // overflow-x:clip keeps horizontal edges tidy without breaking sticky
    <main className="relative w-full bg-black text-white font-body" style={{ overflowX: "clip" }}>

      {/* ══════════════════════════════════════════════════════════════
          1 + 2. HERO + SCROLL ANIMATION (two-column, integrated)
             Left  — brand copy, headline, CTAs
             Right — live WebP frame canvas driven by scroll
      ══════════════════════════════════════════════════════════════ */}
      <HeroSection scrollHeight="500vh" endHold={0} />

      {/* ══════════════════════════════════════════════════════════════
          3. WHAT WE OFFER
      ══════════════════════════════════════════════════════════════ */}
      <section id="about" className="section-fade relative py-16 md:py-24 lg:py-28 px-4 md:px-6 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <SectionLabel>What We Offer</SectionLabel>
          <SectionHeading>Premium Travel.<br />Your Way.</SectionHeading>
          <Divider />
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/55 font-body mb-5">
            Kerala&apos;s Biggest Fleet
          </p>
          <p className="text-white/55 font-body max-w-2xl mx-auto mb-16 text-base leading-relaxed">
            Komban Bus Agency delivers premium travel experiences across Kerala. Our fleet combines bold design,
            advanced lighting, and comfortable interiors built for long-distance journeys and events.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "private", title: "Private Rentals",    desc: "Exclusive bus hire for your group — no sharing, no compromise." },
              { icon: "events", title: "Events & Weddings",  desc: "Ceremonial transport with custom branding, on time every time." },
              { icon: "tours", title: "Tours & Long Routes", desc: "Interstate and long-distance trips with experienced drivers." },
              { icon: "groups", title: "College & Groups",   desc: "Affordable group bookings for institutions and corporates." },
            ].map((card) => (
              <div key={card.title} className="glass rounded-2xl p-7 text-left flex flex-col gap-3 hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-3">
                  <PremiumIcon type={card.icon} />
                  <h3 className="font-display text-xl text-white">{card.title}</h3>
                </div>
                <p className="text-sm text-white/50 font-body leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. FLEET SHOWCASE + DATE SLOT BOOKING
      ══════════════════════════════════════════════════════════════ */}
      <FleetShowcase />

      {/* ══════════════════════════════════════════════════════════════
          5. EXPERIENCE HIGHLIGHTS
      ══════════════════════════════════════════════════════════════ */}
      <section className="section-fade relative py-16 md:py-24 lg:py-28 px-4 md:px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>The Experience</SectionLabel>
            <SectionHeading>Why It Feels Different</SectionHeading>
            <Divider />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { num: "01", title: "Road Presence",      desc: "Turn heads at every intersection. Our buses are designed to be seen — bold exteriors, LED lighting, powerful stance." },
              { num: "02", title: "Comfort on Distance", desc: "Long routes demand real comfort. Premium seats, smooth suspension, and climate control keep every journey effortless." },
              { num: "03", title: "Custom Interiors",    desc: "Ambient lighting, quality upholstery, and layouts designed for group travel — not just transport." },
              { num: "04", title: "Group Ready",         desc: "Perfect for 20 to 49 passengers. Ideal for tours, weddings, corporate events, college trips, and pilgrimages." },
            ].map((item) => (
              <div key={item.num} className="glass rounded-2xl p-8 flex gap-6 hover:border-accent/20 transition-colors">
                <span className="font-display text-5xl text-accent leading-none select-none">
                  <AnimatedCount to={Number(item.num)} />
                </span>
                <div>
                  <h3 className="font-display text-2xl text-white mb-2">{item.title}</h3>
                  <p className="text-white/50 font-body text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          6. BOOKING FLOW
      ══════════════════════════════════════════════════════════════ */}
      <section className="section-fade relative py-16 md:py-24 lg:py-28 px-4 md:px-6 bg-surface overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-glow-bot opacity-40"
        />
        <div className="max-w-5xl mx-auto text-center">
          <SectionLabel>Booking</SectionLabel>
          <SectionHeading>3 Steps. That&apos;s It.</SectionHeading>
          <Divider />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
            {[
              { step: "1", title: "Select Bus",    desc: "Choose from our fleet based on group size, route, and type." },
              { step: "2", title: "Pick Date",     desc: "Select your travel date, route, and passenger count." },
              { step: "3", title: "Confirm",       desc: "Send an enquiry via WhatsApp or call — we confirm within minutes." },
            ].map((s) => (
              <div key={s.step} className="glass rounded-2xl p-8 flex flex-col items-center text-center gap-3 hover:border-accent/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center font-display text-2xl text-white">
                  {s.step}
                </div>
                <h3 className="font-display text-xl text-white">{s.title}</h3>
                <p className="text-sm text-white/50 font-body leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-row items-stretch justify-center gap-2.5 sm:gap-4">
            <a
              href={`https://wa.me/91${CONTACT_NUMBERS.kerala.replace(/\s/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-8 py-3.5 sm:py-4 bg-accent text-white text-[11px] sm:text-sm font-body font-medium uppercase tracking-[0.22em] sm:tracking-[0.2em] rounded-full hover:bg-accent-dark transition-colors min-w-0 flex-1 sm:flex-initial"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.549 4.118 1.51 5.854L0 24l6.335-1.485A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.806 9.806 0 01-5.003-1.371l-.359-.213-3.72.872.937-3.62-.234-.371A9.818 9.818 0 012.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z"/>
              </svg>
              WhatsApp Booking
            </a>
            <a
              href={`tel:+91${CONTACT_NUMBERS.kerala.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-8 py-3.5 sm:py-4 border border-white/20 text-white text-[11px] sm:text-sm font-body font-medium uppercase tracking-[0.22em] sm:tracking-[0.2em] rounded-full hover:bg-white/5 transition-colors min-w-0 flex-1 sm:flex-initial"
            >
              Call Now
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          7. WHY CHOOSE US
      ══════════════════════════════════════════════════════════════ */}
      <section className="section-fade relative py-16 md:py-24 lg:py-28 px-4 md:px-6 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <SectionLabel>Why Komban</SectionLabel>
          <SectionHeading>Standards Others Can&apos;t Match</SectionHeading>
          <Divider />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
            {[
              { icon: "maintained", stat: "100%",  label: "Maintained Fleet"    },
              { icon: "drivers", stat: "5★",   label: "Experienced Drivers" },
              { icon: "pricing", stat: "Clear", label: "Transparent Pricing" },
              { icon: "time", stat: "On Time", label: "Every Single Trip"  },
            ].map((item) => (
              <div key={item.label} className="glass rounded-2xl p-7 flex flex-col items-center gap-3 hover:border-accent/25 transition-colors">
                <WhyIcon type={item.icon} />
                <span className="font-display text-3xl text-white">{item.stat}</span>
                <span className="text-xs uppercase tracking-widest text-white/50 font-body">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          8. GALLERY STRIP
      ══════════════════════════════════════════════════════════════ */}
      <section id="gallery" className="section-fade relative py-16 md:py-24 lg:py-28 px-4 md:px-6 bg-surface">
        <div className="max-w-6xl mx-auto text-center">
          <SectionLabel>Gallery</SectionLabel>
          <SectionHeading>Stories on Wheels</SectionHeading>
          <p className="text-white/60 font-body text-base md:text-lg mt-4 mb-2 max-w-xl mx-auto">
            Where memories are made.
          </p>
          <Divider />

          <GalleryGrid images={GALLERY_IMAGES} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          9. TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <section className="section-fade relative py-16 md:py-24 lg:py-28 px-4 md:px-6 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <SectionLabel>Testimonials</SectionLabel>
          <SectionHeading>What Passengers Say</SectionHeading>
          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {[
              { quote: "The bus arrived 20 minutes early, the interiors were spotless. Our entire wedding convoy was handled perfectly.", name: "Arjun R.", role: "Wedding Client" },
              { quote: "We do annual college trips — nothing compares to Komban's comfort. The sound system alone was worth it.", name: "Meera K.", role: "College Trip Organiser" },
              { quote: "Booked for a 3-day Kerala tour. Night rides were spectacular — that LED exterior turns heads everywhere.", name: "Rajan P.", role: "Corporate Tour" },
            ].map((t) => (
              <div key={t.name} className="glass rounded-2xl p-8 text-left flex flex-col gap-4 hover:border-accent/20 transition-colors">
                <p className="text-white/65 font-body text-sm leading-relaxed italic">"{t.quote}"</p>
                <div className="mt-auto">
                  <p className="font-body font-semibold text-sm text-white">{t.name}</p>
                  <p className="text-[11px] text-white/35 uppercase tracking-widest font-body">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          10. CONTACT / CTA
      ══════════════════════════════════════════════════════════════ */}
      <section id="contact" className="section-fade relative py-16 md:py-24 lg:py-28 px-4 md:px-6 bg-surface overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-96 bg-glow-red opacity-30"
        />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Contact</SectionLabel>
            <SectionHeading>
              Experience the Journey<br />
              <span className="text-accent">Before It Begins.</span>
            </SectionHeading>
            <Divider />
            <p className="text-white/50 font-body text-sm max-w-lg mx-auto">
              Based in Kerala. Operating across South India. Available for all group sizes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Contact info */}
            <div className="h-full flex flex-col gap-5">
              {[
                { icon: "📞", label: "Phone (Kerala)",     value: `+91 ${CONTACT_NUMBERS.kerala}`, href: `tel:+91${CONTACT_NUMBERS.kerala.replace(/\s/g, "")}` },
                { icon: "💬", label: "Phone (Karnataka)",  value: `+91 ${CONTACT_NUMBERS.karnataka}`, href: `tel:+91${CONTACT_NUMBERS.karnataka.replace(/\s/g, "")}` },
                { icon: "📍", label: "Base",      value: "Kerala, India",   href: null },
              ].map((c) => (
                <div key={c.label} className="glass rounded-xl px-6 py-5 flex items-center gap-4 flex-1 min-h-[98px]">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/35 font-body">{c.label}</p>
                    {c.href
                      ? <a href={c.href} className="text-white font-body font-medium hover:text-accent transition-colors">{c.value}</a>
                      : <p className="text-white font-body font-medium">{c.value}</p>
                    }
                  </div>
                </div>
              ))}

              <div className="glass rounded-xl px-6 py-5 min-h-[110px]">
                <p className="text-[10px] uppercase tracking-widest text-white/35 font-body mb-3">From</p>
                <p className="font-display text-3xl text-accent">₹2000 <span className="text-white/40 text-base">/day</span></p>
                <p className="text-xs text-white/35 font-body mt-1">Based on route, bus type, and duration.</p>
              </div>
            </div>

            {/* Quick enquiry form */}
            <form className="glass rounded-2xl p-8 flex flex-col gap-5 h-full min-h-[100%]">
              <h3 className="font-display text-2xl text-white">Quick Enquiry</h3>

              {[
                { id: "name",       label: "Your Name",       type: "text",  placeholder: "Full name" },
                { id: "phone",      label: "Phone / WhatsApp", type: "tel",   placeholder: "+91 XXXXX XXXXX" },
                { id: "passengers", label: "Passengers",       type: "number",placeholder: "e.g. 35" },
              ].map((f) => (
                <div key={f.id} className="flex flex-col gap-1.5">
                  <label htmlFor={f.id} className="text-[10px] uppercase tracking-widest text-white/40 font-body">{f.label}</label>
                  <input
                    id={f.id}
                    name={f.id}
                    type={f.type}
                    placeholder={f.placeholder}
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-accent/60 transition-colors"
                  />
                </div>
              ))}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="route" className="text-[10px] uppercase tracking-widest text-white/40 font-body">Route / Note</label>
                <textarea
                  id="route"
                  name="route"
                  rows={3}
                  placeholder="e.g. Thrissur → Munnar, 2 days"
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body placeholder:text-white/25 focus:outline-none focus:border-accent/60 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="mt-auto w-full py-4 bg-accent rounded-xl text-sm font-body font-semibold uppercase tracking-[0.2em] hover:bg-accent-dark transition-colors"
              >
                Send Enquiry
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-center mt-20 text-[10px] uppercase tracking-[0.3em] text-white/25 font-body">
          © {new Date().getFullYear()} Komban Bus Agency — Kerala, India
          <div className="mt-4 tracking-[0.15em] text-white/45 normal-case">
            developed by{" "}
            <a
              href="https://narrs.shahr.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-accent transition-colors underline underline-offset-4"
            >
              narrs
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
