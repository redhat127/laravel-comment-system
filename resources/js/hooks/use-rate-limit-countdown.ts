import { useEffect, useState } from 'react';

const calculateRemaining = (expiresAt?: number) => {
  if (!expiresAt) return 0;
  return Math.max(0, Math.floor(expiresAt - Date.now() / 1000));
};

export function useRateLimitCountdown(expiresAt?: number) {
  const [seconds, setSeconds] = useState(() => calculateRemaining(expiresAt));

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      setSeconds(calculateRemaining(expiresAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return {
    seconds,
    isFinished: seconds === 0,
  };
}
