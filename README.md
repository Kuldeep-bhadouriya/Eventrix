# Eventrix - Next.js 16 App Router Project

A modern, production-ready Next.js 16 application with TypeScript, Tailwind CSS, and best practices.

## 🚀 Features

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **ESLint & Prettier** for code quality
- **Zod** for environment variable validation
- **Server Components** by default for optimal performance
- **Font Optimization** with next/font

## 📦 Project Structure

```
eventrix-app/
├── app/                    # App Router pages and layouts
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utility functions and configs
│   └── env.ts            # Environment variable validation
├── prisma/               # Database schema (if using Prisma)
├── public/               # Static assets
├── types/                # TypeScript type definitions
├── .env.local           # Local environment variables
├── .env.example         # Environment variables template
├── .prettierrc          # Prettier configuration
├── .prettierignore      # Prettier ignore patterns
├── eslint.config.mjs    # ESLint configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your actual values.

3. **Run development server:**
   ```bash
   bun dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## 📝 Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint
- `bun lint:fix` - Fix ESLint errors
- `bun format` - Format code with Prettier
- `bun format:check` - Check code formatting

## ⚙️ Configuration

### Tailwind CSS

Configured with:
- Custom color variables for theming
- Font family integration
- Content paths optimized for App Router

### ESLint

Configured with:
- Next.js recommended rules
- TypeScript support
- Prettier integration
- Custom rules for code quality

### Prettier

Configured with:
- Tailwind CSS class sorting
- Consistent code formatting
- 80-character line width

### Environment Variables

Validated using Zod schema in `lib/env.ts`:
- Type-safe access to environment variables
- Runtime validation
- Clear error messages for missing/invalid variables

## 🏗️ Best Practices

### Server Components (Default)

All components are server components by default for optimal performance:
```tsx
// This is a server component (default)
export default function Page() {
  return <div>Hello World</div>
}
```

Use `"use client"` directive only when needed:
```tsx
"use client"

export default function ClientComponent() {
  const [state, setState] = useState(false)
  return <button onClick={() => setState(!state)}>Toggle</button>
}
```

### Environment Variables

Access validated environment variables:
```tsx
import { env } from "@/lib/env"

// Type-safe and validated
const appName = env.NEXT_PUBLIC_APP_NAME
```

### Metadata

SEO-optimized metadata in `app/layout.tsx`:
```tsx
export const metadata: Metadata = {
  title: {
    default: "App Name",
    template: "%s | App Name",
  },
  description: "Description",
  // ... OpenGraph, Twitter, etc.
}
```

### Font Optimization

Fonts are optimized using next/font:
```tsx
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})
```

## 🎨 Styling

### Tailwind CSS

Use Tailwind utility classes:
```tsx
<div className="flex items-center justify-center min-h-screen">
  <h1 className="text-4xl font-bold">Hello World</h1>
</div>
```

### CSS Variables

Custom properties defined in `globals.css`:
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}
```

## 🔒 Type Safety

### TypeScript Configuration

Strict mode enabled for maximum type safety:
- `strict: true`
- `forceConsistentCasingInFileNames: true`
- ES2022 target for modern features

### Path Aliases

Use `@/` for absolute imports:
```tsx
import { env } from "@/lib/env"
import Button from "@/components/Button"
```

## 🚀 Performance

- **Server Components** - Reduced JavaScript bundle size
- **Font Optimization** - next/font with display swap
- **Static Generation** - Pages pre-rendered at build time
- **Turbopack** - Fast development builds (Next.js 16)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 📄 License

MIT
>>>>>>> 8067900 (feat: add LiquidButton and MetalButton components with advanced styling and animations)
