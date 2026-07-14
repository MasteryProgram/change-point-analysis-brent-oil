import { defaultTheme } from 'react-admin';

/**
 * Chart + UI palette. Categorical slots validated for CVD safety and
 * contrast (dataviz validator: all checks pass on the light surface).
 */
export const chart = {
  series1: '#2a78d6', // price line (blue)
  up: '#2a78d6',      // events where price shifted up — blue
  down: '#e34948',    // events where price shifted down — red
  highlight: '#4a3aa7', // selected/highlighted event (violet)
  grid: '#e1e0d9',    // hairline gridlines
  axis: '#898781',    // muted axis text
  surface: '#fcfcfb',
  textPrimary: '#0b0b0b',
  textSecondary: '#52514e',
  areaOpacity: 0.1,
};

export const theme = {
  ...defaultTheme,
  palette: {
    mode: 'light',
    primary: { main: '#2a78d6' },
    secondary: { main: '#4a3aa7' },
    background: { default: '#f9f9f7', paper: '#fcfcfb' },
    text: { primary: '#0b0b0b', secondary: '#52514e' },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  },
};
