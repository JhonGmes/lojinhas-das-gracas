import { useState, useCallback } from 'react';

interface RateLimitConfig {
    limit: number;
    windowMs: number;
    key: string;
}

export function useRateLimit({ limit, windowMs, key }: RateLimitConfig) {
    const [isLimited, setIsLimited] = useState(false);

    const checkLimit = useCallback((): boolean => {
        const now = Date.now();
        const storageKey = `rate_limit_${key}`;
        const data = JSON.parse(localStorage.getItem(storageKey) || '[]');

        // Clean up old timestamps
        const recentRequests = data.filter((timestamp: number) => now - timestamp < windowMs);

        if (recentRequests.length >= limit) {
            setIsLimited(true);
            return false;
        }

        recentRequests.push(now);
        localStorage.setItem(storageKey, JSON.stringify(recentRequests));
        setIsLimited(false);
        return true;
    }, [limit, windowMs, key]);

    const resetLimit = useCallback(() => {
        localStorage.removeItem(`rate_limit_${key}`);
        setIsLimited(false);
    }, [key]);

    return { checkLimit, isLimited, resetLimit };
}
