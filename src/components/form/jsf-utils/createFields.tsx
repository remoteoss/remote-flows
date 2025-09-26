import { cn } from '@/src/lib/utils';

type JSFPresentationConfig = {
  inputType?: string;
  Component?: React.ComponentType<any>;
  hidden?: boolean;
  [key: string]: unknown;
};

type JSFFieldConfig = {
  'x-jsf-presentation'?: JSFPresentationConfig;
  [key: string]: unknown;
};

/**
 * Creates an information field with standard styling
 */
export function createInformationField(
  title: React.ReactNode,
  description: React.ReactNode,
  options?: {
    className?: string;
  },
): JSFFieldConfig {
  return {
    presentation: {
      inputType: 'hidden',
      Component: () => (
        <div
          className={cn(
            'RemoteFlows__InformationStatement',
            options?.className,
          )}
        >
          <h3 className={cn('RemoteFlows__InformationStatement__Title')}>
            {title}
          </h3>
          <p className={cn('RemoteFlows__InformationStatement__Description')}>
            {description}
          </p>
        </div>
      ),
    },
  };
}
