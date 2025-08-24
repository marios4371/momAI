import React, { useState, useEffect, useRef } from "react";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState({
    name: "Marios Kalogerakis",
    email: "marios@example.com",
    credits: 120,
    location: "Athens, GR",
    title: "Product Designer",
  });

  const [social, setSocial] = useState([
    { id: 1, label: "Twitter", value: "@marios" },
    { id: 2, label: "LinkedIn", value: "marios-link" },
  ]);

  const [education, setEducation] = useState([
    { id: 1, school: "Univ. of Athens", degree: "MSc Computer Science" },
  ]);

  const [selected, setSelected] = useState("userInfo");
  const [editing, setEditing] = useState(null);
  const [formValues, setFormValues] = useState({});
  const lineRef = useRef(null);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const onScroll = () => {
      document.querySelectorAll(".hide-on-line").forEach((n) => {
        const hidden = window.scrollY > 8;
        n.classList.toggle("is-hidden", hidden);
      });
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openEdit = (type, payload = {}) => {
    setFormValues(payload);
    setEditing({ type, id: payload.id });
  };

  const closeEdit = () => {
    setEditing(null);
    setFormValues({});
  };

  const saveEdit = () => {
    if (!editing) return;

    if (editing.type === "user") {
      setUser((u) => ({ ...u, ...formValues }));
    } else if (editing.type === "social") {
      if (editing.id) {
        setSocial((arr) => arr.map((s) => (s.id === editing.id ? { ...s, ...formValues } : s)));
      } else {
        setSocial((arr) => [...arr, { id: Date.now(), ...formValues }]);
      }
    } else if (editing.type === "education") {
      if (editing.id) {
        setEducation((arr) => arr.map((e) => (e.id === editing.id ? { ...e, ...formValues } : e)));
      } else {
        setEducation((arr) => [...arr, { id: Date.now(), ...formValues }]);
      }
    } else if (editing.type === "credits") {
      setUser((u) => ({ ...u, credits: Number(formValues.credits || u.credits) }));
    }

    closeEdit();
  };

  const removeSocial = (id) => setSocial((arr) => arr.filter((s) => s.id !== id));
  const removeEducation = (id) => setEducation((arr) => arr.filter((e) => e.id !== id));
  const addNew = (type) => openEdit(type, {});
  
  // see profile
  const [previewOpen, setPreviewOpen] = useState(false);
  const closePreview = () => setPreviewOpen(false);

  // helpers
  const RightPanel = () => {
    if (selected === "help") {
      return (
        <section className="panel-section">
          <h2>Help & Support</h2>
          <p className="muted">Χρειάζεσαι βοήθεια; Εδώ θα βρείς βασικές οδηγίες και links υποστήριξης.</p>

          <div className="list">
            <div className="listitem">
              <div>
                <strong>Account</strong>
                <div className="muted small">Information about login, security and profile</div>
              </div>
              <div className="listactions">
                <a className="btn ghost" href="/help/account">Open</a>
              </div>
            </div>

            <div className="listitem">
              <div>
                <strong>Billing</strong>
                <div className="muted small">Top-up credits, invoices and payments</div>
              </div>
              <div className="listactions">
                <a className="btn ghost" href="/help/billing">Open</a>
              </div>
            </div>

            <div className="listitem">
              <div>
                <strong>Contact Support</strong>
                <div className="muted small">Αποστολή ticket ή chat</div>
              </div>
              <div className="listactions">
                <a className="btn ghost" href="/support">Contact</a>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (selected === "credits") {
      return (
        <section className="panel-section">
          <h2>Credits</h2>
          <p className="muted">Available credits for the account</p>
          <div className="row">
            <div className="label">Credits</div>
            <div className="value">{user.credits}</div>
            <div className="actions">
              <button onClick={() => openEdit("credits", { credits: user.credits })}>Edit</button>
            </div>
          </div>
        </section>
      );
    }

    if (selected === "social") {
      return (
        <section className="panel-section">
          <h2>Social</h2>
          <p className="muted">Connected profiles</p>
          <div className="list">
            {social.map((s) => (
              <div key={s.id} className="listitem">
                <div>
                  <strong>{s.label}</strong>
                  <div className="muted small">{s.value}</div>
                </div>
                <div className="listactions">
                  <button onClick={() => openEdit("social", s)} className="btn ghost">Edit</button>
                  <button onClick={() => removeSocial(s.id)} className="btn ghost danger">Remove</button>
                </div>
              </div>
            ))}
            <div className="add-row">
              <button onClick={() => addNew("social")} className="btn ghost">Add profile</button>
            </div>
          </div>
        </section>
      );
    }

    if (selected === "education") {
      return (
        <section className="panel-section">
          <h2>Education</h2>
          <p className="muted">Academic background</p>
          <div className="list">
            {education.map((e) => (
              <div key={e.id} className="listitem">
                <div>
                  <strong>{e.school}</strong>
                  <div className="muted small">{e.degree}</div>
                </div>
                <div className="listactions">
                  <button onClick={() => openEdit("education", e)} className="btn ghost">Edit</button>
                  <button onClick={() => removeEducation(e.id)} className="btn ghost danger">Remove</button>
                </div>
              </div>
            ))}
            <div className="add-row">
              <button onClick={() => addNew("education")} className="btn ghost">Add education</button>
            </div>
          </div>
        </section>
      );
    }

    // default user info
    return (
      <section className="panel-section">
        <h2>{user.name}</h2>
        <p className="muted">{user.title} • {user.location}</p>

        <div style={{ marginTop: 18 }}>
          <div className="row">
            <div className="label">Email</div>
            <div className="value">{user.email}</div>
            <div className="actions">
              <button onClick={() => openEdit("user", user)}>Edit</button>
            </div>
          </div>

          <div className="row">
            <div className="label">Job</div>
            <div className="value">{user.title}</div>
            <div className="actions">
              <button onClick={() => openEdit("user", user)}>Edit</button>
            </div>
          </div>

          <div className="row">
            <div className="label">City</div>
            <div className="value">{user.location}</div>
            <div className="actions">
              <button onClick={() => openEdit("user", user)}>Edit</button>
            </div>
          </div>

          <div className="row">
            <div className="label">Credits</div>
            <div className="value">{user.credits}</div>
            <div className="actions">
              <button onClick={() => openEdit("credits", { credits: user.credits })}>Top-up</button>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="profile-root" ref={lineRef}>
      <div className="centered-wrapper">
        <main className="profile-table" role="region" aria-label="Profile">
          <aside className="left-col" aria-hidden={false}>
            <div className="profile-header">
              <div className="avatar" aria-hidden="true">{user.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
              <div className="left-info">
                <div className="left-name">{user.name}</div>
                <div className="left-title">{user.title}</div>
              </div>
            </div>

            <ul>
              <li
                className={selected === "userInfo" ? "active" : ""}
                onClick={() => { setSelected("userInfo"); if (editing) closeEdit(); }}
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
                className={selected === "credits" ? "active" : ""}
                onClick={() => { setSelected("credits"); if (editing) closeEdit(); }}
              >
                <span className="nav-label">Credits</span>
                <span className="nav-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"></rect>
                    <path d="M16 3v4"></path>
                    <path d="M8 3v4"></path>
                    <circle cx="12" cy="14" r="3"></circle>
                  </svg>
                </span>
              </li>

              <li
                className={selected === "social" ? "active" : ""}
                onClick={() => { setSelected("social"); if (editing) closeEdit(); }}
              >
                <span className="nav-label">Social</span>
                <span className="nav-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <path d="M22 4L12 14.01l-3-3"></path>
                  </svg>
                </span>
              </li>

              <li
                className={selected === "education" ? "active" : ""}
                onClick={() => { setSelected("education"); if (editing) closeEdit(); }}
              >
                <span className="nav-label">Education</span>
                <span className="nav-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12l-10 6L2 12l10-6 10 6z"></path>
                    <path d="M2 12v6a2 2 0 0 0 2 2h16"></path>
                  </svg>
                </span>
              </li>

              <li
                className={selected === "help" ? "active" : ""}
                onClick={() => { setSelected("help"); if (editing) closeEdit(); }}
              >
                <span className="nav-label">Help</span>
                <span className="nav-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3"></path>
                    <path d="M12 17h.01"></path>
                    <circle cx="12" cy="12" r="10" strokeWidth="1"></circle>
                  </svg>
                </span>
              </li>
            </ul>
          </aside>

          <section className="right-col">
            <RightPanel />
          </section>
        </main>
      </div>

      {editing && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box">
            <h3>{editing.type === "user" ? "Edit profile" :
                 editing.type === "social" ? "Edit social" :
                 editing.type === "education" ? "Edit education" :
                 "Edit credits"}</h3>

            {editing.type === "user" && (
              <>
                <label>Name</label>
                <input value={formValues.name ?? user.name} onChange={(e) => setFormValues((s) => ({ ...s, name: e.target.value }))} />

                <label>Email</label>
                <input value={formValues.email ?? user.email} onChange={(e) => setFormValues((s) => ({ ...s, email: e.target.value }))} />

                <label>Job</label>
                <input value={formValues.title ?? user.title} onChange={(e) => setFormValues((s) => ({ ...s, title: e.target.value }))} />

                <label>City</label>
                <input value={formValues.location ?? user.location} onChange={(e) => setFormValues((s) => ({ ...s, location: e.target.value }))} />

              </>
            )}

            {editing.type === "credits" && (
              <>
                <label>Credits</label>
                <input type="number" value={formValues.credits ?? user.credits} onChange={(e) => setFormValues((s) => ({ ...s, credits: e.target.value }))} />
              </>
            )}

            {editing.type === "social" && (
              <>
                <label>Network</label>
                <input value={formValues.label ?? ""} onChange={(e) => setFormValues((s) => ({ ...s, label: e.target.value }))} />
                <label>Handle / URL</label>
                <input value={formValues.value ?? ""} onChange={(e) => setFormValues((s) => ({ ...s, value: e.target.value }))} />
              </>
            )}

            {editing.type === "education" && (
              <>
                <label>School</label>
                <input value={formValues.school ?? ""} onChange={(e) => setFormValues((s) => ({ ...s, school: e.target.value }))} />
                <label>Degree</label>
                <input value={formValues.degree ?? ""} onChange={(e) => setFormValues((s) => ({ ...s, degree: e.target.value }))} />
              </>
            )}

            <div className="modal-actions">
              <button className="btn ghost" onClick={closeEdit}>Cancel</button>
              <button className="btn" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      <button
      className="see-profile-btn"
      onClick={() => setPreviewOpen(true)}
      aria-haspopup="dialog"
      >
        See Profile
      </button>

      {/* How it looks public */}
      {previewOpen && (
        <div className="preview-overlay" role="dialog" aria-modal="true" onClick={closePreview}>
          <div className="preview-box" onClick={(e) => e.stopPropagation()}>
            <header className="preview-header">
              <div className="preview-avatar" aria-hidden="true">
                {user.name.split(" ").map(n => n[0]).slice(0,2).join("")}
              </div>
              <div className="preview-hdr-info">
                <div className="preview-name">{user.name}</div>
                <div className="preview-sub">{user.title} • {user.location}</div>
              </div>
              <button className="preview-close" onClick={closePreview} aria-label="Close preview">✕</button>
            </header>

            <div className="preview-body">
              <section className="preview-section">
                <h4>About</h4>
                <p className="muted">{user.email}</p>
                <p className="muted">Credits: {user.credits}</p>
              </section>

              <section className="preview-section">
                <h4>Social</h4>
                <ul className="preview-list">
                  {social.map(s => <li key={s.id}><strong>{s.label}:</strong> <span className="muted">{s.value}</span></li>)}
                </ul>
              </section>

              <section className="preview-section">
                <h4>Education</h4>
                <ul className="preview-list">
                  {education.map(e => <li key={e.id}><strong>{e.school}:</strong> <span className="muted">{e.degree}</span></li>)}
                </ul>
              </section>
            </div>

            <footer className="preview-actions">
              <button className="btn ghost" onClick={closePreview}>Close</button>
              <button className="btn" onClick={() => { /* if i want redirect to public window */ }}>Open public view</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}