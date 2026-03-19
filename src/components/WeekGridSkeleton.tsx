import { Fragment } from 'react';

const SHIMMER =
  'rounded-xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer';

function WeekGridSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Nav skeleton */}
      <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
        <div className={`${SHIMMER} h-8 w-8`} />
        <div className={`${SHIMMER} h-5 w-32`} />
        <div className={`${SHIMMER} h-8 w-8`} />
      </div>

      {/* Mobile skeleton: toggle + vertical list */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className={`${SHIMMER} h-10 rounded-xl`} />
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3">
            <div className={`${SHIMMER} h-12 w-14 shrink-0`} />
            <div className={`${SHIMMER} h-[60px] flex-1`} />
          </div>
        ))}
      </div>

      {/* Desktop skeleton: horizontal grid */}
      <div className="hidden md:block">
        <div className="grid min-w-[700px] grid-cols-[auto_repeat(7,1fr)] gap-x-1.5 gap-y-1">
          <div />
          {Array.from({ length: 7 }, (_, i) => (
            <div key={`h-${i}`} className={`${SHIMMER} h-8`} />
          ))}
          {[0, 1].map((row) => (
            <Fragment key={row}>
              <div className={`${SHIMMER} h-4 w-12 self-center`} />
              {Array.from({ length: 7 }, (_, i) => (
                <div key={`c-${row}-${i}`} className={`${SHIMMER} h-[72px]`} />
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeekGridSkeleton;
