
export default function CalligraphicDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="w-24 md:w-40 h-[1px] bg-[#462F29] opacity-40" />
    </div>
  );
}
