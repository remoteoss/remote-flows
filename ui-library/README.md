# @remoteoss/remote-flows-ui

**⚠️ Prototype Status**: This is a standalone UI library prototype for Remote Flows, created for experimentation and development.

## Overview

This package contains UI components written from scratch, designed to work alongside the existing `@remoteoss/remote-flows` core library. It's being developed as a prototype to explore separating UI components from business logic.

## Installation (Development)

Currently linked via `npm link` for local development:

```bash
# In ui-library directory
npm install
npm run build
npm link

# In example directory
npm link @remoteoss/remote-flows-ui
```

## Usage

```tsx
import { Button } from '@remoteoss/remote-flows-ui';
import '@remoteoss/remote-flows-ui/styles.css';

function App() {
  return (
    <div>
      <Button variant="primary" size="md">
        Click me
      </Button>
    </div>
  );
}
```

## Available Components

### Button

A versatile button component with multiple variants and sizes.

**Props:**
- `variant`: `'primary' | 'secondary' | 'outline'` (default: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- All standard HTML button attributes

**Example:**
```tsx
<Button variant="primary" size="lg" onClick={() => console.log('clicked')}>
  Primary Button
</Button>

<Button variant="outline" size="sm" disabled>
  Disabled Outline
</Button>
```

## Development

### Build Commands

```bash
# Build everything (CSS + JS)
npm run build

# Build only CSS
npm run build:css

# Build only JS
npm run build:js

# Watch mode for JS (requires separate CSS build)
npm run dev

# Watch mode for CSS
npm run dev:css

# Type checking
npm run type-check
```

### Project Structure

```
ui-library/
├── src/
│   ├── components/
│   │   ├── ui/              # UI components (Button, Input, etc.)
│   │   └── form/            # Form field components
│   ├── lib/
│   │   └── utils.ts         # Utility functions (cn helper)
│   ├── styles/
│   │   ├── index.scss       # Main Sass entry point
│   │   ├── _variables.scss  # CSS variables/design tokens
│   │   ├── _typography.scss # Typography styles
│   │   ├── _base.scss       # Reset and base styles
│   │   └── _components.scss # Component style imports
│   └── index.tsx            # Main exports
├── dist/                    # Build output
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

### Adding New Components

1. Create component file in `src/components/ui/` (e.g., `Input.tsx`)
2. Create corresponding SCSS file next to it (e.g., `Input.scss`)
3. Add `@use '../components/ui/Input';` to `src/styles/_components.scss`
4. Export from `src/index.tsx`
5. Run `npm run build`

## Design System

The UI library uses CSS variables for theming, defined in `src/styles/_variables.scss`:

- **Colors**: Primary, secondary, success, danger, warning, neutrals
- **Typography**: Font families, sizes, and weights
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl)
- **Border Radius**: sm, md, lg
- **Shadows**: sm, md, lg

All components use these tokens via CSS variables (e.g., `var(--color-primary)`).

## Utilities

### `cn(...classes)`

A utility function for merging class names using `clsx`:

```tsx
import { cn } from '@remoteoss/remote-flows-ui';

<div className={cn('base-class', isActive && 'active-class', className)} />
```

## Future Plans

This prototype allows us to explore options:

1. **Merge into monorepo** - Convert main repo to workspaces
2. **Publish separately** - Keep as independent package
3. **Keep as prototype** - Use internally for testing
4. **Abandon if needed** - No risk since core library unchanged

## Notes

- No changes to existing `@remoteoss/remote-flows` core library
- Built from scratch, not migrating existing UI
- Uses co-located SCSS files compiled to single CSS output
- TypeScript strict mode enabled
- ESM-only output format
