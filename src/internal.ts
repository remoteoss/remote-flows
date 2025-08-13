/**
 * @fileoverview Internal utilities and components for Remote Flows
 * @internal
 *
 * ⚠️ WARNING: These APIs are internal and may change without notice.
 * They are not covered by semantic versioning guarantees.
 * Use at your own risk.
 */

// Re-export all public APIs for convenience
export * from './index';

// Internal utilities
export { useRouter } from './lib/router';
export { useSearchParams } from './lib/useSearchParams';
export { cn } from './lib/utils';

// UI Components for internal use
export { Button, buttonVariants } from './components/ui/button';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/ui/card';

export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './components/ui/collapsible';

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './components/ui/dialog';

export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';

export { Alert, AlertDescription, AlertTitle } from './components/ui/alert';

export { Badge, badgeVariants } from './components/ui/badge';

// Add any other UI components you want to share
export { Input } from './components/ui/input';
export { Label } from './components/ui/label';
export { Checkbox } from './components/ui/checkbox';
export { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
