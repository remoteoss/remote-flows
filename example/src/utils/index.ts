export const downloadFile = (url: string, downloadFile: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = downloadFile;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
