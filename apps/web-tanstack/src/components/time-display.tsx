import { cn } from '@/lib/utils';
import { useHydrated } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export type Props = {
  timestamp?: Date | string | null;
  className?: string;
};

function formatTimestamp(
  timestamp: Date | string | null,
  timeZone: string
): string {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return 'N/A';
  }

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')} ${timeZone}`;
}

export default function TimeDisplay({ timestamp, className }: Props) {
  const [isClient, setIsClient] = useState(false);
  const isHydrated = useHydrated();
  const localeTimeZone = isHydrated
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC';

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <span className={className || ''}>Loading...</span>;
  }

  const formattedTime =
    timestamp && timestamp !== 'N/A'
      ? formatTimestamp(timestamp, localeTimeZone)
      : 'N/A';

  return <span className={cn(className)}>{formattedTime}</span>;
}
