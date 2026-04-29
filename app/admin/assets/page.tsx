'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import AdminFilterBar, { FilterState } from '@/components/admin/AdminFilterBar';
import { useAuth } from '@/context/AuthContext';

export default function AssetManagementPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'inventory' | 'maintenance'>('inventory');
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterState>({ search: '', status: '', gender: '', roomType: '', startDate: '', endDate: '' });

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/assets');
            const data = await res.json();
            if (data.assets) setAssets(data.assets);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            const matchesSearch = !filters.search ||
                asset.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                asset.id.toLowerCase().includes(filters.search.toLowerCase()) ||
                (asset.location_id && asset.location_id.toString().toLowerCase().includes(filters.search.toLowerCase()));
            const matchesStatus = !filters.status || asset.status === filters.status;

            return matchesSearch && matchesStatus;
        });
    }, [assets, filters]);

    if (!user || user.role !== 'admin') return <div className="p-10 text-center">Access Denied. Admins only.</div>;

    const handleCreateAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        await fetch('/api/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create_asset',
                name: formData.get('name'),
                type: formData.get('type'),
                locationId: formData.get('locationId'),
                value: formData.get('value')
            })
        });
        form.reset();
        fetchAssets();
    };

    const handleReportIssue = async (id: string) => {
        if (!confirm('Mark this asset as Damaged?')) return;
        await fetch('/api/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_status',
                id,
                status: 'Damaged'
            })
        });
        fetchAssets();
    };

    const handleRepair = async (id: string) => {
        const cost = prompt('Enter repair cost (RM):', '0');
        if (cost === null) return;

        await fetch('/api/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'log_maintenance',
                assetId: id,
                maintenanceAction: 'Repair',
                description: 'Routine repair',
                cost: parseFloat(cost),
                performedBy: 'Admin',
                newStatus: 'Good' // Auto-fix
            })
        });
        fetchAssets();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Facility & Asset Management</h1>
                        <p className="text-slate-500">Track inventory and maintenance.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            Inventory
                        </button>
                        <button
                            onClick={() => setActiveTab('maintenance')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'maintenance' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            Maintenance Queue
                            {assets.filter(a => a.status === 'Damaged').length > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {assets.filter(a => a.status === 'Damaged').length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {activeTab === 'inventory' && (
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* New Asset Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 sticky top-24">
                                <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Add New Asset</h2>
                                <form onSubmit={handleCreateAsset} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Asset Name</label>
                                        <input name="name" required className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="e.g., Study Desk" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                        <select name="type" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-700">
                                            <option value="Furniture">Furniture</option>
                                            <option value="Appliance">Appliance</option>
                                            <option value="Fixture">Fixture</option>
                                            <option value="Electronics">Electronics</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location (Room ID)</label>
                                        <input name="locationId" required className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="e.g., 101" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Value (RM)</label>
                                        <input name="value" type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="0.00" />
                                    </div>
                                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700">
                                        Add to Inventory
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* List */}
                        <div className="lg:col-span-2">
                            <AdminFilterBar
                                onFilterChange={setFilters}
                                statusOptions={['Good', 'Damaged', 'Maintenance']}
                                showGender={false}
                                showRoomType={false}
                                showDateRange={false}
                            />
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                        <tr>
                                            <th className="px-6 py-3">ID</th>
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Type</th>
                                            <th className="px-6 py-3">Location</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredAssets.map(asset => (
                                            <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-6 py-3 font-mono text-xs">{asset.id}</td>
                                                <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{asset.name}</td>
                                                <td className="px-6 py-3">{asset.type}</td>
                                                <td className="px-6 py-3">{asset.location_id || 'Storage'}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${asset.status === 'Good' ? 'bg-green-100 text-green-700' :
                                                        asset.status === 'Damaged' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {asset.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    {asset.status === 'Good' && (
                                                        <button onClick={() => handleReportIssue(asset.id)} className="text-red-600 hover:underline text-xs">
                                                            Report Issue
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'maintenance' && (
                    <div className="grid gap-6">
                        {assets.filter(a => a.status === 'Damaged' || a.status === 'Maintenance').length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                                <p className="text-slate-500">No assets currently require maintenance.</p>
                            </div>
                        ) : (
                            assets.filter(a => a.status === 'Damaged' || a.status === 'Maintenance').map(asset => (
                                <div key={asset.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center dark:bg-slate-900 dark:border-slate-800">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{asset.name}</h3>
                                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{asset.status}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">Location: Room {asset.location_id} • ID: {asset.id}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRepair(asset.id)}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
                                    >
                                        Log Repair
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
