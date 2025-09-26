import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';
import {
  Box,
  Button,
  Checkbox,
  CssBaseline,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  TextField,
  Typography,
  Stack,
  Card,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { GoogleIcon, FacebookIcon } from '../components/CustomIcons.jsx';

const publicLogoPath = '/ai.png';

// Safe detection of API base for CRA, Vite or fallback to localhost
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  window.REACT_APP_API_BASE ||
  'http://localhost:8080';

/* ---------- Styled containers ---------- */
const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(3),
  gap: theme.spacing(2),
  margin: 'auto',
  borderRadius: 14,
  backgroundColor: '#2f2f33',
  color: '#fff',
  boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
  [theme.breakpoints.up('sm')]: {
    width: 520,
    padding: theme.spacing(4),
  },
}));

const PageStack = styled(Stack)(() => ({
  height: '100%',
  minHeight: '100vh',
  padding: '1rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

function CheckboxIconUnchecked() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 18,
        height: 18,
        borderRadius: 4,
        boxSizing: 'border-box',
        border: '2px solid #777',
        background: 'transparent',
      }}
    />
  );
}

function CheckboxIconChecked() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 18,
        height: 18,
        borderRadius: 4,
        background: '#6f6f74',
        boxSizing: 'border-box',
        border: '2px solid #6f6f74',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 4.1L4.2 7.5L11 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function AuthPage({ onAuth, setTheme }) {
  // mode: 'signIn' | 'signUp'
  const [mode, setMode] = useState('signIn');

  // Note: `name` -> will be sent as `username` to backend (keeps User.java shape)
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // email field
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('boy');

  // validation states
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState('');

  // server + loading
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Google login guards
  const [googleBusy, setGoogleBusy] = useState(false);
  const gsiRef = React.useRef({
    initialized: false,
    prompting: false,
    clientId: null,
    buttonRendered: false,
  });
  const googleBtnRef = React.useRef(null);

  const navigate = useNavigate();

  const validateSignUp = () => {
    let valid = true;
    if (mode === 'signUp') {
      if (!name || name.trim().length < 1) {
        setNameError(true);
        setNameErrorMessage('Name is required.');
        valid = false;
      } else {
        setNameError(false);
        setNameErrorMessage('');
      }
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }
    if (!password || password.length < 3) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 3 characters.');
      valid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }
    return valid;
  };

  // helper fetch functions
  async function apiRegister({ username, email, password }) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    if (!res.ok) {
      const msg = typeof data === 'string' ? data : data?.message || JSON.stringify(data);
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  async function apiLogin({ email, password }) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    if (!res.ok) {
      const msg = typeof data === 'string' ? data : data?.message || JSON.stringify(data);
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  // Utilities for initials
  const getInitialsFromName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return fullName.trim().slice(0, 2).toUpperCase();
  };
  const getInitialsFromEmail = (em) => {
    if (!em) return '';
    const local = em.split('@')[0] || '';
    return local.slice(0, 2).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateSignUp()) return;

    setLoading(true);
    try {
      if (mode === 'signUp') {
        const payload = { username: name.trim(), email: email.trim(), password };
        const user = await apiRegister(payload);

        try {
          const uid = String(user?.id ?? user?.userId ?? user?._id ?? '');
          if (uid) localStorage.setItem('momai_user_id', uid);
          localStorage.setItem('momai_login_provider', 'local');
          if (name?.trim()) {
            localStorage.setItem('momai_user_name', name.trim());
            const initials = getInitialsFromName(name.trim());
            if (initials) localStorage.setItem('momai_user_initials', initials);
          }
          if (email?.trim()) localStorage.setItem('momai_user_email', email.trim());
          localStorage.removeItem('momai_user_photo');
        } catch (e) {}

        if (typeof setTheme === 'function') setTheme(gender);
        if (typeof onAuth === 'function') onAuth();
        navigate('/', { replace: true });
      } else {
        const payload = { email: email.trim(), password };
        const user = await apiLogin(payload);

        try {
          const uid = String(user?.id ?? user?.userId ?? user?._id ?? '');
          if (uid) localStorage.setItem('momai_user_id', uid);
          localStorage.setItem('momai_login_provider', 'local');
          if (email?.trim()) {
            localStorage.setItem('momai_user_email', email.trim());
            const currentInitials = localStorage.getItem('momai_user_initials');
            const currentName = localStorage.getItem('momai_user_name');
            if (!currentInitials && !currentName) {
              const initials = getInitialsFromEmail(email.trim());
              if (initials) localStorage.setItem('momai_user_initials', initials);
            }
          }
          localStorage.removeItem('momai_user_photo');
        } catch (e) {}

        if (typeof onAuth === 'function') onAuth();
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Auth error', err);
      setServerError(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  // Google Login: load script once
  async function ensureGoogleScript() {
    if (window.google && window.google.accounts) return;
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // Helper: decode ID Token (JWT) safely to get claims
  function decodeJwtPayload(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return {};
    }
  }

  // Σταθερός handler: παίρνει credential, μιλάει στο backend, ενημερώνει UI
  const onGoogleCredential = React.useCallback(async (resp) => {
    try {
      const idToken = resp?.credential;
      if (!idToken) {
        setServerError('Google login failed: no credential received.');
        return;
      }

      // POST στο backend για verify + find-or-create
      const backendRes = await fetch(`${API_BASE}/api/auth/oauth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const text = await backendRes.text();
      let userDto;
      try { userDto = JSON.parse(text); } catch { userDto = text; }
      if (!backendRes.ok) {
        const msg = typeof userDto === 'string' ? userDto : userDto?.message || 'Google login failed.';
        throw new Error(msg);
      }

      // Optional: claims για UI
      const claims = decodeJwtPayload(idToken);
      const sub = String(claims?.sub || '');
      const mail = String(userDto?.email || claims?.email || '');
      const fullName = String(userDto?.username || claims?.name || '');
      const picture = String(claims?.picture || '');

      try {
        const uid = String(userDto?.id ?? sub ?? '');
        if (uid) localStorage.setItem('momai_user_id', uid);
        localStorage.setItem('momai_login_provider', 'google');
        if (mail) localStorage.setItem('momai_user_email', mail);
        if (fullName) localStorage.setItem('momai_user_name', fullName);
        const initials = fullName
          ? (fullName.trim().split(/\s+/).length >= 2
              ? (fullName.trim().split(/\s+/)[0][0] + fullName.trim().split(/\s+/)[1][0]).toUpperCase()
              : fullName.trim().slice(0, 2).toUpperCase())
          : (mail ? (mail.split('@')[0] || '').slice(0, 2).toUpperCase() : '');
        if (initials) localStorage.setItem('momai_user_initials', initials);
        if (picture) localStorage.setItem('momai_user_photo', picture);
      } catch {}

      if (typeof onAuth === 'function') onAuth();
      navigate('/', { replace: true });
    } catch (e) {
      console.error('Google login error', e);
      setServerError(e.message || 'Google login failed.');
    } finally {
      gsiRef.current.prompting = false;
      setGoogleBusy(false);
    }
  }, [navigate, onAuth]);

  // Initialize Google (render κρυφό επίσημο κουμπί)
  const initGoogle = React.useCallback(async () => {
    if (gsiRef.current.initialized) return;
    await ensureGoogleScript();
    const clientId =
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) ||
      window.GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error('Missing Google client ID (VITE_GOOGLE_CLIENT_ID).');

    if (gsiRef.current.initialized) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: onGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
      // αφήνουμε το FedCM στην κρίση της Google button ροής
    });

    // Render επίσημο κουμπί σε offscreen container (δεν φαίνεται)
    if (googleBtnRef.current && !gsiRef.current.buttonRendered) {
      try {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: 300,
        });
        gsiRef.current.buttonRendered = true;
      } catch (e) {
        console.warn('renderButton failed, will fallback to prompt()', e);
      }
    }

    gsiRef.current.clientId = clientId;
    gsiRef.current.initialized = true;
  }, [onGoogleCredential]);

  // Κουμπί "Login from Google"
  const handleGoogleLogin = async () => {
    setServerError('');
    if (gsiRef.current.prompting) return;
    setGoogleBusy(true);

    try {
      await initGoogle();

      // 1) Προσπάθησε να πατήσεις προγραμματικά το επίσημο (κρυφό) κουμπί
      const btn = googleBtnRef.current
        ? googleBtnRef.current.querySelector('div[role="button"]')
        : null;

      if (btn) {
        gsiRef.current.prompting = true;
        btn.click(); // ανοίγει το επίσημο flow (account chooser/popup)
        // δεν βάζουμε timeout εδώ — το official flow θα καλέσει callback ή ο χρήστης θα κλείσει
        return;
      }

      // 2) Fallback: One Tap / FedCM prompt (σε περίπτωση που δεν έγινε render το κουμπί)
      try { window.google.accounts.id.cancel(); } catch {}
      gsiRef.current.prompting = true;
      window.google.accounts.id.prompt();

      // safety fallback ώστε να μην μείνει disabled το κουμπί αν ο χρήστης αγνοήσει το prompt
      const releaseAfterMs = 15000;
      const start = Date.now();
      const timer = setInterval(() => {
        const stillPrompting = gsiRef.current.prompting;
        const elapsed = Date.now() - start;
        if (!stillPrompting || elapsed > releaseAfterMs) {
          clearInterval(timer);
          if (stillPrompting) {
            gsiRef.current.prompting = false;
            setGoogleBusy(false);
          }
        }
      }, 500);
    } catch (e) {
      console.error('Google script/init error', e);
      setServerError(e.message || 'Unable to start Google login.');
      gsiRef.current.prompting = false;
      setGoogleBusy(false);
    }
  };

  // Facebook (placeholder)
  const handleFacebookLogin = () => {
    try {
      localStorage.setItem('momai_login_provider', 'facebook');
      if (name?.trim()) {
        localStorage.setItem('momai_user_name', name.trim());
        const initials = getInitialsFromName(name.trim());
        if (initials) localStorage.setItem('momai_user_initials', initials);
        localStorage.setItem('momai_user_id', `fb:${name.trim().replace(/\s+/g, '_')}`);
      } else if (email?.trim()) {
        localStorage.setItem('momai_user_email', email.trim());
        const initials = getInitialsFromEmail(email.trim());
        if (initials) localStorage.setItem('momai_user_initials', initials);
        localStorage.setItem('momai_user_id', `fb:${email.trim()}`);
      }
      localStorage.removeItem('momai_user_photo');
      if (typeof onAuth === 'function') onAuth();
      navigate('/', { replace: true });
    } catch (e) {
      console.error('Facebook login stub failed', e);
    }
  };

  const logoSrc = publicLogoPath;

  return (
    <div className="auth-page-root">
      <CssBaseline />
      <PageStack direction="column" justifyContent="center">
        <StyledCard variant="outlined" elevation={0}>
          {mode === 'signUp' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography component="h1" variant="h4" sx={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', color: '#fff', lineHeight: 1, fontWeight: 600 }}>
                Welcome to parentAI
              </Typography>
              <Box component="img" src={logoSrc} alt="logo" sx={{ width: 36, height: 36, borderRadius: 1, objectFit: 'cover', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }} />
            </Box>
          ) : (
            <Typography component="h1" variant="h4" sx={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', color: '#fff', ml: 4, fontWeight: 600 }} />
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#323236', p: 3, borderRadius: 2, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }}>
            {serverError && <Typography sx={{ color: '#ffb4b4', fontSize: 14 }}>{serverError}</Typography>}

            {mode === 'signUp' && (
              <FormControl>
                <FormLabel htmlFor="name" sx={{ mb: 1, color: '#ddd' }}>Full name</FormLabel>
                <TextField
                  id="name"
                  name="name"
                  placeholder="Mom AI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                  error={nameError}
                  helperText={nameError ? nameErrorMessage : ''}
                  variant="filled"
                  sx={{ '& .MuiFilledInput-root': { backgroundColor: '#2e2e31', color: '#fff' }, '& .MuiFormHelperText-root': { color: '#f3dcdc' }, '& .MuiInputBase-input': { color: '#fff' } }}
                />
              </FormControl>
            )}

            <FormControl>
              <FormLabel htmlFor="email" sx={{ mb: 1, color: '#ddd' }}>Email</FormLabel>
              <TextField
                id="email"
                name="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                error={emailError}
                helperText={emailError ? emailErrorMessage : ''}
                variant="filled"
                sx={{ '& .MuiFilledInput-root': { backgroundColor: '#2e2e31', color: '#fff' }, '& .MuiInputBase-input': { color: '#fff' } }}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password" sx={{ mb: 1, color: '#ddd' }}>Password</FormLabel>
              <TextField
                id="password"
                name="password"
                placeholder="•••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                error={passwordError}
                helperText={passwordError ? passwordErrorMessage : ''}
                variant="filled"
                sx={{ '& .MuiFilledInput-root': { backgroundColor: '#2e2e31', color: '#fff' }, '& .MuiInputBase-input': { color: '#fff' } }}
              />
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1, color: '#ddd' }}>Baby</FormLabel>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <FormControlLabel
                    control={<Checkbox checked={gender === 'boy'} onChange={() => setGender('boy')} icon={<CheckboxIconUnchecked />} checkedIcon={<CheckboxIconChecked />} disableRipple />}
                    label={<span style={{ color: '#eee' }}>It's a boy</span>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={gender === 'girl'} onChange={() => setGender('girl')} icon={<CheckboxIconUnchecked />} checkedIcon={<CheckboxIconChecked />} disableRipple />}
                    label={<span style={{ color: '#eee' }}>It's a girl</span>}
                  />
                </Box>
              </FormControl>
            </Box>

            <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ textTransform: 'none', bgcolor: '#57575b', color: '#fff', '&:hover': { bgcolor: '#4a4a4d' } }}>
              {loading ? (mode === 'signUp' ? 'Signing up...' : 'Logging in...') : (mode === 'signUp' ? 'Sign up' : 'Login')}
            </Button>
          </Box>

          <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

          {/* Κρυφό container για το επίσημο κουμπί (offscreen, όχι ορατό) */}
          <div
            ref={googleBtnRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-9999px',
              top: '-9999px',
              width: 0,
              height: 0,
              overflow: 'hidden',
              opacity: 0,
            }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleGoogleLogin}
              startIcon={<GoogleIcon />}
              disabled={googleBusy}
              sx={{
                textTransform: 'none',
                bgcolor: '#3a3a3c',
                color: '#fff',
                '&:hover': { bgcolor: '#323233' },
                '& svg path': { fill: '#fff !important' },
              }}
            >
              {googleBusy ? 'Opening Google...' : 'Login from Google'}
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={handleFacebookLogin}
              startIcon={<FacebookIcon />}
              sx={{
                textTransform: 'none',
                bgcolor: '#3a3a3c',
                color: '#fff',
                '&:hover': { bgcolor: '#323233' },
                '& svg path': { fill: '#fff !important' },
              }}
            >
              Login from Facebook
            </Button>

            <Typography sx={{ textAlign: 'center', color: '#ddd', mt: 1 }}>
              {mode === 'signUp' ? (
                <>
                  Already have an account?{' '}
                  <Button variant="text" onClick={() => setMode('signIn')} sx={{ textTransform: 'none', color: '#fff' }}>
                    Sign in
                  </Button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <Button variant="text" onClick={() => setMode('signUp')} sx={{ textTransform: 'none', color: '#fff' }}>
                    Create account
                  </Button>
                </>
              )}
            </Typography>
          </Box>
        </StyledCard>
      </PageStack>
    </div>
  );
}