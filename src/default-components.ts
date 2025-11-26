/**
 * Default field components for RemoteFlows.
 *
 * This module exports all default field component implementations and a pre-configured
 * `defaultComponents` object that can be passed to the RemoteFlows SDK.
 *
 * @example
 * ```tsx
 * import { defaultComponents } from '@remoteoss/remote-flows/default-components';
 *
 * <RemoteFlows components={defaultComponents} {...otherProps}>
 *   {children}
 * </RemoteFlows>
 * ```
 *
 * You can also import individual default components if you want to mix them with custom ones:
 *
 */

export { defaultComponents } from './components/form/fields/default';
