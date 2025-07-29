export const BasicTooltip = ({
  children,
  content,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
}) => {
  return (
    <div className="relative inline-block group">
      {children}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-64 whitespace-normal break-words">
        {content}
        <div className="absolute top-full right-3 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};
