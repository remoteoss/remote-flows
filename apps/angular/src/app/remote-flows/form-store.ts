import { computed, effect, Signal, signal, untracked } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { HeadlessFormOptions } from '@remoteoss/remote-flows-core';
import { ENGINE_ERROR } from './control-state';
import { ArrayView, FieldView } from './field-contract';
import { FieldNode } from './field-tree';
import { createFormEngine } from './form-engine';
import { getIn, Path } from './path';

type Values = Record<string, unknown>;
type Schema = Record<string, unknown>;

type CreateFormStoreArgs = {
  schema: Signal<Schema | undefined>;
  defaultValues?: Values;
  options?: HeadlessFormOptions;
};

const asObject = (value: unknown): Values =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Values)
    : {};

const asArray = (value: unknown): Values[] =>
  Array.isArray(value) ? (value as Values[]) : [];

function buildGroup(nodes: FieldNode[], values: Values): FormGroup {
  const controls: Record<string, AbstractControl> = {};
  for (const node of nodes) {
    if (node.kind === 'statement') {
      continue;
    }
    if (node.kind === 'fieldset') {
      controls[node.name] = buildGroup(
        node.children,
        asObject(values[node.name]),
      );
    } else if (node.kind === 'array' && node.array) {
      const { itemFields } = node.array;
      controls[node.name] = new FormArray(
        asArray(values[node.name]).map((row) => buildGroup(itemFields, row)),
      );
    } else {
      controls[node.name] = new FormControl<unknown>(values[node.name] ?? '');
    }
  }
  return new FormGroup(controls);
}

function pathOf(control: AbstractControl): Path {
  const path: (string | number)[] = [];
  let current: AbstractControl = control;
  while (current.parent) {
    const parent: FormGroup | FormArray = current.parent;
    if (parent instanceof FormArray) {
      path.unshift(parent.controls.indexOf(current));
    } else {
      const name = Object.keys(parent.controls).find(
        (key) => parent.controls[key] === current,
      );
      path.unshift(name ?? '');
    }
    current = parent;
  }
  return path;
}

function applyErrors(control: AbstractControl, errors: Values) {
  const message = getIn(errors, pathOf(control));
  if (control.parent) {
    if (typeof message === 'string') {
      if (control.errors?.[ENGINE_ERROR] !== message) {
        control.setErrors({ [ENGINE_ERROR]: message });
      }
    } else if (control.errors?.[ENGINE_ERROR]) {
      control.setErrors(null);
    }
  }
  if (control instanceof FormGroup) {
    Object.values(control.controls).forEach((child) =>
      applyErrors(child, errors),
    );
  } else if (control instanceof FormArray) {
    control.controls.forEach((child) => applyErrors(child, errors));
  }
}

export function createFormStore({
  schema,
  defaultValues = {},
  options,
}: CreateFormStoreArgs) {
  const engine = computed(() => {
    const current = schema();
    return current ? createFormEngine(current, options) : null;
  });

  const revision = signal(0);
  let validationRun = 0;

  const form = computed(() => {
    const current = engine();
    if (!current) {
      return null;
    }
    const group = buildGroup(
      current.nodes,
      current.initialValues({
        currency: '',
        periodicity: '',
        start_date: '',
        number: '',
        note: '',
        ...defaultValues,
      }),
    );
    return { engine: current, group };
  });

  function toViews(
    nodes: FieldNode[],
    group: FormGroup,
    base: string,
  ): FieldView[] {
    return nodes.flatMap((node): FieldView[] => {
      if (!node.isVisible()) {
        return [];
      }
      const key = base ? `${base}.${node.name}` : node.name;
      const meta = node.meta();
      const control = group.controls[node.name] ?? null;

      if (node.kind === 'fieldset' && control instanceof FormGroup) {
        return [
          {
            key,
            meta,
            control,
            children: toViews(node.children, control, key),
            array: null,
          },
        ];
      }

      if (node.kind === 'array' && node.array && control instanceof FormArray) {
        const config = node.array;
        const rows = control.controls as FormGroup[];
        const array: ArrayView = {
          addFieldText: config.addFieldText,
          canAdd:
            config.maxItems === undefined || rows.length < config.maxItems,
          add: () => {
            control.push(buildGroup(config.itemFields, config.blankRow()));
            revision.update((count) => count + 1);
          },
          rows: rows.map((row, index) => ({
            id: row,
            canRemove: rows.length > config.minItems,
            remove: () => {
              control.removeAt(control.controls.indexOf(row));
              revision.update((count) => count + 1);
            },
            fields: toViews(config.itemFields, row, `${key}.${index}`),
          })),
        };
        return [{ key, meta, control, children: [], array }];
      }

      return [{ key, meta, control, children: [], array: null }];
    });
  }

  const fields = computed<FieldView[]>(() => {
    revision();
    const current = form();
    return current ? toViews(current.engine.nodes, current.group, '') : [];
  });

  async function validate() {
    const current = form();
    if (!current) {
      return { hasErrors: false };
    }
    const run = ++validationRun;
    const errors = await current.engine.validate(current.group.getRawValue());
    if (run === validationRun && form() === current) {
      applyErrors(current.group, errors);
      revision.update((count) => count + 1);
    }
    return { hasErrors: Object.keys(errors).length > 0 };
  }

  effect((onCleanup) => {
    const current = form();
    if (!current) {
      return;
    }
    const subscription = current.group.valueChanges.subscribe(() => {
      void validate();
    });
    onCleanup(() => subscription.unsubscribe());
    untracked(() => void validate());
  });

  async function submit() {
    form()?.group.markAllAsTouched();
    return validate();
  }

  async function parse() {
    const current = form();
    return current ? current.engine.parse(current.group.getRawValue()) : {};
  }

  return { fields, validate, submit, parse };
}
