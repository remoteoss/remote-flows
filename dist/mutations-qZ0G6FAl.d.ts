import './remoteFlows-DL-yjkRb.js';

interface SuccessResponse<D> {
    data: D;
    error: null;
}
interface FieldError {
    field: string;
    messages: string[];
}
interface ErrorResponse<E> {
    data: null;
    error: E;
    rawError: Record<string, unknown>;
    fieldErrors: FieldError[];
}
/**
 * Enhanced FieldError interface with user-friendly labels
 */
interface NormalizedFieldError extends FieldError {
    userFriendlyLabel: string;
}

export type { ErrorResponse as E, FieldError as F, NormalizedFieldError as N, SuccessResponse as S };
