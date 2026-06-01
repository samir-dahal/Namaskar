import type { DailyResponse } from '../utils/storage';

interface DateDisplayProps {
  greeting: string;
  name: string;
  nepaliDate: DailyResponse['nepali_date'] | null;
  gregorianDate: DailyResponse['gregorian_date'] | null;
  events: DailyResponse['events'];
  showTithi: boolean;
  dateLanguage: 'en' | 'ne';
  isLoading: boolean;
}

function formatBsDateEn(nd: DailyResponse['nepali_date']): string {
  return `${nd.month_name} ${nd.day}, ${nd.year}`;
}

function formatBsDateNe(nd: DailyResponse['nepali_date']): string {
  return `${nd.month_name_ne} ${nd.day_ne}, ${nd.year_ne}`;
}

export function GlassCard({
  greeting,
  name,
  nepaliDate,
  gregorianDate,
  events,
  showTithi,
  dateLanguage,
  isLoading,
}: DateDisplayProps) {
  const isNe = dateLanguage === 'ne';
  const hasEvents = events.length > 0;
  const hasTithi = showTithi && (isNe ? nepaliDate?.tithi_ne : nepaliDate?.tithi_en);
  const hasMeta = hasTithi || hasEvents;

  return (
    <div className="date-display" role="main">
      {/* Hero BS date */}
      {isLoading && !nepaliDate ? (
        <div className="skeleton-block" aria-label="Loading…">
          <div className="skeleton skeleton-hero" />
          <div className="skeleton skeleton-sub" />
        </div>
      ) : nepaliDate ? (
        <>
          <h1 className="date-hero">
            {isNe ? formatBsDateNe(nepaliDate) : formatBsDateEn(nepaliDate)}
          </h1>
          <p className="date-sub">
            {isNe ? nepaliDate.weekday_ne : null}
            {isNe && gregorianDate ? (<span className="sub-sep" aria-hidden="true"> · </span>) : null}
            {gregorianDate?.formatted}
          </p>
        </>
      ) : null}

      {/* Events / tithi */}
      {hasMeta && (
        <div className="date-meta">
          {hasTithi && (
            <span className="meta-tithi">
              {isNe ? nepaliDate!.tithi_ne : nepaliDate!.tithi_en}
            </span>
          )}
          {hasTithi && hasEvents && (
            <span className="meta-sep" aria-hidden="true"> · </span>
          )}
          {hasEvents && (
            <span className="meta-events">
              {events.map((ev, i) => (
                <span key={i}>
                  {isNe ? ev.name_ne : ev.name_en}
                  {i < events.length - 1 && (
                    <span className="event-sep" aria-hidden="true"> · </span>
                  )}
                </span>
              ))}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
