'use client';

interface ConflictAlertProps {
  conflicts: { week: string; count: number }[];
}

export default function ConflictAlert({ conflicts }: ConflictAlertProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow rounded-2xl p-4 mb-4">
      {conflicts.map((conflict, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-navy">
              Heads up — you have {conflict.count} deadlines in the week of {conflict.week}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              Start early so you&apos;re not rushing multiple applications at once.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
