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
  const [mode, setMode] = useState('signIn');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('boy');
  const [name, setName] = useState('');

  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState('');

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
    if (!username || !/\S+@\S+\.\S+/.test(username)) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateSignUp()) return;
    if (typeof setTheme === 'function') setTheme(gender);
    if (typeof onAuth === 'function') onAuth();
    setTimeout(() => navigate('/', { replace: true }), 40);
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
                Welcome to momAI
              </Typography>
              <br />
              <br />
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
            ></Typography>
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

            <FormControl>
              <FormLabel htmlFor="email" sx={{ mb: 1, color: '#ddd' }}>
                Email
              </FormLabel>
              <TextField
                id="email"
                name="email"
                placeholder="your@email.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              sx={{
                textTransform: 'none',
                bgcolor: '#57575b',
                color: '#fff',
                '&:hover': { bgcolor: '#4a4a4d' },
              }}
            >
              {mode === 'signUp' ? 'Sign up' : 'Login'}
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
