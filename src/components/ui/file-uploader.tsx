import React from 'react';

import { useState, useRef } from 'react';
import { Button } from '@/src/components/ui/button';
import { Upload } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type FileUploaderProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export function FileUploader({ onChange, className }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    onChange(e);
  };

  return (
    <div className={cn('flex flex-col items-start gap-4', className)}>
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        className="hidden"
        aria-label="File upload"
      />
      <Button onClick={handleClick} className="gap-2">
        <Upload className="h-4 w-4" />
        Choose File
      </Button>
      {!file && (
        <div className="text-sm">
          No file selected. Click the button to choose a file.
        </div>
      )}
      {file && (
        <div className="text-sm">
          Selected file: <span className="font-medium">{file.name}</span> (
          {Math.round(file.size / 1024)} KB)
        </div>
      )}
    </div>
  );
}
