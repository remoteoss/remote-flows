import { ClassValue } from 'clsx';
import { ValidationError } from 'yup';
import './remoteFlows-BlCKwGdn.js';

declare function cn(...inputs: ClassValue[]): string;
type YupError = Pick<ValidationError, 'type' | 'errors'> & {
    inner: Record<string, YupError>[];
};
/**
 * Transforms a Yup ValidationError object into a more readable object. The format is as follows:
 *  {
 *    [fieldName]: {
 *      type: string,
 *      errors: string[],
 *      inner: YupError[],
 *    },
 *  }
 * @param errors
 * @returns
 */
declare const transformYupErrorsIntoObject: (errors: ValidationError) => Record<string, YupError>;

export { cn as c, transformYupErrorsIntoObject as t };
