const toBase64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const convertFilesToBase64 = async (files: File[]) => {
  const base64Files = await Promise.all(
    files.map(async (file) => {
      const base64 = await toBase64(file);
      return {
        ...file,
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
