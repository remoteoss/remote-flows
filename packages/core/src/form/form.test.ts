import { parseJSFToValidate } from './form';

describe('parseJSFToValidate file conversion', () => {
  const fileField = {
    name: 'contract',
    type: 'file',
    isVisible: true,
  };

  it('hands the selected files to the converter it is given', async () => {
    const files = [{ name: 'contract.pdf', id: 'file-1' }];
    const convertFiles = vi.fn().mockResolvedValue([{ name: 'converted.pdf' }]);

    const result = await parseJSFToValidate({ contract: files }, [fileField], {
      convertFiles,
    });

    expect(convertFiles).toHaveBeenCalledTimes(1);
    expect(convertFiles).toHaveBeenCalledWith(files);
    expect(result).toEqual({ contract: [{ name: 'converted.pdf' }] });
  });

  it('does not call the converter when no file is selected', async () => {
    const convertFiles = vi.fn();

    await parseJSFToValidate({ contract: undefined }, [fileField], {
      convertFiles,
    });

    expect(convertFiles).not.toHaveBeenCalled();
  });
});
