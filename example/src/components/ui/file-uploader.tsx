import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Upload, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

// Convert accept string to readable format (e.g., ".pdf, .doc" -> "PDF, DOC")
const getAcceptedFormats = (accept?: string) => {
  if (!accept) return null;
  return accept
    .split(',')
    .map((ext) => ext.trim().toUpperCase())
    .join(', ');
};

type FileUploaderProps = {
  onChange: (files: File[]) => void;
  className?: string;
  multiple?: boolean;
  accept?: string;
  files?: File[];
  id?: string;
};

export function FileUploader({
  onChange,
  className,
  multiple,
  accept,
  files: externalFiles,
  id,
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>(externalFiles || []);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalFiles && externalFiles.length > 0) {
      setFiles(externalFiles);
    }
  }, [externalFiles]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      setFiles([...files, ...newFiles]);
      onChange([...files, ...newFiles]);
    }
  };

  const onRemoveFile = (file: File) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
    onChange(files.filter((f) => f.name !== file.name));
  };

  const acceptedFormats = getAcceptedFormats(accept);

  return (
    <div className={cn('flex flex-col items-start gap-4', className)}>
      <input
        type='file'
        ref={inputRef}
        id={id}
        onChange={handleChange}
        className='hidden'
        aria-label='File upload'
        multiple={multiple}
        accept={accept}
      />
      <Button type='button' onClick={handleClick} className='gap-2'>
        <Upload className='h-4 w-4' />
        Choose File
      </Button>
      {acceptedFormats && (
        <div className='text-sm text-gray-600'>
          Accepted formats:{' '}
          <span className='font-medium'>{acceptedFormats}</span>
        </div>
      )}
      {files.length === 0 && (
        <div className='text-sm'>
          {!multiple ? (
            <span className='font-medium'>No file selected.</span>
          ) : (
            <span className='font-medium'>
              No files selected. You can select multiple files
            </span>
          )}
        </div>
      )}
      {files.length > 0 &&
        files.map((file, index) => (
          <div key={index} className='text-sm flex items-center gap-2'>
            Selected file: <span className='font-medium'>{file.name}</span> (
            {Math.round(file.size / 1024)} KB)
            <Button
              type='button'
              variant='ghost'
              onClick={() => onRemoveFile(file)}
            >
              <X />
            </Button>
          </div>
        ))}
    </div>
  );
}
