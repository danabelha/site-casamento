
export default function CalligraphicDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <svg 
        width="160" 
        height="40" 
        viewBox="0 0 160 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-32 md:w-48 h-auto"
      >
        <path 
          d="M10 25C25 25 20 10 30 15C45 25 60 15 90 18C120 21 140 10 150 12" 
          stroke="#462F29" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
