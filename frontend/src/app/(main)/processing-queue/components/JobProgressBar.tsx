export function JobProgressBar({ progress }: { progress: number }) {
  return (
    <div className="mt-1.5 h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-[#ececec]">
      <span className="block h-full rounded-full bg-blue-dot transition-[width] duration-400" style={{ width: `${progress}%` }} />
    </div>
  );
}
