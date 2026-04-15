'use client';

interface ConflictAlertProps {
  conflicts: { week: string; count: number }[];
}

export default function ConflictAlert({ conflicts }: ConflictAlertProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className="space-y-3 mb-4">
      {conflicts.map((conflict, i) => (
        <div
          key={i}
          className="bg-[rgba(255,59,48,0.06)] border border-[#ff3b30]/20 rounded-2xl p-4 flex items-start gap-3"
        >
          <span className="w-2 h-2 rounded-full bg-[#ff3b30] mt-1.5 shrink-0" />
          <div>
            <p className="text-[13px] font-[500] text-[#1d1d1f]">
              You have {conflict.count} deadlines in the week of {conflict.week}
            </p>
            <p className="text-[12px] text-[#86868b] mt-0.5">
              Start early so you&apos;re not rushing multiple applications at once.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
