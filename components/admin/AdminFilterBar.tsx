'use client';

import { useState, useEffect } from 'react';

interface FilterBarProps {
    onFilterChange: (filters: FilterState) => void;
    statusOptions?: string[];
    showGender?: boolean;
    showRoomType?: boolean;
    showDateRange?: boolean;
    placeholder?: string;
}

export interface FilterState {
    search: string;
    status: string;
    gender: string;
    roomType: string;
    startDate: string;
    endDate: string;
}

export default function AdminFilterBar({
    onFilterChange,
    statusOptions = [],
    showGender = true,
    showRoomType = true,
    showDateRange = true,
    placeholder = "Search name or ID..."
}: FilterBarProps) {
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        status: '',
        gender: '',
        roomType: '',
        startDate: '',
        endDate: ''
    });

    const handleChange = (name: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 mb-6 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Search */}
                <div className="xl:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Search</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={filters.search}
                            onChange={(e) => handleChange('search', e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F26C22] dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all"
                        />
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F26C22] dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all"
                    >
                        <option value="">All Statuses</option>
                        {statusOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                {/* Gender */}
                {showGender && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Gender</label>
                        <select
                            value={filters.gender}
                            onChange={(e) => handleChange('gender', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F26C22] dark:bg-slate-800 dark:border-slate-700"
                        >
                            <option value="">Any Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                )}

                {/* Room Type */}
                {showRoomType && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Room Type</label>
                        <select
                            value={filters.roomType}
                            onChange={(e) => handleChange('roomType', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F26C22] dark:bg-slate-800 dark:border-slate-700"
                        >
                            <option value="">Any Type</option>
                            <option value="Single">Single</option>
                            <option value="Shared (2)">Shared (2)</option>
                            <option value="Shared (4)">Shared (4)</option>
                        </select>
                    </div>
                )}

                {/* Date Range */}
                {showDateRange && (
                    <div className="xl:col-span-2 grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">From</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleChange('startDate', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F26C22] dark:bg-slate-800 dark:border-slate-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">To</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleChange('endDate', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F26C22] dark:bg-slate-800 dark:border-slate-700"
                            />
                        </div>
                    </div>
                )}
            </div>

            {(filters.search || filters.status || filters.gender || filters.roomType || filters.startDate || filters.endDate) && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => {
                            const reset = { search: '', status: '', gender: '', roomType: '', startDate: '', endDate: '' };
                            setFilters(reset);
                            onFilterChange(reset);
                        }}
                        className="text-xs text-[#F26C22] font-bold hover:underline"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );
}
