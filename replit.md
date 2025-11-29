# Сравнение сайтов для заработка (Earning Sites Comparison)

## Overview
**ВАЖНО: Это СТАТИЧЕСКИЙ сайт.** Все изменения должны сохранять статическую архитектуру без добавления серверной логики.

This is a **static website** that provides a comprehensive comparison of Russian-language earning/click sites. It displays information about minimum withdrawal amounts, referral systems, payment methods, work types, and review sites.

**Last Updated:** November 29, 2025

## Project Type
- **Type:** STATIC HTML/CSS/JavaScript Website (no backend/server-side logic)
- **Language:** Russian (ru)
- **Framework:** Vanilla JavaScript (no build tools, no bundlers)
- **Data Source:** Google Apps Script API (external)
- **Deployment:** Replit Static Hosting

## Websites

### Site 1: Main Version (Port 5000)
- Full-featured comparison table with sorting, filtering, pagination
- Fetches data from Google Apps Script API
- Supports theme switching, font size adjustment, performance levels
- Responsive card/table views

### Site 2: Styled Version (Port 3000)
- Enhanced CSS with animations and gradient effects
- Static data table with example entries
- Focus on visual design and animations

## Project Structure
```
.
├── Site 1 (Main):
│   ├── index.html          # Main HTML file
│   ├── server.py          # Python HTTP server (port 5000)
│   ├── data.js            # Data parsing and utilities
│   ├── logic.js           # Business logic (sorting, filtering, pagination)
│   ├── ui.js              # UI rendering functions
│   ├── settings.js        # Settings panel functionality
│   ├── base.css           # Base styles
│   ├── header.css         # Header styles
│   ├── filters.css        # Filter section styles
│   ├── table.css          # Table/cards view styles
│   ├── pagination.css     # Pagination styles
│   ├── themes.css         # Theme (light/dark) styles
│   └── animations.css     # Animation styles
│
└── Site 2 (Styled):
    ├── site2/
    │   └── index.html      # Styled version with inline CSS
    └── server2.py         # Python HTTP server (port 3000)
```

## Features
1. **Data Display**
   - Sortable table with 8 columns
   - Card view option with adjustable columns (1-5)
   - Pagination (10/50/100 rows per page)

2. **Filtering**
   - Filter by payment systems
   - Filter by work types
   - Collapsible filter sections

3. **Customization**
   - Light/Dark theme toggle
   - Adjustable font size
   - Performance levels (0-4) for animation control
   - Settings panel for advanced customization

4. **Data Management**
   - Fetches data from Google Apps Script API
   - Fallback to mock data on API failure
   - Tracks and displays recent changes

## Technical Details

### API Endpoint
- URL: `https://script.google.com/macros/s/AKfycbxNttG89h44eLI84rD7xgH3kgToreZDS_g1gXItL89cVNQgquxZ90fhapdbG-U0USjC/exec?action=getAllData`
- Returns JSON with sites data and change history

### Local Storage
The application stores user preferences in localStorage:
- Theme preference (light/dark)
- View mode (table/cards)
- Font size
- Performance level
- Custom settings

### Server Configuration
- **Dev Server:** Python SimpleHTTPServer on port 5000
- **Host:** 0.0.0.0 (accepts all connections)
- **Cache Control:** Disabled (no-cache headers) to prevent stale content in Replit iframe

## Development

### Running Locally
Both workflows are already configured and running in parallel:
- **Site 1:** http://0.0.0.0:5000/ (Web Server workflow)
- **Site 2:** http://0.0.0.0:3000/ (Site2 Web Server workflow)

### Deployment
Both are static sites suitable for deployment to:
- Replit Static Hosting
- Any static hosting service (Netlify, Vercel, GitHub Pages, etc.)

## Known Issues
None at this time.

## Architecture Decisions

### Date: November 29, 2025
- **Decision:** Use Python SimpleHTTPServer instead of Node.js/npm
- **Reason:** Zero dependencies, simpler setup for pure static sites, built-in to Python
- **Cache Control:** Added no-cache headers to prevent Replit iframe caching issues

### Date: November 29, 2025  
- **Decision:** Keep all original file structure intact
- **Reason:** Project works as-is, no build process needed, respecting existing architecture

### Date: November 29, 2025
- **Decision:** Run two versions of the website in parallel on different ports
- **Reason:** Site 1 (main version) on port 5000, Site 2 (styled version) on port 3000
- **Purpose:** Allow simultaneous testing and comparison of different implementations
