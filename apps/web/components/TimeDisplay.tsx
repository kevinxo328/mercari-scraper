"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Props = {
  timestamp?: Date | string;
  className?: string;
};

export function TimeDisplay({ timestamp, className }: Props) {
  const [isClient, setIsClient] = useState(false);
  const localeTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <span className={className || ""}>Loading...</span>;
  }

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString(undefined, {
        timeZone: localeTimeZone,
      })
    : "N/A";

  return (
    <span className={cn(className)}>
      {timestamp ? `${formattedTime} ${localeTimeZone}` : "N/A"}
    </span>
  );
}
