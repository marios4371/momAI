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
      {/* checkbox */}
      <svg
        width="12"
        height="9"
        viewBox="0 0 12 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 4.1L4.2 7.5L11 1"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
    // email validation (works for signIn and signUp)
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

  const handleSubmit = async (e) => {
  e.preventDefault();
  setServerError('');
  if (!validateSignUp()) return;

  setLoading(true);
  try {
    if (mode === 'signUp') {
      // send name as username to match your User.java (username column)
      const payload = { username: name.trim(), email: email.trim(), password };
      const user = await apiRegister(payload); // περιμένουμε το created UserDTO

      // αποθήκευση user id στο localStorage ώστε να το διαβάσει ConversationsProvider
      try {
        const uid = String(user?.id ?? user?.userId ?? user?._id ?? '');
        if (uid) {
          localStorage.setItem('momai_user_id', uid);
        } else {
          console.warn('Register returned no id:', user);
        }
      } catch (e) {
        console.warn('Failed to write momai_user_id to localStorage', e);
      }

      // on success, set theme & notify parent and navigate
      if (typeof setTheme === 'function') setTheme(gender);
      if (typeof onAuth === 'function') onAuth();
      navigate('/', { replace: true });
    } else {
      // signIn
      const payload = { email: email.trim(), password };
      const user = await apiLogin(payload);

      try {
        const uid = String(user?.id ?? user?.userId ?? user?._id ?? '');
        if (uid) {
          localStorage.setItem('momai_user_id', uid);
        } else {
          console.warn('Login returned no id:', user);
        }
      } catch (e) {
        console.warn('Failed to write momai_user_id to localStorage', e);
      }

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


  const logoSrc = publicLogoPath;

  return (
    <div className="auth-page-root">
      <CssBaseline />
      <PageStack direction="column" justifyContent="center">
        <StyledCard variant="outlined" elevation={0}>
          {mode === 'signUp' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
                  color: '#fff',
                  lineHeight: 1,
                  fontWeight: 600,
                }}
              >
                Welcome to parentAI
              </Typography>
              <Box
                component="img"
                src={logoSrc}
                alt="logo"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  objectFit: 'cover',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                }}
              />
            </Box>
          ) : (
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
                color: '#fff',
                ml: 4,
                fontWeight: 600,
              }}
            />
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: '#323236',
              p: 3,
              borderRadius: 2,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
            }}
          >
            {/* server error */}
            {serverError && (
              <Typography sx={{ color: '#ffb4b4', fontSize: 14 }}>{serverError}</Typography>
            )}

            {/* Full name -> will be sent as `username` */}
            {mode === 'signUp' && (
              <FormControl>
                <FormLabel htmlFor="name" sx={{ mb: 1, color: '#ddd' }}>
                  Full name
                </FormLabel>
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
                  sx={{
                    '& .MuiFilledInput-root': {
                      backgroundColor: '#2e2e31',
                      color: '#fff',
                    },
                    '& .MuiFormHelperText-root': { color: '#f3dcdc' },
                    '& .MuiInputBase-input': { color: '#fff' },
                  }}
                />
              </FormControl>
            )}

            {/* Email */}
            <FormControl>
              <FormLabel htmlFor="email" sx={{ mb: 1, color: '#ddd' }}>
                Email
              </FormLabel>
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
                sx={{
                  '& .MuiFilledInput-root': {
                    backgroundColor: '#2e2e31',
                    color: '#fff',
                  },
                  '& .MuiInputBase-input': { color: '#fff' },
                }}
              />
            </FormControl>

            {/* Password */}
            <FormControl>
              <FormLabel htmlFor="password" sx={{ mb: 1, color: '#ddd' }}>
                Password
              </FormLabel>
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
                sx={{
                  '& .MuiFilledInput-root': {
                    backgroundColor: '#2e2e31',
                    color: '#fff',
                  },
                  '& .MuiInputBase-input': { color: '#fff' },
                }}
              />
            </FormControl>

            {/* Baby - theme choice */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1, color: '#ddd' }}>
                  Baby
                </FormLabel>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={gender === 'boy'}
                        onChange={() => setGender('boy')}
                        icon={<CheckboxIconUnchecked />}
                        checkedIcon={<CheckboxIconChecked />}
                        disableRipple
                      />
                    }
                    label={<span style={{ color: '#eee' }}>It's a boy</span>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={gender === 'girl'}
                        onChange={() => setGender('girl')}
                        icon={<CheckboxIconUnchecked />}
                        checkedIcon={<CheckboxIconChecked />}
                        disableRipple
                      />
                    }
                    label={<span style={{ color: '#eee' }}>It's a girl</span>}
                  />
                </Box>
              </FormControl>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                textTransform: 'none',
                bgcolor: '#57575b',
                color: '#fff',
                '&:hover': { bgcolor: '#4a4a4d' },
              }}
            >
              {loading ? (mode === 'signUp' ? 'Signing up...' : 'Logging in...') : (mode === 'signUp' ? 'Sign up' : 'Login')}
            </Button>
          </Box>

          <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => alert('Sign in with Google')}
              startIcon={<GoogleIcon />}
              sx={{
                textTransform: 'none',
                bgcolor: '#3a3a3c',
                color: '#fff',
                '&:hover': { bgcolor: '#323233' },
                '& svg path': { fill: '#fff !important' },
              }}
            >
              Login from Google
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={() => alert('Sign in with Facebook')}
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
                  <Button
                    variant="text"
                    onClick={() => setMode('signIn')}
                    sx={{ textTransform: 'none', color: '#fff' }}
                  >
                    Sign in
                  </Button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <Button
                    variant="text"
                    onClick={() => setMode('signUp')}
                    sx={{ textTransform: 'none', color: '#fff' }}
                  >
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
