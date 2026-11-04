import equal from 'fast-deep-equal';

// @ts-expect-error vite's import.meta.glob is not in this tsconfig's types
const modules: Record<string, unknown> = import.meta.glob(
  [
    '/example/src/flows/JsonSchemaPlayground/schemas/*.ts',
    '/src/flows/**/tests/fixtures/**/*.ts',
    '/src/flows/**/json-schemas/**/*.ts',
    '/src/common/**/json-schema*.ts',
    '/src/tests/**/*.ts',
  ],
  { eager: true },
);

type Node = Record<string, unknown>;

function walk(value: unknown, visit: (node: Node, path: string) => void, path = '') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, `${path}[${index}]`));
    return;
  }
  visit(value as Node, path);
  Object.entries(value as Node).forEach(([key, child]) =>
    walk(child, visit, `${path}.${key}`),
  );
}

it('scans for read-only forced fields with an inputType', () => {
  const readOnlyProps: string[] = [];
  const constsByName = new Map<string, Node[]>();
  const hits: string[] = [];

  Object.entries(modules).forEach(([file, mod]) => {
    walk(mod, (node, path) => {
      const properties = node.properties as Record<string, Node> | undefined;
      if (!properties || typeof properties !== 'object') return;
      Object.entries(properties).forEach(([name, prop]) => {
        if (!prop || typeof prop !== 'object') return;
        const key = `${file}::${name}`;
        if ('const' in prop || 'x-jsf-logic-computedAttrs' in prop) {
          constsByName.set(key, [...(constsByName.get(key) ?? []), prop]);
        }
        if (prop.readOnly === true) {
          readOnlyProps.push(`${key} @ ${path}`);
          const inputType = (prop['x-jsf-presentation'] as Node | undefined)
            ?.inputType;
          const computed = prop['x-jsf-logic-computedAttrs'] as Node | undefined;
          const forced =
            ('const' in prop && equal(prop.const, prop.default)) ||
            (computed?.const !== undefined && computed.const === computed.default);
          if (forced && inputType) hits.push(`${key} (inputType ${String(inputType)})`);
        }
      });
    });
  });

  const readOnlyWithConstElsewhere = readOnlyProps
    .map((entry) => entry.split(' @ ')[0])
    .filter((key) => constsByName.has(key));

  console.warn(
    JSON.stringify(
      {
        files: Object.keys(modules).length,
        readOnlyProps: readOnlyProps.length,
        readOnlyNames: [...new Set(readOnlyProps.map((e) => e.split(' @ ')[0]))],
        readOnlyWithConstElsewhere: [...new Set(readOnlyWithConstElsewhere)].map(
          (key) => ({
            key,
            readOnlyPresentation: readOnlyProps
              .filter((entry) => entry.startsWith(`${key} @`))
              .map((entry) => entry.split(' @ ')[1]),
            constNodes: constsByName.get(key),
          }),
        ),
        hits,
      },
      null,
      2,
    ),
  );
});
