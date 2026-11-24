import { parseJSFToValidate, toFormValues } from './form';

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

describe('toFormValues', () => {
  const fields = [
    { name: 'job_title', type: 'text', isVisible: true },
    { name: 'annual_salary', type: 'money', isVisible: true },
  ] as Parameters<typeof toFormValues>[1];

  it('converts saved money from cents and drops keys the schema does not know', () => {
    expect(
      toFormValues(
        { job_title: 'Payroll analyst', annual_salary: 500000, retired: 'x' },
        fields,
      ),
    ).toEqual({ job_title: 'Payroll analyst', annual_salary: 5000 });
  });

  it('returns nothing while there are no saved values or no fields yet', () => {
    expect(toFormValues(undefined, fields)).toBeUndefined();
    expect(toFormValues({ job_title: 'Payroll analyst' }, undefined)).toBe(
      undefined,
    );
  });
});
