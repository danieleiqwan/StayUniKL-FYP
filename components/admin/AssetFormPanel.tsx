'use client';
import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

const inputCls = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:border-[#F26C22] focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/20 outline-none transition-all placeholder:text-slate-400";
const labelCls = "block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5";

export default function AssetFormPanel({ onSubmit }: { onSubmit: (data: any) => Promise<void> }) {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', type: 'Furniture', locationId: '', purchaseDate: '', value: '', quantity: '1', condition: 'Good', assignedTo: '', notes: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        await onSubmit(form);
        setForm({ name: '', type: 'Furniture', locationId: '', purchaseDate: '', value: '', quantity: '1', condition: 'Good', assignedTo: '', notes: '' });
        setSubmitting(false);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:sticky lg:top-24">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Add New Asset</h2>
                <p className="text-xs text-slate-400 mt-0.5">Register a new facility or asset to inventory.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                    <label className={labelCls}>Asset Name *</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputCls} placeholder="e.g., Study Desk" />
                </div>
                <div>
                    <label className={labelCls}>Asset Type *</label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={inputCls}>
                        <option value="Furniture">Furniture</option>
                        <option value="Appliance">Appliance</option>
                        <option value="Fixture">Fixture</option>
                        <option value="Electronics">Electronics</option>
                    </select>
                </div>
                <div>
                    <label className={labelCls}>Location (Room / Block / Area) *</label>
                    <input required value={form.locationId} onChange={e => setForm({...form, locationId: e.target.value})} className={inputCls} placeholder="e.g., Block A - Room 101" />
                </div>
                <div>
                    <label className={labelCls}>Purchase Date</label>
                    <input type="date" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls}>Value (RM)</label>
                        <input type="number" step="0.01" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className={inputCls} placeholder="e.g. 150.00" />
                    </div>
                    <div>
                        <label className={labelCls}>Quantity</label>
                        <input type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className={inputCls} placeholder="e.g. 1" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls}>Condition</label>
                        <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} className={inputCls}>
                            <option>Good</option>
                            <option>Maintenance</option>
                            <option>Damaged</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Assigned To <span className="text-slate-300 font-normal">(Optional)</span></label>
                        <input value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} className={inputCls} placeholder="Select room / area" />
                    </div>
                </div>
                <div>
                    <label className={labelCls}>Notes <span className="text-slate-300 font-normal">(Optional)</span></label>
                    <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className={`${inputCls} resize-none`} placeholder="Additional notes about this asset..." />
                </div>
                <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-[#F26C22] hover:bg-[#F26C22]/90 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {submitting ? 'Adding...' : 'Add to Inventory'}
                </button>
            </form>
        </div>
    );
}
