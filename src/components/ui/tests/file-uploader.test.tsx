import { fireEvent, render, screen } from '@testing-library/react';
import { FileUploader } from '@/src/components/ui/file-uploader';

// `FileUploader`'s public `files`/`onChange` types stay `File[]` to avoid a breaking change for
// consumers, but at runtime a field pre-populated from the API can hand it an already-uploaded
// reference object instead. These tests deliberately pass that shape past the declared type to
// cover the defensive runtime handling.
describe('FileUploader', () => {
  it('renders an already-uploaded file reference by name without crashing', () => {
    const uploadedFile = {
      name: 'cba_document.pdf',
      id: 'a1526614-e218-4f8f-a9d7-055a014ab42c',
    };

    render(
      <FileUploader
        onChange={vi.fn()}
        files={[uploadedFile] as unknown as File[]}
      />,
    );

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
    const uploadedFile = { name: 'cba_document.pdf', id: 'existing-id' };
    const file = new File(['content'], 'new.pdf', { type: 'application/pdf' });

    render(
      <FileUploader
        onChange={onChange}
        files={[uploadedFile, file] as unknown as File[]}
        multiple
      />,
    );

    const removeButtons = screen.getAllByRole('button', { name: '' });
    // One remove button per file, in the same order as `files`: uploadedFile, then file.
    fireEvent.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith([file]);
  });

  it('replaces the current selection instead of appending when multiple is false', () => {
    const onChange = vi.fn();
    const existingFile = new File(['old'], 'old.pdf', {
      type: 'application/pdf',
    });
    const newFile = new File(['new'], 'new.pdf', { type: 'application/pdf' });

    render(
      <FileUploader
        onChange={onChange}
        files={[existingFile]}
        multiple={false}
      />,
    );

    const fileInput = screen.getByLabelText('File upload');
    fireEvent.change(fileInput, { target: { files: [newFile] } });

    expect(onChange).toHaveBeenCalledWith([newFile]);
    expect(screen.queryByText('old.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('new.pdf')).toBeInTheDocument();
  });

  it('accumulates files instead of replacing when multiple is true', () => {
    const onChange = vi.fn();
    const existingFile = new File(['old'], 'old.pdf', {
      type: 'application/pdf',
    });
    const newFile = new File(['new'], 'new.pdf', { type: 'application/pdf' });

    render(
      <FileUploader onChange={onChange} files={[existingFile]} multiple />,
    );

    const fileInput = screen.getByLabelText('File upload');
    fireEvent.change(fileInput, { target: { files: [newFile] } });

    expect(onChange).toHaveBeenCalledWith([existingFile, newFile]);
  });

  it('accumulates files when multiple is left unset, for backward compatibility', () => {
    const onChange = vi.fn();
    const existingFile = new File(['old'], 'old.pdf', {
      type: 'application/pdf',
    });
    const newFile = new File(['new'], 'new.pdf', { type: 'application/pdf' });

    render(<FileUploader onChange={onChange} files={[existingFile]} />);

    const fileInput = screen.getByLabelText('File upload');
    fireEvent.change(fileInput, { target: { files: [newFile] } });

    expect(onChange).toHaveBeenCalledWith([existingFile, newFile]);
  });
});
