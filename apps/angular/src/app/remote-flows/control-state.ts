import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { map, of, startWith, switchMap } from 'rxjs';

export const ENGINE_ERROR = 'engine';

export type ControlState = { error: string | null; touched: boolean };

const idle: ControlState = { error: null, touched: false };

function snapshot(control: AbstractControl): ControlState {
  const error = control.errors?.[ENGINE_ERROR];
  return {
    error: typeof error === 'string' ? error : null,
    touched: control.touched,
  };
}

export function controlState(
  control: Signal<AbstractControl | null>,
): Signal<ControlState> {
  return toSignal(
    toObservable(control).pipe(
      switchMap((current) =>
        current
          ? current.events.pipe(
              startWith(null),
              map(() => snapshot(current)),
            )
          : of(idle),
      ),
    ),
    { initialValue: idle },
  );
}
