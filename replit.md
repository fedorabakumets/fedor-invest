# Сравнение сайтов для заработка (Earning Sites Comparison)

## Overview
**ВАЖНО: Это СТАТИЧЕСКИЙ сайт.** Все изменения должны сохранять статическую архитектуру без добавления серверной логики.

This is a **static website** that provides a comprehensive comparison of Russian-language earning/click sites with enhanced CSS styling and animations.

**Last Updated:** November 29, 2025

## Project Type
- **Type:** STATIC HTML/CSS/JavaScript Website (no backend/server-side logic)
- **Language:** Russian (ru)
- **Framework:** Vanilla JavaScript (no build tools, no bundlers)
- **Design:** Enhanced CSS with animations and gradient effects
- **Deployment:** Replit Static Hosting

## Project Structure
```
.
├── index.html      # Main HTML file (in site2/)
├── server.py       # Python HTTP server (port 5000)
└── site2/
    └── index.html  # Styled version with inline CSS and animations
```

## Features
1. **Visual Design**
   - Animated gradient backgrounds
   - Glowing effects on headers and tables
   - Smooth transitions and hover effects
   - Responsive layout with blur effects

2. **Table Display**
   - Static data table with 5 key columns
   - Beautiful styling with blue and cyan gradients
   - Animated borders and shadows
   - Sortable headers (visual only)

3. **Data Displayed**
   - Site name with links
   - Minimum withdrawal amount
   - Referral system availability
   - Payment systems
   - Work types

## Technical Details

### Server Configuration
- **Dev Server:** Python SimpleHTTPServer on port 5000
- **Host:** 0.0.0.0 (accepts all connections)
- **Cache Control:** Disabled (no-cache headers) to prevent stale content in Replit iframe
- **Directory:** Serves files from ./site2/

## Development

### Running Locally
The workflow is already configured. The server runs at http://0.0.0.0:5000/

### Deployment
This is a static site suitable for deployment to:
- Replit Static Hosting
- Any static hosting service (Netlify, Vercel, GitHub Pages, etc.)

## Known Issues
None at this time.

## Architecture Decisions

### Date: November 29, 2025
- **Decision:** Use Python SimpleHTTPServer for serving static files
- **Reason:** Zero dependencies, simpler setup for pure static site, built-in to Python
- **Cache Control:** Added no-cache headers to prevent Replit iframe caching issues

### Date: November 29, 2025  
- **Decision:** Single static version with enhanced CSS and animations
- **Reason:** Focused design approach with visual appeal and performance optimization
