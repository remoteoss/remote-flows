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
