'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

// --- Country Data ---
interface Country {
    code: string;  // ISO 3166-1 alpha-2
    name: string;
    dial: string;  // e.g. "+60"
    flag: string;  // emoji flag
    format?: string; // phone number format hint e.g. "##-####-####"
}

const countries: Country[] = [
    { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾', format: '##-###-####' },
    { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬', format: '####-####' },
    { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩', format: '##-###-####' },
    { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭', format: '##-###-####' },
    { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭', format: '###-###-####' },
    { code: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳', format: '##-####-###' },
    { code: 'MM', name: 'Myanmar', dial: '+95', flag: '🇲🇲', format: '##-###-###' },
    { code: 'KH', name: 'Cambodia', dial: '+855', flag: '🇰🇭', format: '##-###-###' },
    { code: 'LA', name: 'Laos', dial: '+856', flag: '🇱🇦', format: '##-###-###' },
    { code: 'BN', name: 'Brunei', dial: '+673', flag: '🇧🇳', format: '###-####' },
    { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺', format: '#-####-####' },
    { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿', format: '##-###-####' },
    { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳', format: '##-####-####' },
    { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵', format: '##-####-####' },
    { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷', format: '##-####-####' },
    { code: 'TW', name: 'Taiwan', dial: '+886', flag: '🇹🇼', format: '#-####-####' },
    { code: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰', format: '####-####' },
    { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳', format: '##-####-####' },
    { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰', format: '###-#######' },
    { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩', format: '##-####-###' },
    { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: '🇱🇰', format: '##-###-####' },
    { code: 'NP', name: 'Nepal', dial: '+977', flag: '🇳🇵', format: '##-###-###' },
    { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧', format: '##-####-####' },
    { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸', format: '###-###-####' },
    { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦', format: '###-###-####' },
    { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦', format: '##-###-####' },
    { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪', format: '##-###-####' },
    { code: 'QA', name: 'Qatar', dial: '+974', flag: '🇶🇦', format: '###-####' },
    { code: 'KW', name: 'Kuwait', dial: '+965', flag: '🇰🇼', format: '###-####' },
    { code: 'OM', name: 'Oman', dial: '+968', flag: '🇴🇲', format: '##-###-###' },
    { code: 'BH', name: 'Bahrain', dial: '+973', flag: '🇧🇭', format: '####-####' },
    { code: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬', format: '##-###-####' },
    { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦', format: '##-###-####' },
    { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬', format: '###-###-####' },
    { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪', format: '###-###-###' },
    { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷', format: '##-####-###' },
    { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪', format: '##-####-###' },
    { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹', format: '###-###-####' },
    { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸', format: '###-###-###' },
    { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱', format: '##-###-####' },
    { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪', format: '##-###-####' },
    { code: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴', format: '###-###-###' },
    { code: 'DK', name: 'Denmark', dial: '+45', flag: '🇩🇰', format: '##-###-###' },
    { code: 'FI', name: 'Finland', dial: '+358', flag: '🇫🇮', format: '##-###-###' },
    { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭', format: '##-###-####' },
    { code: 'AT', name: 'Austria', dial: '+43', flag: '🇦🇹', format: '###-#######' },
    { code: 'BE', name: 'Belgium', dial: '+32', flag: '🇧🇪', format: '###-###-###' },
    { code: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪', format: '##-###-####' },
    { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹', format: '##-###-####' },
    { code: 'GR', name: 'Greece', dial: '+30', flag: '🇬🇷', format: '###-###-####' },
    { code: 'TR', name: 'Turkey', dial: '+90', flag: '🇹🇷', format: '###-###-####' },
    { code: 'RU', name: 'Russia', dial: '+7', flag: '🇷🇺', format: '###-###-##-##' },
    { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷', format: '##-#####-####' },
    { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽', format: '##-####-####' },
    { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷', format: '##-####-####' },
    { code: 'CL', name: 'Chile', dial: '+56', flag: '🇨🇱', format: '##-####-####' },
    { code: 'CO', name: 'Colombia', dial: '+57', flag: '🇨🇴', format: '###-###-####' },
];

// --- Helpers ---
function getCountryByDial(dial: string): Country | undefined {
    return countries.find(c => c.dial === dial);
}

function getCountryByCode(code: string): Country | undefined {
    return countries.find(c => c.code === code);
}

function getDialFromNumber(value: string): string | null {
    // Try to match one of the known dial codes at the start of the number
    // Sort by length desc so we match longer codes first (e.g. +886 before +86)
    const sorted = [...countries].sort((a, b) => b.dial.length - a.dial.length);
    for (const c of sorted) {
        if (value.startsWith(c.dial)) return c.dial;
    }
    return null;
}

function stripNonDigits(v: string): string {
    return v.replace(/\D/g, '');
}

function extractLocalNumber(value: string, dial: string): string {
    // Remove dial code from the full number
    if (value.startsWith(dial)) {
        return value.slice(dial.length);
    }
    return value;
}

// --- Props ---
interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    defaultCountry?: string; // ISO code, e.g. "MY"
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
}

export default function PhoneInput({
    value,
    onChange,
    defaultCountry = 'MY',
    placeholder = 'e.g. 12-345-6789',
    className = '',
    disabled = false,
    required = false,
    label,
}: PhoneInputProps) {
    // Detect initial country from existing value
    const initialDial = getDialFromNumber(value);
    const initialCountry = initialDial
        ? getCountryByDial(initialDial)
        : getCountryByCode(defaultCountry);

    const [selectedCountry, setSelectedCountry] = useState<Country>(
        initialCountry || countries.find(c => c.code === defaultCountry)!
    );
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Local number portion (without dial code)
    const localNumber = extractLocalNumber(value, selectedCountry.dial);

    // Filter countries based on search
    const filteredCountries = useMemo(() => {
        if (!search) return countries;
        const q = search.toLowerCase();
        return countries.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.dial.includes(q) ||
            c.code.toLowerCase().includes(q)
        );
    }, [search]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
        setIsOpen(false);
        setSearch('');

        // Reconstruct full number with new dial code + existing local digits
        const localDigits = stripNonDigits(localNumber);
        if (localDigits) {
            onChange(`${country.dial}${localDigits}`);
        } else {
            onChange(country.dial); // just the dial code
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;

        // Detect if user manually changed dial code by typing
        const dialFromRaw = getDialFromNumber(raw);
        if (dialFromRaw && dialFromRaw !== selectedCountry.dial) {
            const country = getCountryByDial(dialFromRaw);
            if (country) {
                setSelectedCountry(country);
            }
        }

        // Strip non-digit characters
        const cleaned = stripNonDigits(raw);

        // Prepend the dial code to form the full number
        onChange(`${selectedCountry.dial}${cleaned}`);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <div className="relative flex items-center w-full min-w-0">
                {/* Country Selector Button */}
                <div ref={dropdownRef} className="relative shrink-0">
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border-none rounded-l-2xl py-4 pl-3 pr-2 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-900/20 transition-all h-full shrink-0"
                    >
                        <span className="text-base leading-none">{selectedCountry.flag}</span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{selectedCountry.dial}</span>
                        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {isOpen && (
                        <div className="absolute top-full left-0 mt-1 w-[280px] max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                            {/* Search */}
                            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search country..."
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-50 dark:focus:ring-orange-900/20 transition-all"
                                    />
                                </div>
                            </div>
                            {/* Country List */}
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {filteredCountries.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-slate-400">No countries found.</div>
                                ) : filteredCountries.map(country => {
                                    const isSelected = country.code === selectedCountry.code;
                                    return (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => handleCountrySelect(country)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isSelected
                                                ? 'bg-orange-50 dark:bg-orange-900/20 text-slate-900 dark:text-white'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                }`}
                                        >
                                            <span className="text-lg leading-none shrink-0">{country.flag}</span>
                                            <span className="font-medium flex-1 text-left">{country.name}</span>
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{country.dial}</span>
                                            {isSelected && (
                                                <Check className="h-4 w-4 text-[#F26C22] shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Phone Number Input */}
                <input
                    type="tel"
                    required={required}
                    disabled={disabled}
                    value={localNumber}
                    onChange={handlePhoneChange}
                    placeholder={placeholder}
                    className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800 border-none rounded-r-2xl py-4 px-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-900/20 transition-all"
                />
            </div>
        </div>
    );
}