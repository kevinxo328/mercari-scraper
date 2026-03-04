'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export type Props = {
  timestamp?: Date | string;
  className?: string;
};

function formatTimestamp(timestamp: Date | string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(new Date(timestamp));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')} ${timeZone}`;
}

export default function TimeDisplay({ timestamp, className }: Props) {
  const [isClient, setIsClient] = useState(false);
  const localeTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <span className={className || ''}>Loading...</span>;
  }

  const formattedTime = timestamp
    ? formatTimestamp(timestamp, localeTimeZone)
    : 'N/A';

  return <span className={cn(className)}>{formattedTime}</span>;
}
