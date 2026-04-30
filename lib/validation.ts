/**
 * Validates a Malaysian NRIC number and calculates age.
 * Format: YYMMDD-PB-###G
 */
export function validateNRIC(nric: string): { isValid: boolean; age?: number; error?: string; dob?: Date } {
    // Remove hyphens for processing
    const cleanNRIC = nric.replace(/-/g, '');

    // 1. Basic Format Check (12 digits)
    if (!/^\d{12}$/.test(cleanNRIC)) {
        return { isValid: false, error: 'NRIC must be 12 digits (e.g., 000101-14-1234)' };
    }

    // 2. Extract Date Parts
    const yy = parseInt(cleanNRIC.substring(0, 2));
    const mm = parseInt(cleanNRIC.substring(2, 4));
    const dd = parseInt(cleanNRIC.substring(4, 6));

    // 3. Determine Century (Assumes 00-26 is 2000s, 27-99 is 1900s for a student system)
    const currentYear = new Date().getFullYear();
    const currentYearShort = currentYear % 100;
    const century = yy <= currentYearShort ? 2000 : 1900;
    const fullYear = century + yy;

    // 4. Validate Date Exists
    const dob = new Date(fullYear, mm - 1, dd);
    if (
        dob.getFullYear() !== fullYear ||
        dob.getMonth() !== mm - 1 ||
        dob.getDate() !== dd
    ) {
        return { isValid: false, error: 'Invalid date of birth in NRIC' };
    }

    // 5. Prevent Future Birth Dates
    const now = new Date();
    if (dob > now) {
        return { isValid: false, error: 'Birth date cannot be in the future', dob };
    }

    // 6. Calculate Age
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
        age--;
    }

    // 7. Age Requirement (18+)
    if (age < 18) {
        return { isValid: false, age, error: 'You must be at least 18 years old to register', dob };
    }

    return { isValid: true, age, dob };
}
