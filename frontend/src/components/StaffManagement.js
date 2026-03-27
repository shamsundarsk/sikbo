import React, { useState } from 'react';
import Chart from './Chart';

function StaffManagement({ data, onAddStaff }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Waiter',
    rating: 3.0
  });

  const { staff, staffAnalytics } = data;

  const mockStaff = [
    { _id: '1', name: 'John Doe', role: 'Waiter', rating: 4.2, reviewCount: 15, positiveReviews: 12, negativeReviews: 3, isActive: true },
    { _id: '2', name: 'Jane Smith', role: 'Chef', rating: 4.8, reviewCount: 22, positiveReviews: 20, negativeReviews: 2, isActive: true },
    { _id: '3', name: 'Mike Johnson', role: 'Manager', rating: 4.5, reviewCount: 18, positiveReviews: 16, negativeReviews: 2, isActive: true },
    { _id: '4', name: 'Sarah Wilson', role: 'Waitress', rating: 3.8, reviewCount: 12, positiveReviews: 8, negativeReviews: 4, isActive: true },
    { _id: '5', name: 'David Brown', role: 'Bartender', rating: 4.1, reviewCount: 10, positiveReviews: 8, negativeReviews: 2, isActive: true }
  ];

  const staffList = staff?.length > 0 ? staff : mockStaff;
  const overallRating = staffAnalytics?.overall_staff_rating || 4.1;
  const topStaff = [...staffList].sort((a, b) => b.rating - a.rating)[0];
  const lowStaff = staffList.filter(s => s.rating < 4.0);

  // Generate chart data
  const performanceChartData = staffList.map(s => ({
    x: s.name.split(' ')[0], // First name only for chart
    y: s.rating,
    role: s.role
  }));

  const efficiencyData = [
    { x: 'Mon', y: 85 },
    { x: 'Tue', y: 88 },
    { x: 'Wed', y: 82 },
    { x: 'Thu', y: 90 },
    { x: 'Fri', y: 87 },
    { x: 'Sat', y: 92 },
    { x: 'Sun', y: 89 }
  ];

  const handleAddStaff = (e) => {
    e.preventDefault();
    onAddStaff(newStaff);
    setNewStaff({ name: '', role: 'Waiter', rating: 3.0 });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <span className="text-xs font-bold text-primary tracking-[0.3em] uppercase block mb-2 font-label">Operational Intelligence</span>
          <h3 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight">Staff Dynamics & Efficiency</h3>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Staff
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6 mb-10">
        {/* Highlight Card: Top Staff */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl p-8 flex flex-col justify-between border-l-4 border-primary shadow-sm hover:shadow-md transition-all">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest font-label">Performance Peak</span>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            </div>
            <h4 className="text-xl font-bold font-headline mb-1">{topStaff?.name || 'Loading...'}</h4>
            <p className="text-slate-500 text-sm mb-6">{topStaff?.role || 'Staff Member'}</p>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-400 uppercase font-label">Service Rating</span>
                <span className="text-lg font-bold font-headline text-primary">{topStaff?.rating?.toFixed(1) || '0.0'}/5.0</span>
              </div>
              <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${(topStaff?.rating / 5) * 100}%` }}></div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">ER</div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-[10px] font-bold">JS</div>
            </div>
            <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">View Progress</button>
          </div>
        </div>

        {/* Staff Performance Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl p-8 shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-bold font-headline">Staff Performance Ratings</h4>
              <p className="text-slate-500 text-xs">Individual staff member ratings based on customer feedback</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Rating</span>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <Chart
              data={performanceChartData}
              type="bar"
              height={256}
              yLabel="Rating (1-5)"
              xLabel="Staff Members"
              colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
              showGrid={true}
            />
          </div>
        </div>

        {/* Highlight Card: Needs Improvement */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl p-8 flex flex-col justify-between shadow-sm border border-slate-100">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-widest font-label">Training Gap</span>
              <span className="material-symbols-outlined text-red-500">warning</span>
            </div>
            <h4 className="text-xl font-bold font-headline mb-1">Efficiency Review</h4>
            <p className="text-slate-500 text-sm mb-6">{lowStaff.length > 0 ? `${lowStaff.length} staff members below 4.0` : 'All staff performing above threshold'}</p>
            <div className="p-4 bg-slate-50 rounded-lg mb-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Primary Observation</p>
              <p className="text-sm font-medium">Potential bottleneck identified in appetizer prep during peak hours (7PM-9PM).</p>
            </div>
          </div>
          <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold font-headline hover:bg-black transition-colors">Generate Review Plan</button>
        </div>

        {/* Staff Table Section */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h4 className="text-lg font-bold font-headline">Roster & Performance Ledger</h4>
            <div className="flex gap-2 text-slate-400">
              <span className="material-symbols-outlined cursor-pointer hover:text-on-surface transition-colors">filter_list</span>
              <span className="material-symbols-outlined cursor-pointer hover:text-on-surface transition-colors">more_vert</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staffList.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold font-headline">{member.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase">Since 2023</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-500">{member.role}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">{(member.rating * 20).toFixed(0)}%</span>
                        <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: `${(member.rating / 5) * 100}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="inline-flex text-primary">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`material-symbols-outlined text-sm ${i < Math.round(member.rating) ? 'fill-1' : ''}`} style={{ fontVariationSettings: i < Math.round(member.rating) ? "'FILL' 1" : "" }}>star</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold font-headline mb-6">Onboard New Talent</h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-body"
                  placeholder="e.g. Julian Thorne"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Designated Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-body"
                >
                  <option value="Waiter">Waiter</option>
                  <option value="Chef">Chef</option>
                  <option value="Manager">Manager</option>
                  <option value="Bartender">Bartender</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:scale-[1.02] transition-transform uppercase tracking-widest text-xs"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default StaffManagement;
