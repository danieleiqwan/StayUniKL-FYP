import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Returns a Date object adjusted to Malaysia Time (UTC+8)
 * even if the server is running in UTC.
 */
export function getKLDate() {
    const now = new Date();
    // Malaysia is UTC+8. We can force the offset or use Intl
    const klTime = now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" });
    return new Date(klTime);
}
