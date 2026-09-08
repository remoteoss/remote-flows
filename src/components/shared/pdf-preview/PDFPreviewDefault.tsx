import { PDFPreviewComponentProps } from '@/src/types/remoteFlows';

export function PDFPreviewDefault({
  base64Data,
  fileName = 'document.pdf',
}: PDFPreviewComponentProps) {
  if (!base64Data) {
    return (
      <div className='w-full border rounded p-8 text-center bg-gray-50'>
        <p className='text-gray-500'>No PDF data available</p>
      </div>
    );
  }

  return (
    // Fills its container when given one — in a drawer the viewer should use the height it
    // has rather than a fixed slab with dead space under it. `min-h` keeps the previous
    // rendering wherever the parent's height is unconstrained, since an iframe has no
    // intrinsic height to grow from.
    <div className='w-full h-full flex flex-col gap-4'>
      <iframe
        src={base64Data}
        className='w-full flex-1 min-h-[600px] border rounded'
        title={fileName}
      />
      <div className='flex justify-between items-center text-sm'>
        <p className='text-gray-600'>{fileName}</p>
        <a
          href={base64Data}
          download={fileName}
          className='text-blue-600 hover:underline'
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
