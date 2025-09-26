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
  title: string,
  description: string,
  options?: {
    className?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    Component?: React.ComponentType<any>;
  },
): JSFFieldConfig {
  return {
    presentation: {
      inputType: 'hidden',
      Component:
        options?.Component ||
        (() => (
          <div
            className={cn(
              'RemoteFlows__InformationStatement',
              options?.className,
            )}
          >
            <h3
              className={cn(
                'RemoteFlows__InformationStatement__Title',
                options?.titleClassName,
              )}
            >
              {title}
            </h3>
            <p
              className={cn(
                'RemoteFlows__InformationStatement__Description',
                options?.descriptionClassName,
              )}
            >
              {description}
            </p>
          </div>
        )),
    },
  };
}
