import React, { useState, useRef } from 'react';
import { Button } from '@/src/components/ui/button';
import { Upload, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type FileUploaderProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  multiple?: boolean;
  accept?: string;
};

export function FileUploader({
  onChange,
  className,
  multiple,
  accept,
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      setFiles(newFiles);
      onChange(e);
    }
  };

  const onRemoveFile = (file: File) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
  };

  return (
    <div className={cn('flex flex-col items-start gap-4', className)}>
      <input
        type='file'
        ref={inputRef}
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
            <Button variant='ghost' onClick={() => onRemoveFile(file)}>
              <X />
            </Button>
          </div>
        ))}
    </div>
  );
}
