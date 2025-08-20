// src/components/CustomIcons.jsx
import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

export function SitemarkIcon(props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zm0 7l-10 5 10 5 10-5-10-5z" />
    </svg>
  );
}

export function GoogleIcon(props) {
  return (
    <svg width="24" height="24" viewBox="0 0 48 48" {...props}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.94 0 6.64 1.71 8.16 3.14l5.94-5.94C34.43 3.38 29.7 1 24 1 14.61 1 6.7 6.58 3.28 14.44l6.91 5.36C11.72 14.1 17.34 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.62-.15-3.18-.43-4.68H24v9.08h12.7c-.55 2.94-2.2 5.44-4.7 7.12l7.28 5.65C43.83 37.88 46.5 31.68 46.5 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.19 28.19c-.48-1.44-.75-2.97-.75-4.69s.27-3.25.75-4.69l-6.91-5.36C1.58 16.11 0 19.88 0 23.5s1.58 7.39 3.28 10.05l6.91-5.36z"
      />
      <path
        fill="#34A853"
        d="M24 47c6.48 0 11.91-2.14 15.88-5.82l-7.28-5.65c-2.02 1.36-4.62 2.17-8.6 2.17-6.66 0-12.28-4.6-14.26-10.88l-6.91 5.36C6.7 41.42 14.61 47 24 47z"
      />
    </svg>
  );
}
export function FacebookIcon(props) {
  return (
    <svg width="24" height="24" viewBox="0 0 48 48" {...props}>
      <path
        fill="#1877F2"
        d="M24 1C11.85 1 2 10.85 2 23c0 10.98 8.06 20.07 18.56 21.78v-15.4h-5.58V23h5.58v-4.93c0-5.51 3.29-8.57 8.31-8.57 2.41 0 4.93.43 4.93.43v5.41h-2.78c-2.74 0-3.58 1.7-3.58 3.45V23h6.1l-.97 6.38h-5.13v15.4C37.94 43.07 46 33.98 46 23c0-12.15-9.85-22-22-22z"
      />
    </svg>
  );
}
