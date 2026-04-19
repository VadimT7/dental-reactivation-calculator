# Dental Patient Reactivation Calculator

A high-conversion, minimalist landing page calculator that helps dental practices estimate recoverable revenue from lapsed patients.

## Quick Start

This is a static site — just open `index.html` in a browser, or serve with any static server:

```bash
npx serve .
```

## Deploy to Vercel

```bash
npx vercel --prod
```

Or connect the repo to Vercel and it will auto-deploy on push.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure and semantic markup |
| `styles.css` | All styles with CSS custom properties for theming |
| `app.js` | Calculator logic, validation, and formatting |

## Theming

All design tokens are CSS custom properties in `:root` at the top of `styles.css`. Override any variable to re-theme:

```css
:root {
  --color-accent: #10b981;       /* Change accent to green */
  --color-accent-dark: #059669;
}
```

## Calculator Assumptions

- **Recovery rate**: 14% of lapsed patients are recoverable via reactivation campaigns
- **Formula**: `lapsed_patients × 14% × avg_treatment_value = recoverable_revenue`

## Performance

- Zero external JS dependencies
- Single font load (Inter)
- < 15KB total uncompressed (HTML + CSS + JS)
