import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSettings, FiLogOut, FiX } from 'react-icons/fi';
import './User.css';

export default function UserSettings({ userImage, onLogout }) {
  const [open, setOpen] = useState(false); // avatar dropdown
  const [settingsOpen, setSettingsOpen] = useState(false); // modal
  const [selected, setSelected] = useState('general'); // left nav in modal
  const navigate = useNavigate();
  const ref = useRef(null);
  const modalRef = useRef(null);

  // local settings state
  const [localTheme, setLocalTheme] = useState(() => (document.body.classList.contains('theme-girl') ? 'girl' : 'boy'));
  const [subscribed, setSubscribed] = useState(false);
  const [plan, setPlan] = useState('monthly');
  const [saving, setSaving] = useState(false);

  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
    paddingLeft: '10px',
    cursor: 'pointer',
    position: 'relative',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
    color: 'white',
  };

  const handleLogout = () => {
    setOpen(false);
    setSettingsOpen(false);
    if (typeof onLogout === 'function') onLogout();
    navigate('/auth');
  };

  // Close avatar dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Modal: close on ESC and click outside
  useEffect(() => {
    if (!settingsOpen) return;

    function onKey(e) {
      if (e.key === 'Escape') setSettingsOpen(false);
    }
    function onDocClick(e) {
      if (!modalRef.current) return;
      if (!modalRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
    };
  }, [settingsOpen]);

  const toggleTheme = (t) => {
    setLocalTheme(t);
    document.body.classList.remove('theme-boy', 'theme-girl');
    document.body.classList.add(t === 'girl' ? 'theme-girl' : 'theme-boy');
    try { localStorage.setItem('app-theme', t); } catch {}
  };

  const saveSettings = async () => {
    setSaving(true);
    // simulate save (replace with fetch to backend if needed)
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setSettingsOpen(false);
  };

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
      }}
    >
      <img
        src={userImage}
        alt="User"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          objectFit: 'cover',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
        }}
        onClick={() => setOpen((v) => !v)}
      />

      {open && (
        <div
          className="user-menu"
          style={{
            position: 'absolute',
            top: '50px',
            right: 0,
            background: 'var(--menu-bg-dark, #2f2f33)',
            color: 'white',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
            minWidth: '180px',
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li
              style={menuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              onClick={() => {
                setOpen(false);
                navigate('/profile');
              }}
              role="menuitem"
            >
              <span className="nav-label">Profile</span>
              <span className="nav-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
            </li>

            <li
              style={menuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              onClick={() => {
                setOpen(false);
                setSettingsOpen(true);
                setSelected('general');
              }}
              role="menuitem"
            >
              <span style={{ color: 'inherit' }}>Settings</span>
            </li>

            <li
              style={menuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  color: 'inherit',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
                aria-label="Logout"
              >
                <span style={{ color: 'inherit' }}>Logout</span>
                <FiLogOut size={18} style={{ flex: '0 0 18px', color: 'inherit' }} />
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Settings Modal (left nav / right panel like Profile) */}
      {settingsOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.36)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1600,
          }}
        >
          <div
            ref={modalRef}
            className="modal-box"
            style={{
              width: 720,
              maxWidth: '94%',
              background: 'linear-gradient(180deg, var(--card-start, #3f4043), var(--card-end, #2f3032))',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'var(--text, #fff)',
              padding: 0,
              borderRadius: 12,
              boxShadow: '0 18px 48px rgba(2,6,23,0.6)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <header style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(180deg,#4a4a4d,#3a3a3e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                  <FiSettings />
                </div>
                <div>
                  <div style={{ fontWeight: 800 }}>Settings</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Manage your account & subscription</div>
                </div>
              </div>

              <button onClick={() => setSettingsOpen(false)} aria-label="Close" style={{ background: 'transparent', border: 'none', color: 'var(--muted, #cfcfcf)', cursor: 'pointer', fontSize: 20, padding: 8 }}>
                <FiX />
              </button>
            </header>

            {/* body: left nav + right panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 280 }}>
              {/* left nav */}
              <nav className="left-col" aria-label="Settings navigation">
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li
                    onClick={() => setSelected('general')}
                    style={{ padding: '10px', borderRadius: 8, cursor: 'pointer', background: selected === 'general' ? 'rgba(255,255,255,0.04)' : 'transparent' }}
                  >
                    General
                  </li>
                  <li
                    onClick={() => setSelected('subscription')}
                    style={{ padding: '10px', borderRadius: 8, cursor: 'pointer', background: selected === 'subscription' ? 'rgba(255,255,255,0.04)' : 'transparent' }}
                  >
                    Subscription
                  </li>
                  <li
                    onClick={() => setSelected('theme')}
                    style={{ padding: '10px', borderRadius: 8, cursor: 'pointer', background: selected === 'theme' ? 'rgba(255,255,255,0.04)' : 'transparent' }}
                  >
                    Theme
                  </li>
                  <li
                    onClick={() => setSelected('account')}
                    style={{ padding: '10px', borderRadius: 8, cursor: 'pointer', background: selected === 'account' ? 'rgba(255,255,255,0.04)' : 'transparent' }}
                  >
                    Account
                  </li>
                </ul>
              </nav>

              {/* right panel */}
              <section className="right-col">
                {selected === 'general' && (
                  <div>
                    <h3 style={{ marginTop: 0 }}>General</h3>
                    <p style={{ color: 'rgba(255,255,255,0.65)' }}>Basic preferences and quick actions.</p>

                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>Language</div>
                          <div style={{ color: 'rgba(255,255,255,0.6)' }}>Greek (default)</div>
                        </div>
                        <div className="select-wrap">
                          <select className="themed-select" defaultValue="el" aria-label="Language">
                            <option value="el">Greek</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selected === 'subscription' && (
                  <div>
                    <h3 style={{ marginTop: 0 }}>Subscription</h3>
                    <p style={{ color: 'rgba(255,255,255,0.65)' }}>Manage your subscription plan.</p>

                    <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{subscribed ? 'Active subscription' : 'No active subscription'}</div>
                          <div style={{ color: 'rgba(255,255,255,0.6)' }}>{subscribed ? `Plan: ${plan}` : 'Choose a plan and subscribe'}</div>
                        </div>
                        <div>
                          <button onClick={() => setSubscribed((s) => !s)} className={subscribed ? 'btn ghost' : 'btn'}>
                            {subscribed ? 'Cancel subscription' : 'Subscribe'}
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="radio" name="plan" value="monthly" checked={plan === 'monthly'} onChange={() => setPlan('monthly')} />
                          <span style={{ color: 'var(--muted, #cfcfcf)' }}>Monthly — €4.99/mo</span>
                        </label>

                        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="radio" name="plan" value="annual" checked={plan === 'annual'} onChange={() => setPlan('annual')} />
                          <span style={{ color: 'var(--muted, #cfcfcf)' }}>Annual — €49.99/yr</span>
                        </label>
                      </div>

                      <div style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <small>Note: This demo doesn’t process payments. Hook a payment gateway (Stripe, Paddle) to implement real billing.</small>
                      </div>

                    </div>
                  </div>
                )}

                {selected === 'theme' && (
                  <div>
                    <h3 style={{ marginTop: 0 }}>Theme</h3>
                    <p style={{ color: 'rgba(255,255,255,0.65)' }}>Switch the app visual theme.</p>

                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      <button onClick={() => toggleTheme('boy')} className={localTheme === 'boy' ? 'btn' : 'btn ghost'}>Boy</button>
                      <button onClick={() => toggleTheme('girl')} className={localTheme === 'girl' ? 'btn' : 'btn ghost'}>Girl</button>
                    </div>
                  </div>
                )}

                {selected === 'account' && (
                  <div>
                    <h3 style={{ marginTop: 0 }}>Account</h3>
                    <p style={{ color: 'rgba(255,255,255,0.65)' }}>Profile actions</p>

                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      <button className="btn ghost" onClick={() => { setSettingsOpen(false); navigate('/profile'); }}>Open profile</button>
                      <button className="btn" onClick={handleLogout}>Logout</button>
                    </div>

                  </div>
                )}

                {/* footer actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                  <button className="btn ghost" onClick={() => setSettingsOpen(false)}>Close</button>
                  <button className="btn" onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                </div>

              </section>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
