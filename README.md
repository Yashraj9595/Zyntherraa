# Zyntherraa React TypeScript PWA

A modern React application built with TypeScript, Tailwind CSS, and PWA support.

## Features

- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS for styling
- 📱 Progressive Web App (PWA) support
- 🔧 Service Worker for offline functionality
- 📦 Install prompt for native app experience

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## PWA Features

- Offline functionality with service worker
- Install prompt for mobile and desktop
- App manifest for native app experience
- Responsive design with Tailwind CSS

## Project Structure

```
src/
├── components/
│   └── InstallPWA.tsx    # PWA install prompt
├── App.tsx               # Main app component
├── index.tsx            # Entry point with SW registration
└── index.css            # Tailwind CSS imports
```