import React, { useState } from 'react';

export const Accordion = ({
  summary,
  children,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className='accordion border rounded-lg p-4 mb-4'
      open={isOpen}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
    >
      <summary className='cursor-pointer font-semibold text-blue-600 hover:text-blue-800'>
        {summary}
      </summary>
      <div className='mt-2 pl-4 border-l-2 border-blue-200'>{children}</div>
    </details>
  );
};
