import { fireEvent, render, screen } from '@testing-library/react';
import { FileUploader } from '@/src/components/ui/file-uploader';

describe('FileUploader', () => {
  it('renders an already-uploaded file reference by name without crashing', () => {
    const uploadedFile = {
      name: 'cba_document.pdf',
      slug: 'a1526614-e218-4f8f-a9d7-055a014ab42c',
    };

    render(<FileUploader onChange={vi.fn()} files={[uploadedFile]} />);

    expect(screen.getByText('cba_document.pdf')).toBeInTheDocument();
    expect(screen.queryByText(/KB\)/)).not.toBeInTheDocument();
  });

  it('still shows the size for a newly selected File', () => {
    const file = new File(['content'], 'new.pdf', { type: 'application/pdf' });

    render(<FileUploader onChange={vi.fn()} files={[file]} />);

    expect(screen.getByText('new.pdf')).toBeInTheDocument();
    expect(screen.getByText(/KB\)/)).toBeInTheDocument();
  });

  it('calls onChange with the remaining files when removing an uploaded reference', () => {
    const onChange = vi.fn();
    const uploadedFile = { name: 'cba_document.pdf', slug: 'existing-slug' };
    const file = new File(['content'], 'new.pdf', { type: 'application/pdf' });

    render(
      <FileUploader
        onChange={onChange}
        files={[uploadedFile, file]}
        multiple
      />,
    );

    const removeButtons = screen.getAllByRole('button', { name: '' });
    // One remove button per file, in the same order as `files`: uploadedFile, then file.
    fireEvent.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith([file]);
  });
});
