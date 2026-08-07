# Kasirapps

A Capacitor mobile application built with React and Vite.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- For iOS: Xcode (macOS only)
- For Android: Android Studio

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the web app:**
   ```bash
   npm run build
   ```

3. **Add platforms:**
   ```bash
   npx cap add ios
   npx cap add android
   ```

### Development

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Sync changes to native platforms:**
   ```bash
   npm run sync
   ```

### Building for Production

```bash
npm run build
npm run sync
```

### Opening in IDEs

**iOS (Xcode):**
```bash
npm run open:ios
```

**Android (Android Studio):**
```bash
npm run open:android
```

## Project Structure

```
kasirapps/
├── src/
│   ├── main.tsx          # React entry point
│   ├── App.tsx           # Main App component
│   ├── index.html        # HTML template
│   ├── index.css         # Global styles
│   └── App.css           # App component styles
├── capacitor.config.ts   # Capacitor configuration
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run sync` - Sync web app to native platforms
- `npm run open:ios` - Open iOS project in Xcode
- `npm run open:android` - Open Android project in Android Studio

## Documentation

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
