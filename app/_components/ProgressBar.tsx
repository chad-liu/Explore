interface Props {
  stepCount: number;
}

export default function ProgressBar({ stepCount }: Props) {
  return (
    <div className="w-full max-w-[700px] mx-auto bg-[#f0f4f8] px-6 py-2 flex gap-2 items-center">
      <span className="text-xs text-gray-500 whitespace-nowrap">進度</span>
      {[1, 2, 3, 4, 5].map(step => (
        <div
          key={step}
          className={`flex-1 h-1.5 rounded-full transition-all duration-400 ${
            step <= stepCount ? 'bg-[#4a90d9]' : 'bg-[#d0dce8]'
          }`}
        />
      ))}
    </div>
  );
}
