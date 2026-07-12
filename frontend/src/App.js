import React, { useState, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import ReCAPTCHA from 'react-google-recaptcha';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const RECAPTCHA_SITE_KEY = '6LeHvkwtAAAAAAjgPFOBzi5-gXOsT79LyFhTKh6C';

const WV_NAVY = '#0d1b3e';
const WV_RED = '#e31837';
const WV_WHITE = '#ffffff';
const WV_LIGHT = '#f5f5f5';
const WV_GRAY = '#6c757d';
const WV_BORDER = '#e0e0e0';
const WV_TEXT = '#222222';

const NAV_LINKS = [
  { label: 'About Us', href: 'https://workingvet.com/purpose/', children: [
    { label: 'Our Purpose', href: 'https://workingvet.com/purpose/' },
    { label: 'Our Approach', href: 'https://workingvet.com/approach/' },
    { label: 'Our Certifications', href: 'https://workingvet.com/certifications/' },
    { label: 'Our Leadership', href: 'https://workingvet.com/our-leadership/' },
  ]},
  { label: 'Services', href: 'https://workingvet.com/cloud-migration-services/', children: [
    { label: 'Cloud Migration Services', href: 'https://workingvet.com/cloud-migration-services/' },
    { label: 'Cybersecurity Services', href: 'https://workingvet.com/cybersecurity-services/' },
    { label: 'Big Data & Analytics', href: 'https://workingvet.com/big-data-analytics/' },
    { label: 'Machine Learning & AI', href: 'https://workingvet.com/machine-learning-ai-services/' },
    { label: 'Custom Software Development', href: 'https://workingvet.com/custom-software-development/' },
    { label: 'COTS and SaaS Integration', href: 'https://workingvet.com/cots-and-saas-integration/' },
    { label: 'Training', href: 'https://workingvet.com/training/' },
  ]},
  { label: 'Customers & Partners', href: 'https://workingvet.com/customers/', children: [
    { label: 'Customers', href: 'https://workingvet.com/customers/' },
    { label: 'Case Study', href: 'https://workingvet.com/case-study-dental-clinics/' },
    { label: 'Partners', href: 'https://workingvet.com/partners/' },
  ]},
  { label: 'Careers', href: 'https://workingvet.com/opportunities/', children: [
    { label: 'Opportunities', href: 'https://workingvet.com/opportunities/' },
    { label: 'Benefits', href: 'https://workingvet.com/benefits/' },
  ]},
  { label: 'Innovation', href: 'https://workingvet.com/presenting-priora/', children: [
    { label: 'Presenting Priora', href: 'https://workingvet.com/presenting-priora/' },
    { label: 'On-board Diagnostics', href: 'https://workingvet.com/on-board-diagnostics/' },
  ]},
];

function NavBar({ rightContent }) {
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <nav style={navStyles.nav}>
      <div style={navStyles.inner}>
        <a href="https://workingvet.com">
          <img
            src="https://workingvet.com/wp-content/uploads/2026/06/workingvd05ar03ap02zl-madison3a_transparent-YD08MNkG72HZPK2J.avif"
            alt="WorkingVet"
            style={navStyles.logo}
          />
        </a>
        <div style={navStyles.links}>
          {NAV_LINKS.map(link => (
            <div
              key={link.label}
              style={navStyles.menuItem}
              onMouseEnter={() => setOpenMenu(link.label)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <a href={link.href} style={navStyles.link} target="_blank" rel="noreferrer">
                {link.label} {link.children && '▾'}
              </a>
              {openMenu === link.label && link.children && (
                <div style={navStyles.dropdown}>
                  {link.children.map(child => (
                    <a key={child.label} href={child.href} style={navStyles.dropdownItem} target="_blank" rel="noreferrer">
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={navStyles.right}>
          {rightContent}
          <a href="https://workingvet.com/contact-us/" style={navStyles.contactBtn} target="_blank" rel="noreferrer">
            Contact Us
          </a>
        </div>
      </div>
    </nav>
  );
}

function LoginPage({ loginWithRedirect }) {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const recaptchaRef = useRef(null);

  return (
    <div style={loginStyles.page}>
      <NavBar />
      <div style={loginStyles.hero}>
        <div style={loginStyles.heroInner}>
          <p style={loginStyles.heroEyebrow}>VA HOSPITAL LOCATOR</p>
          <h1 style={loginStyles.heroTitle}>Find VA Health Facilities Near You</h1>
          <div style={loginStyles.heroLine}></div>
          <p style={loginStyles.heroSub}>Trusted by federal agencies for mission-critical IT transformation.</p>
        </div>
      </div>
      <div style={loginStyles.main}>
        <div style={loginStyles.card}>
          <h2 style={loginStyles.cardTitle}>Sign In</h2>
          <p style={loginStyles.cardSub}>Secure access required. Please verify you are human.</p>
          <div style={loginStyles.captchaWrapper}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={(v) => setCaptchaVerified(!!v)}
            />
          </div>
          <button
            style={{
              ...loginStyles.button,
              opacity: captchaVerified ? 1 : 0.5,
              cursor: captchaVerified ? 'pointer' : 'not-allowed',
            }}
            onClick={() => captchaVerified && loginWithRedirect()}
            disabled={!captchaVerified}
          >
            Sign In →
          </button>
          <p style={loginStyles.note}>🔒 Authentication powered by Auth0</p>
        </div>
      </div>
      <footer style={loginStyles.footer}>
        <p>© 2026 WorkingVet LLC · Certified SDVOSB · Deployed on OCI SCCA Landing Zone</p>
      </footer>
    </div>
  );
}

function App() {
  const { isLoading, isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const [zip, setZip] = useState('');
  const [radius, setRadius] = useState('50');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: WV_LIGHT }}>
        <p style={{ color: WV_NAVY, fontSize: 18 }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage loginWithRedirect={loginWithRedirect} />;
  }

  const search = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch(`${BACKEND_URL}/facilities?zip=${zip}&radius=${radius}&limit=20`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDirectionsUrl = (f) => {
    if (!f.address) return null;
    const addr = `${f.address.address1}, ${f.address.city}, ${f.address.state} ${f.address.zip}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
  };

  const navRight = (
    <span style={styles.navUser}>{user?.email} &nbsp;·&nbsp;
      <span
        style={{ cursor: 'pointer', textDecoration: 'underline' }}
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      >Sign Out</span>
    </span>
  );

  return (
    <div style={styles.app}>
      <NavBar rightContent={navRight} />

      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.heroEyebrow}>VA HOSPITAL LOCATOR</p>
          <h1 style={styles.heroTitle}>Find VA Health Facilities Near You</h1>
          <div style={styles.heroLine}></div>
          <form onSubmit={search} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>ZIP CODE</label>
                <input
                  style={styles.input}
                  type="text"
                  value={zip}
                  onChange={e => setZip(e.target.value)}
                  placeholder="Enter ZIP code"
                  maxLength={5}
                  pattern="\d{5}"
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>SEARCH RADIUS</label>
                <select style={styles.select} value={radius} onChange={e => setRadius(e.target.value)}>
                  <option value="25">25 miles</option>
                  <option value="50">50 miles</option>
                  <option value="100">100 miles</option>
                  <option value="200">200 miles</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>&nbsp;</label>
                <button style={styles.searchBtn} type="submit" disabled={loading}>
                  {loading ? 'Searching...' : 'Find VA Facilities →'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div style={styles.content}>
        {error && <div style={styles.error}><strong>Error:</strong> {error}</div>}
        {results && (
          <>
            <div style={styles.resultsMeta}>
              Found <strong>{results.total}</strong> VA health facilit{results.total === 1 ? 'y' : 'ies'}
              {results.city && ` near ${results.city}, ${results.state}`}
            </div>
            {results.total === 0 && (
              <div style={styles.empty}>No VA facilities found within {radius} miles. Try expanding your search radius.</div>
            )}
            {results.facilities.map(f => (
              <div key={f.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardAccent}></div>
                  <div style={styles.cardHeaderContent}>
                    <h3 style={styles.facilityName}>{f.name}</h3>
                    <span style={styles.facilityType}>{f.type}</span>
                  </div>
                  <div style={styles.distance}>
                    <span style={styles.distanceNum}>{f.distance}</span>
                    <span style={styles.distanceUnit}> mi</span>
                  </div>
                </div>
                <div style={styles.cardBody}>
                  {f.address && (
                    <div style={styles.infoRow}>
                      <span style={styles.icon}>📍</span>
                      <span>{f.address.address1}, {f.address.city}, {f.address.state} {f.address.zip}</span>
                    </div>
                  )}
                  {f.phone && (
                    <div style={styles.infoRow}>
                      <span style={styles.icon}>📞</span>
                      <a href={`tel:${f.phone}`} style={styles.link}>{f.phone}</a>
                    </div>
                  )}
                  {f.hours && (
                    <div style={styles.infoRow}>
                      <span style={styles.icon}>🕐</span>
                      <span>{f.hours.monday || 'See website for hours'}</span>
                    </div>
                  )}
                  {f.website && (
                    <div style={styles.infoRow}>
                      <span style={styles.icon}>🌐</span>
                      <a href={f.website} target="_blank" rel="noreferrer" style={styles.link}>Visit Website</a>
                    </div>
                  )}
                  {f.address && (
                    <div style={styles.infoRow}>
                      <a href={getDirectionsUrl(f)} target="_blank" rel="noreferrer" style={styles.directionsBtn}>
                        Get Directions →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <img
            src="https://workingvet.com/wp-content/uploads/2026/06/workingvd05ar03ap02zl-madison3a_transparent-YD08MNkG72HZPK2J.avif"
            alt="WorkingVet"
            style={styles.footerLogo}
          />
          <p style={styles.footerText}>Certified SDVOSB · Powered by VA Facilities API · Deployed on OCI SCCA Landing Zone</p>
          <p style={styles.footerCopy}>© 2026 WorkingVet LLC. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const navStyles = {
  nav: { background: WV_WHITE, borderBottom: `1px solid ${WV_BORDER}`, padding: '10px 0', position: 'sticky', top: 0, zIndex: 200 },
  inner: { maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 32 },
  logo: { height: 44, objectFit: 'contain' },
  links: { display: 'flex', alignItems: 'center', gap: 4, flex: 1 },
  menuItem: { position: 'relative' },
  link: { color: WV_TEXT, fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '8px 10px', display: 'block', whiteSpace: 'nowrap' },
  dropdown: { position: 'absolute', top: '100%', left: 0, background: WV_WHITE, border: `1px solid ${WV_BORDER}`, borderRadius: 6, minWidth: 220, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 300 },
  dropdownItem: { display: 'block', padding: '10px 16px', color: WV_TEXT, fontSize: 13, textDecoration: 'none', borderBottom: `1px solid ${WV_BORDER}` },
  right: { display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' },
  contactBtn: { padding: '8px 20px', fontSize: 13, fontWeight: 700, background: WV_RED, color: WV_WHITE, borderRadius: 20, textDecoration: 'none', whiteSpace: 'nowrap' },
};

const loginStyles = {
  page: { minHeight: '100vh', background: WV_WHITE, display: 'flex', flexDirection: 'column' },
  hero: { background: `linear-gradient(135deg, ${WV_NAVY} 0%, #1a3a6e 100%)`, padding: '60px 0 40px' },
  heroInner: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
  heroEyebrow: { color: WV_RED, fontSize: 12, fontWeight: 700, letterSpacing: '2px', marginBottom: 12 },
  heroTitle: { color: WV_WHITE, fontSize: 36, fontWeight: 700, margin: '0 0 16px' },
  heroLine: { width: 60, height: 4, background: WV_RED, marginBottom: 16 },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 16, margin: 0 },
  main: { flex: 1, display: 'flex', justifyContent: 'center', padding: '48px 20px', background: WV_LIGHT },
  card: { background: WV_WHITE, borderRadius: 8, padding: '36px 32px', maxWidth: 420, width: '100%', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  cardTitle: { color: WV_NAVY, fontSize: 22, fontWeight: 700, margin: '0 0 8px' },
  cardSub: { color: WV_GRAY, fontSize: 14, marginBottom: 24 },
  captchaWrapper: { display: 'flex', justifyContent: 'center', marginBottom: 20 },
  button: { width: '100%', padding: '13px', fontSize: 15, fontWeight: 700, background: WV_RED, color: WV_WHITE, border: 'none', borderRadius: 20, letterSpacing: '0.5px' },
  note: { marginTop: 16, fontSize: 12, color: WV_GRAY, textAlign: 'center' },
  footer: { background: WV_NAVY, color: 'rgba(255,255,255,0.6)', padding: '24px 0', textAlign: 'center', fontSize: 12 },
};

const styles = {
  app: { fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: WV_LIGHT, color: WV_TEXT, display: 'flex', flexDirection: 'column' },
  navUser: { color: WV_GRAY, fontSize: 13 },
  hero: { background: `linear-gradient(135deg, ${WV_NAVY} 0%, #1a3a6e 100%)`, padding: '48px 0 36px' },
  heroInner: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
  heroEyebrow: { color: WV_RED, fontSize: 12, fontWeight: 700, letterSpacing: '2px', marginBottom: 10 },
  heroTitle: { color: WV_WHITE, fontSize: 32, fontWeight: 700, margin: '0 0 14px' },
  heroLine: { width: 60, height: 4, background: WV_RED, marginBottom: 24 },
  form: { width: '100%' },
  formRow: { display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, letterSpacing: '1px' },
  input: { padding: '10px 14px', fontSize: 15, border: 'none', borderRadius: 4, width: 150, background: WV_WHITE },
  select: { padding: '10px 14px', fontSize: 15, border: 'none', borderRadius: 4, width: 150, background: WV_WHITE },
  searchBtn: { padding: '10px 22px', fontSize: 14, fontWeight: 700, background: WV_RED, color: WV_WHITE, border: 'none', borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.5px' },
  content: { flex: 1, maxWidth: 1200, margin: '28px auto', padding: '0 24px', width: '100%', boxSizing: 'border-box' },
  resultsMeta: { marginBottom: 16, fontSize: 15, color: '#444' },
  empty: { background: WV_WHITE, padding: 24, borderRadius: 8, textAlign: 'center', color: WV_GRAY, border: `1px solid ${WV_BORDER}` },
  error: { background: '#fff3f3', border: `1px solid ${WV_RED}`, padding: 16, borderRadius: 8, marginBottom: 16, color: WV_RED },
  card: { background: WV_WHITE, borderRadius: 8, marginBottom: 14, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: `1px solid ${WV_BORDER}` },
  cardHeader: { background: WV_NAVY, color: WV_WHITE, padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 },
  cardAccent: { width: 4, height: 40, background: WV_RED, borderRadius: 2, flexShrink: 0, marginTop: 2 },
  cardHeaderContent: { flex: 1 },
  facilityName: { margin: 0, fontSize: 16, fontWeight: 700 },
  facilityType: { fontSize: 12, opacity: 0.7, marginTop: 2, display: 'block' },
  distance: { textAlign: 'right', flexShrink: 0 },
  distanceNum: { fontSize: 22, fontWeight: 700 },
  distanceUnit: { fontSize: 13, opacity: 0.8 },
  cardBody: { padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8 },
  infoRow: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14 },
  icon: { fontSize: 15, flexShrink: 0 },
  link: { color: WV_NAVY },
  directionsBtn: { display: 'inline-block', marginTop: 4, padding: '6px 16px', background: WV_RED, color: WV_WHITE, borderRadius: 20, textDecoration: 'none', fontSize: 13, fontWeight: 700 },
  footer: { background: WV_NAVY, color: 'rgba(255,255,255,0.6)', padding: '28px 0', marginTop: 'auto' },
  footerInner: { maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' },
  footerLogo: { height: 40, objectFit: 'contain', marginBottom: 12, filter: 'brightness(0) invert(1)' },
  footerText: { fontSize: 12, margin: '4px 0' },
  footerCopy: { fontSize: 11, margin: '8px 0 0', opacity: 0.5 },
};

export default App;
