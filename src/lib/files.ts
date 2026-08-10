import { UploadedFileReference } from '@/src/types/fields';

const toBase64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Base64-encodes newly selected files. Items that aren't a `File` (i.e. a reference to a file
 * already uploaded, as returned by the API) are passed through by `name`/`slug` instead of being
 * re-encoded — there's no binary content to read for those.
 */
export const convertFilesToBase64 = async (
  files: (File | UploadedFileReference)[],
) => {
  const base64Files = await Promise.all(
    files.map(async (file) => {
      if (!(file instanceof File)) {
        return { name: file.name, slug: file.slug };
      }

      const base64 = await toBase64(file);
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        content: base64.split(',')[1],
      };
    }),
  );
  return base64Files;
};

/**
 * Convert a data URL to a File object
 * @param dataURL - The data URL to convert
 * @param filename - The name of the file
 * @returns The File object
 */
export function dataURLtoFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);

  const u8arr = Uint8Array.from(bstr, (char) => char.charCodeAt(0));

  return new File([u8arr], filename, { type: mime });
}
