"use client";

import { useEffect, useState, useCallback } from "react";

export function useCountdown(targetDate: string | number | Date) {
  const calc = useCallback(() => {
    const now = Date.now();
    const target = new Date(targetDate).getTime();
    const diff = target - now;

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isFinished: true,
      };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isFinished: false,
    };
  }, [targetDate]);

  // Keep the server render and first browser render identical.
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: false,
  });

  useEffect(() => {
    // Calculate the real countdown after hydration, then update every second.
    setTimeLeft(calc());
    const interval = setInterval(() => {
      setTimeLeft(calc());
    }, 1000);

    return () => clearInterval(interval);
  }, [calc]);

  return timeLeft;
}
