# House Price Predictor - Next.js Frontend

A modern Next.js 16 web application for predicting California house prices using machine learning.

## Features

- Built with Next.js 16 (App Router)
- TypeScript for type safety
- Real-time API health monitoring
- Responsive design
- Client-side form validation
- Modern gradient UI

## Prerequisites

- Node.js 18+ or 20+
- npm or yarn or pnpm

## Installation

```bash
# Install dependencies
npm install

# or
yarn install

# or
pnpm install
```

## Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page (prediction form)
│   └── globals.css      # Global styles
├── public/              # Static assets
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── next.config.ts       # Next.js config
└── README.md
```

## API Integration

The frontend connects to the Flask backend API at `http://localhost:5000` by default.

Make sure the backend is running:
```bash
cd ../backend
python app.py
```

## Technologies

- Next.js 16
- React 19
- TypeScript 5
- CSS3 (with CSS Modules support)

## Development

The app uses Next.js App Router with:
- Server Components by default
- Client Components for interactivity (`'use client'`)
- TypeScript for type safety
- Modern React 19 features

## Building for Production

```bash
npm run build
npm start
```

The production build is optimized and ready for deployment to Vercel, Netlify, or any Node.js hosting platform.
