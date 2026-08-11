import { convertFilesToBase64 } from '../files';

describe('files lib', () => {
  describe('convertFilesToBase64', () => {
    it('base64-encodes a newly selected File', async () => {
      const file = new File(['%PDF-1.4 fake pdf content'], 'cba_document.pdf', {
        type: 'application/pdf',
      });

      const result = await convertFilesToBase64([file]);

      expect(result).toEqual([
        {
          name: 'cba_document.pdf',
          size: file.size,
          type: 'application/pdf',
          content: expect.any(String),
        },
      ]);
    });

    it('passes through an already-uploaded file by reference instead of re-encoding it', async () => {
      const uploadedFile = {
        name: 'cba_document.pdf',
        id: 'a1526614-e218-4f8f-a9d7-055a014ab42c',
        sub_type: 'cba_document',
      };

      const result = await convertFilesToBase64([uploadedFile]);

      expect(result).toEqual([
        {
          name: 'cba_document.pdf',
          id: 'a1526614-e218-4f8f-a9d7-055a014ab42c',
        },
      ]);
    });

    it('handles a mix of a new File and an already-uploaded reference', async () => {
      const newFile = new File(['content'], 'new.pdf', {
        type: 'application/pdf',
      });
      const uploadedFile = { name: 'existing.pdf', id: 'existing-id' };

      const result = await convertFilesToBase64([newFile, uploadedFile]);

      expect(result).toEqual([
        {
          name: 'new.pdf',
          size: newFile.size,
          type: 'application/pdf',
          content: expect.any(String),
        },
        { name: 'existing.pdf', id: 'existing-id' },
      ]);
    });
  });
});
