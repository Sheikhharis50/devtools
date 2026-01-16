# DevTools - World Time & Currency Comparison

A modern React application for comparing world times and currency exchange rates across multiple countries. Built with React, TypeScript, and Vite.

## Features

### 🌍 World Time Dashboard

- View current time for multiple countries simultaneously
- Add/remove countries with a simple interface
- Real-time clock updates
- Responsive card-based layout
- Persistent storage using localStorage

### ⏰ Time Comparison

- 24-hour comparison table showing time differences across timezones
- Visual highlighting of current time for each country
- Interactive hover effects to see corresponding times
- UTC offset display for each timezone
- Real-time updates every second

### 💱 Currency Comparison

- Exchange rate comparison table for multiple currencies
- Automatic rate fetching from currency API
- Caching mechanism for improved performance
- Add countries to compare their currencies
- Formatted currency display with symbols

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Moment.js** - Time manipulation
- **Lucide React** - Icons
- **Lodash** - Utility functions

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd devtools
```

1. Install dependencies:

```bash
npm install
```

1. Start the development server:

```bash
npm run dev
```

1. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```text
src/
├── components/          # Reusable components
│   ├── CurrencyComparison.tsx
│   ├── TimeComparison.tsx
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   └── WorldTime/      # World Time components
├── pages/              # Page components
│   ├── dashboard/
│   ├── time-comparison/
│   └── currency-comparison/
├── router/             # Routing configuration
├── config/             # Configuration files
│   ├── countries.ts
│   ├── currency.ts
│   └── storage.ts
├── hooks/              # Custom React hooks
│   └── useLocalStorage.ts
└── utils/              # Utility functions
    ├── functions.ts
    └── time.ts
```

## Features in Detail

### World Time Dashboard

The main dashboard displays country cards showing:

- Country name and flag emoji
- Current time with seconds
- Date and day of the week
- UTC offset

### Time Comparison

A comprehensive 24-hour table that:

- Maps each hour to corresponding times in different timezones
- Highlights the current hour for each country
- Shows AM/PM format with 24-hour notation
- Updates in real-time

### Currency Comparison

A matrix table displaying:

- Exchange rates between all selected currencies
- Base currency selection (first country's currency)
- Cached API responses for better performance
- Formatted values with currency symbols

## Data Persistence

The application uses localStorage to persist:

- Selected countries across sessions
- Currency exchange rate cache with expiration

## API Integration

Currency exchange rates are fetched from:

- `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{base}.json`

Rates are cached locally with expiration to reduce API calls.

## Browser Support

Modern browsers that support:

- ES6+ features
- localStorage API
- CSS Grid and Flexbox

## License

This project is private and proprietary.
