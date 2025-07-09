# Course Website

A modern online course platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Supabase for backend and authentication
- ESLint and Prettier for code quality
- Fully responsive design

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd coursewebsite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase credentials

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
coursewebsite/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions and configurations
├── public/          # Static assets
└── styles/          # Global styles
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
