/**
 * Loading fallback component shown while lazy-loaded form components are being fetched.
 *
 * This component displays a skeleton loading state using pulse animation
 * while React Suspense loads the default field components.
 */
export function FormLoadingFallback() {
  return (
    <div className='animate-pulse space-y-4 p-4'>
      <div className='h-4 bg-gray-200 rounded w-1/4' />
      <div className='h-10 bg-gray-200 rounded' />
      <div className='h-4 bg-gray-200 rounded w-1/4' />
      <div className='h-10 bg-gray-200 rounded' />
    </div>
  );
}
