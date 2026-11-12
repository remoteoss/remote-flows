import { parseValuesForValidation } from './headlessForm';
import type { JSONSchemaFormResultWithFieldsets } from './types';

describe('parseValuesForValidation', () => {
  it('converts selected files with the converter it is given', async () => {
    const files = [{ name: 'contract.pdf', id: 'file-1' }];
    const convertFiles = vi.fn().mockResolvedValue([{ name: 'converted.pdf' }]);
    const form = {
      fields: [{ name: 'contract', type: 'file', isVisible: true }],
    } as unknown as JSONSchemaFormResultWithFieldsets;

    const result = await parseValuesForValidation(
      form,
      'buildOnce',
      { contract: files },
      convertFiles,
    );

    expect(convertFiles).toHaveBeenCalledWith(files);
    expect(result).toEqual({ contract: [{ name: 'converted.pdf' }] });
  });
});
