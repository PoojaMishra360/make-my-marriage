import Link from "next/link";
import Image from "next/image";

const heroPhoto = "https://lh3.googleusercontent.com/aida-public/AB6AXuCUOv59goVI393lmssPaECK2GRSnB4KvmPEA5bisB730kIeyuVpkKS-4RIThD7NuTkH6N8vQYqCo0BcjTtdSz7AOAmXWEQvDaViIG2C5m8PkqjEclIBoUgYiSCg351evA409JAkZd0NKbhe3BwLqLp8tTCbvA6r-l1NEO-nQi8FTG_GuvJmgi1zrLBoTdi_FqdN2oNOqgigVgnv3wjpQRWivTe-xI1cYqHZAXsvdzY";
const familyPhoto = "https://lh3.googleusercontent.com/aida-public/AB6AXuAzlgMFTB3gXFHyN2KjaBX6FnoiK2QoRNE5JWrbKtnb6qKhCGLV2_finsbW0l_NGI-IqYSQ5t1wBLcLuexZTta0mg3MBrXp7-DiIpH_oLdBHFNeOkbkhgTAl6zxDB4nC0VtAFkKqI8beF2bkNQ-O2twMEVvr0cJWEHCmRVJH_OdXV6DQ24m92-CDn61wjJeTBSeNdDvQSdHOe3HirCywHC4FX5LPrh_8jYju8sCTE";

const features = [
  { number: "01", title: "Plan every event", copy: "Mehendi, Sangeet, Haldi, Pheras, and Reception. Each with its own schedule, venue details, and timeline." },
  { number: "02", title: "Manage guests & RSVPs", copy: "Track attendance family-by-family across all events. Real-time headcounts without messy spreadsheets." },
  { number: "03", title: "WhatsApp & email invites", copy: "Deliver personalized private RSVP links via WhatsApp or email. Guests RSVP with one tap without downloading anything." },
  { number: "04", title: "Share tasks & shopping", copy: "Assign shopping, decor checks, and vendor pickups to parents, siblings, and cousins with clear due dates." },
  { number: "05", title: "Track expenses & bills", copy: "Total visibility across budgets. Attach photos of bills, track vendor advances, and prevent duplicate payments." },
  { number: "06", title: "Save photos & streams", copy: "Share private event photo streams and livestream links with family watching from abroad." },
];

function Mark({ children }: { children: React.ReactNode }) {
  return <span className="landing-mark" aria-hidden="true">{children}</span>;
}

function SaathEmblem() {
  return <span className="saath-emblem" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M16 23.5c-5.6 0-9.5-3.2-10.5-8.2 4.7-.1 8 2.2 10.5 7.1 2.5-4.9 5.8-7.2 10.5-7.1-1 5-4.9 8.2-10.5 8.2Z"/><path d="M16 21.7c-3.8-4.7-4.3-9.4-.8-14.1 4.4 3.8 5.1 8.4.8 14.1Z"/><path d="M16 21.7c3.8-4.7 4.3-9.4.8-14.1-4.4 3.8-5.1 8.4-.8 14.1Z"/><path d="M10.1 24.2h11.8"/></svg></span>;
}

export default function HomePage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link className="landing-brand" href="#top" aria-label="Saath home"><SaathEmblem /><span className="brand-wordmark">Saath</span><span className="brand-divider" /> <small>EST. REGISTRY</small></Link>
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#families">For families</a>
        </nav>
        <div className="landing-header-actions">
          <Link className="landing-signin" href="#get-started">Sign in</Link>
          <Link className="landing-button landing-button-small" href="#get-started">Create your wedding</Link>
        </div>
      </header>

      <section className="landing-hero" id="top">
        <div className="landing-hero-copy">
          <span className="landing-pill"><Mark>⌑</Mark> Private to you and the family you invite</span>
          <h1>Plan your wedding,<br /><em>together.</em></h1>
          <p className="landing-lede">One private place for your events, family, guests, spending, photos, and every little detail.</p>
          <div className="landing-hero-actions">
            <Link className="landing-button" href="#get-started">Create your wedding for free <span aria-hidden="true">→</span></Link>
            <Link className="landing-button landing-button-quiet" href="#get-started">Sign in to your wedding</Link>
          </div>
          <ul className="landing-proof-list" aria-label="Saath principles">
            <li>Zero advertising &amp; spam</li><li>No app installation required</li><li>Family-first access</li>
          </ul>
        </div>
        <div className="landing-hero-visual">
          <Image src={heroPhoto} alt="An Indian couple sharing a quiet moment during a palace wedding ceremony" fill sizes="(max-width: 680px) 100vw, 45vw" unoptimized priority />
          <div className="landing-photo-note"><span className="landing-note-heart" aria-hidden="true">♡</span><div><strong>Aarav &amp; Meera</strong><small>Jaipur 2027 · Private Workspace</small></div><span className="landing-note-dot" aria-hidden="true" /></div>
          <div className="landing-photo-caption"><span className="landing-status-dot" /> Family workspace · sample preview</div>
        </div>
      </section>

      <section className="landing-preview-section" id="workspace-preview">
        <div className="landing-section-heading">
          <p className="landing-kicker">Inside the workspace</p>
          <h2>A calm, shared sanctuary for your celebration.</h2>
          <p>Here is a preview of the private wedding workspace you and your family can use after creating your celebration. The content below is sample data.</p>
        </div>
        <div className="workspace-preview">
          <div className="preview-topbar"><div className="preview-brand"><SaathEmblem /><span><strong>Saath Workspace</strong><small>Aarav &amp; Meera · Jaipur</small></span></div><span className="preview-demo-label">Sample workspace preview · illustrative data</span></div>
          <div className="preview-stats">
            <article className="preview-card preview-event-card"><div className="preview-card-label">UPCOMING CEREMONY <span>3 DAYS TO GO</span></div><h3>Mehendi Ceremony</h3><p>Courtyard at ITC Rajputana, Jaipur</p><div className="preview-progress"><span /></div><small>Venue &amp; vendor setup · 85%</small></article>
            <article className="preview-card"><div className="preview-card-label">GUEST &amp; RSVP TRACKER</div><strong className="preview-number">186 <small>of 248 total</small></strong><div className="preview-progress preview-progress-green"><span /></div><small>75% response · sample data</small></article>
            <article className="preview-card"><div className="preview-card-label">BUDGET &amp; EXPENSES <span>ON TRACK</span></div><strong className="preview-number">₹18.4L <small>of ₹30L allocated</small></strong><p className="preview-soft-note">Clean ledger · 42 sample receipts</p></article>
          </div>
          <div className="preview-lower">
            <article className="preview-card preview-tasks"><div className="preview-card-label">ASSIGNED TASKS &amp; SHOPPING <span>4 DUE THIS WEEK</span></div><div className="preview-task-row"><span className="preview-check checked">✓</span><span><strong>Confirm mehendi artist squad</strong><small>Meera P. · Tomorrow</small></span></div><div className="preview-task-row"><span className="preview-check"/><span><strong>Pick up sherwani from designer</strong><small>Aarav S. · Friday</small></span></div><div className="preview-task-row"><span className="preview-check"/><span><strong>Safas &amp; pagri fabric count</strong><small>Rajesh Chacha · Saturday</small></span></div><div className="preview-task-row"><span className="preview-check"/><span><strong>DJ playlist approvals for Sangeet</strong><small>Cousin Squad · In 4 days</small></span></div></article>
            <article className="preview-card preview-updates"><div className="preview-card-label">FAMILY UPDATES</div><p><span className="update-dot plum" /> Meera added receipt for Mehendi decor <small>14 min ago</small></p><p><span className="update-dot green" /> 24 guests confirmed for Sangeet <small>1 hour ago</small></p><p><span className="update-dot rose" /> Aarav updated airport pickup roster <small>3 hours ago</small></p></article>
          </div>
        </div>
      </section>

      <section className="landing-features-section" id="features">
        <div className="landing-section-heading">
          <p className="landing-kicker">Complete coordination</p>
          <h2>Everything your wedding needs, in one private space.</h2>
          <p>Designed from the ground up for multi-day Indian celebrations with deep family involvement.</p>
        </div>
        <div className="landing-features-grid">
          {features.map((feature, index) => <article className={`landing-feature landing-feature-${index + 1}`} key={feature.number}>
            <span className="feature-number">{feature.number}</span>
            <span className="feature-symbol" aria-hidden="true">{["◷", "◎", "☷", "▤", "▧", "⌂"][index]}</span>
            <h3>{feature.title}</h3><p>{feature.copy}</p>
          </article>)}
        </div>
      </section>

      <section className="landing-how-section" id="how-it-works">
        <div className="landing-section-heading">
          <p className="landing-kicker">Getting started</p>
          <h2>Simple to begin, effortless to share.</h2>
          <p>Built for elegance and clarity, so every generation can participate without tutorials.</p>
        </div>
        <div className="landing-steps-grid">
          <article className="landing-step"><span>01</span><h3>Create your private wedding workspace</h3><p>Set your wedding city, dates, and couples&apos; names in 60 seconds. Always free, no credit card.</p><small>Takes under 1 minute</small></article>
          <article className="landing-step"><span>02</span><h3>Add events &amp; invite family</h3><p>Add your ceremonies and invite both families with secure, passwordless email links.</p><small>No passwords required</small></article>
          <article className="landing-step"><span>03</span><h3>Plan your celebrations together</h3><p>Track RSVPs, manage budgets, assign tasks, and enjoy your wedding journey stress-free.</p><small>Peace of mind guaranteed</small></article>
        </div>
      </section>

      <section className="landing-family-section" id="families">
        <div className="family-copy">
          <p className="landing-kicker">Both sides · One registry</p>
          <h2>Made for two families planning one beautiful celebration.</h2>
          <p className="family-intro">Traditional Indian weddings bring together both sets of parents, aunts, uncles, and siblings. Saath gives everyone one place to follow the celebration and help with the details.</p>
          <ul className="family-points"><li><span>01</span><div><strong>Passwordless family sign-in</strong><p>Family members simply enter their email and tap a secure link — zero passwords to remember.</p></div></li><li><span>02</span><div><strong>Zero hassle for guests</strong><p>Guests do not need an account. They click a WhatsApp or email link and confirm RSVPs in seconds.</p></div></li><li><span>03</span><div><strong>Strictly private &amp; ad-free</strong><p>No commercial vendors, no directory spam, no public social feeds. Only invited people can view your wedding.</p></div></li></ul>
        </div>
        <div className="family-visual"><Image src={familyPhoto} alt="Two family members smiling as they review wedding stationery together" width={1000} height={720} sizes="(max-width: 680px) 100vw, 40vw" unoptimized /><blockquote><span>“</span><p>No more chaotic WhatsApp groups.</p><cite>“Our parents could check hotel arrival lists and ceremony times without asking us a dozen times a day.”<br /><br />— Radhika &amp; Kunal, Mumbai</cite></blockquote></div>
      </section>

      <section className="landing-cta" id="get-started">
        <span className="cta-flower" aria-hidden="true">✳</span>
        <p className="landing-kicker">Your wedding, beautifully organized</p>
        <h2>Your wedding, beautifully organized.</h2>
        <p>Begin your private wedding workspace today and bring both families together in complete serenity.</p>
        <div className="landing-hero-actions landing-bottom-actions"><Link className="landing-button" href="#get-started">Create your wedding for free <span aria-hidden="true">→</span></Link><Link className="landing-button landing-button-quiet" href="#get-started">Sign in</Link></div>
        <small>Free for couples and families · No credit card required · Sign-in and wedding creation are coming later.</small>
      </section>

      <footer className="landing-footer"><div className="footer-top"><Link className="footer-brand" href="#top"><SaathEmblem /><span>Saath</span></Link><p>A private space for your wedding and your family</p><nav aria-label="Footer navigation"><a href="#families">Privacy</a><a href="#how-it-works">Help</a><a href="#get-started">Sign in</a></nav></div><div className="footer-bottom"><span>© 2025 Saath Wedding Platform. Crafted for intimate celebrations.</span><span>Discreet · End-to-end Encrypted</span></div></footer>
    </main>
  );
}
