# Quick Start Guide

## For Developers Working on the UI Library

### 1. Make Changes
```bash
cd ui-library
# Edit files in src/components/ui/ or src/styles/
```

### 2. Build
```bash
npm run build
```

Or use watch mode:
```bash
# Terminal 1: Watch JS
npm run dev

# Terminal 2: Watch CSS (if needed)
npm run dev:css
```

### 3. Test in Example App
Changes are automatically available in the example app via npm link.

```bash
cd ../example
npm run dev
```

Then import and test your components:
```tsx
import { Button } from '@remoteoss/remote-flows-ui';
import '@remoteoss/remote-flows-ui/styles.css';
```

## Adding a New Component

### Step-by-step Example: Creating an Input Component

1. **Create the TypeScript component:**
   ```tsx
   // src/components/ui/Input.tsx
   import { InputHTMLAttributes, forwardRef } from 'react';
   import { cn } from '../../lib/utils';

   export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
     error?: boolean;
   }

   export const Input = forwardRef<HTMLInputElement, InputProps>(
     ({ className, error, ...props }, ref) => {
       return (
         <input
           ref={ref}
           className={cn(
             'rf-input',
             error && 'rf-input--error',
             className
           )}
           {...props}
         />
       );
     }
   );

   Input.displayName = 'Input';
   ```

2. **Create the SCSS styles:**
   ```scss
   // src/components/ui/Input.scss
   .rf-input {
     display: block;
     width: 100%;
     padding: var(--spacing-sm) var(--spacing-md);
     font-size: var(--font-size-base);
     border: 1px solid var(--color-gray-100);
     border-radius: var(--radius-md);
     transition: border-color 0.2s;

     &:focus {
       outline: none;
       border-color: var(--color-primary);
     }

     &--error {
       border-color: var(--color-danger);
     }

     &:disabled {
       opacity: 0.5;
       cursor: not-allowed;
     }
   }
   ```

3. **Import styles in the main components file:**
   ```scss
   // src/styles/_components.scss
   @use '../components/ui/Button';
   @use '../components/ui/Input';  // Add this line
   ```

4. **Export from the main index:**
   ```tsx
   // src/index.tsx
   export { Input } from './components/ui/Input';
   export type { InputProps } from './components/ui/Input';
   ```

5. **Build:**
   ```bash
   npm run build
   ```

6. **Use it:**
   ```tsx
   import { Input } from '@remoteoss/remote-flows-ui';

   <Input placeholder="Enter name" error={false} />
   ```

## Common Tasks

### Update Design Tokens
Edit `src/styles/_variables.scss` and rebuild.

### Fix TypeScript Errors
```bash
npm run type-check
```

### Test a Component
Create a test in the example app:
```tsx
// example/src/MyTest.tsx
import { Button, Input } from '@remoteoss/remote-flows-ui';
import '@remoteoss/remote-flows-ui/styles.css';

export function MyTest() {
  return (
    <div>
      <Button>Test</Button>
      <Input placeholder="Test input" />
    </div>
  );
}
```

## File Naming Conventions

- Component files: PascalCase (e.g., `Button.tsx`, `TextField.tsx`)
- Style files: Match component name (e.g., `Button.scss`, `TextField.scss`)
- Utility files: camelCase (e.g., `utils.ts`, `helpers.ts`)
- SCSS partials: Start with underscore (e.g., `_variables.scss`, `_base.scss`)

## CSS Class Naming

Use BEM-style naming with `rf-` prefix:

```scss
.rf-button { }                    // Block
.rf-button--primary { }           // Modifier
.rf-button__icon { }              // Element
.rf-button__icon--large { }       // Element modifier
```

Example:
```tsx
<button className="rf-button rf-button--primary">
  <span className="rf-button__icon rf-button__icon--large">+</span>
  Add Item
</button>
```

## Tips

1. **Always use CSS variables** from `_variables.scss` instead of hardcoding values
2. **Keep components simple** - Start with basic functionality
3. **Use TypeScript** - Leverage proper typing for better DX
4. **Test in example app** - Verify changes work as expected
5. **Watch mode** - Use `npm run dev` for faster iteration
6. **Co-locate styles** - Keep .scss next to .tsx for maintainability

## Troubleshooting

**Problem: Changes not showing up**
```bash
# Rebuild
cd ui-library
npm run build
```

**Problem: TypeScript errors**
```bash
# Check types
npm run type-check
```

**Problem: CSS not loading**
```tsx
// Make sure to import CSS in your component
import '@remoteoss/remote-flows-ui/styles.css';
```

**Problem: Module not found**
```bash
# Re-link
cd ui-library
npm link

cd ../example
npm link @remoteoss/remote-flows-ui
```
