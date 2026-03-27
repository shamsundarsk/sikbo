import React, { useState } from 'react';
import Chart from './Chart';

function CustomerFlow({ data }) {
  const { customerFlow } = data;
  const [showAddForm, setShowAddForm] = useState(false);
  const [customerEntry, setCustomerEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    customers: '',
    peakHour: ''
  });

  const mockDailyData = [
    { date: '2024-03-19', total_customers: 85, peak_hour: 13, day: 'Tuesday' },
    { date: '2024-03-20', total_customers: 92, peak_hour: 19, day: 'Wednesday' },
    { date: '2024-03-21', total_customers: 78, peak_hour: 12, day: 'Thursday' },
    { date: '2024-03-22', total_customers: 105, peak_hour: 20, day: 'Friday' },
    { date: '2024-03-23', total_customers: 120, peak_hour: 19, day: 'Saturday' },
    { date: '2024-03-24', total_customers: 95, peak_hour: 13, day: 'Sunday' },
    { date: '2024-03-25', total_customers: 88, peak_hour: 12, day: 'Monday' }
  ];

  const dailyData = customerFlow?.daily_data || mockDailyData;
  const analytics = customerFlow?.analytics || {
    avg_daily_customers: 95,
    busiest_day: 'Saturday',
    total_week_customers: 663
  };

  const todayCount = dailyData[dailyData.length - 1]?.total_customers || 88;
  const peakHour = dailyData[dailyData.length - 1]?.peak_hour || 12;

  // Convert daily data to chart format
  const chartData = dailyData.map(d => ({
    x: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    y: d.total_customers,
    day: d.day
  }));

  const handleAddCustomer = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Adding customer data:', customerEntry);
    setCustomerEntry({
      date: new Date().toISOString().split('T')[0],
      customers: '',
      peakHour: ''
    });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Customer Flow Analytics</h2>
          <p className="text-on-surface-variant font-body text-slate-500">Real-time customer traffic analysis for <span className="text-primary font-bold">The French Door</span></p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Customer Data
          </button>
        </div>
      </div>

      {/* Summary Stats Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-primary">
              <span className="material-symbols-outlined font-bold">groups</span>
            </div>
            <span className="text-emerald-600 text-xs font-bold font-label bg-emerald-50 px-2 py-1 rounded-full">+12.4%</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Weekly Visitors</p>
            <h3 className="text-3xl font-black font-headline text-on-surface">{analytics.total_week_customers}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-primary">
              <span className="material-symbols-outlined">timer</span>
            </div>
            <span className="text-emerald-600 text-xs font-bold font-label bg-emerald-50 px-2 py-1 rounded-full">-4.2m</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Avg. Wait Time</p>
            <h3 className="text-3xl font-black font-headline text-on-surface">18.5m</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-primary">
              <span className="material-symbols-outlined">repeat</span>
            </div>
            <span className="text-primary text-xs font-bold font-label bg-slate-50 px-2 py-1 rounded-full">Steady</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Daily Average</p>
            <h3 className="text-3xl font-black font-headline text-on-surface">{Math.round(analytics.avg_daily_customers)}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-primary text-error">
              <span className="material-symbols-outlined">table_restaurant</span>
            </div>
            <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">Peak {peakHour}:00</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Today's Flow</p>
            <h3 className="text-3xl font-black font-headline text-on-surface">{todayCount}</h3>
          </div>
        </div>
      </div>

        {/* Primary Visualization: Proper Line Chart */}
        <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-bold font-headline">Customer Volume Distribution</h4>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs font-medium text-slate-500 font-label">This Week</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <span className="text-xs font-medium text-slate-500 font-label">Previous Week</span>
              </div>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <Chart
              data={chartData}
              type="area"
              height={320}
              yLabel="Customers"
              xLabel="Day of Week"
              colors={['#3b82f6']}
              showGrid={true}
              showPoints={true}
            />
          </div>
        </div>

      {/* Heatmap Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-xl font-bold font-headline">Service Intensity Heatmap</h4>
              <p className="text-sm text-slate-500 font-body text-slate-500">Hourly customer density per day</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Low</span>
              <div className="flex h-3 w-32 rounded-full overflow-hidden">
                <div className="flex-1 bg-slate-50"></div>
                <div className="flex-1 bg-primary/20"></div>
                <div className="flex-1 bg-primary/40"></div>
                <div className="flex-1 bg-primary/70"></div>
                <div className="flex-1 bg-primary"></div>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-900">Peak</span>
            </div>
          </div>
          <div className="space-y-3">
             {/* Heatmap header */}
            <div className="grid grid-cols-[60px_1fr] gap-2 items-center">
              <div></div>
              <div className="grid grid-cols-12 gap-1 text-[9px] uppercase font-bold text-slate-400 text-center">
                {['11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p'].map(h => <span key={h}>{h}</span>)}
              </div>
            </div>
            {/* Rows */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="grid grid-cols-[60px_1fr] gap-2 items-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">{day}</div>
                <div className="grid grid-cols-12 gap-1 h-8">
                  {Array(12).fill(0).map((_, i) => {
                    const opacity = [0.1, 0.4, 0.3, 0.05, 0.05, 0.2, 0.5, 0.8, 0.9, 0.6, 0.3, 0.1][i];
                    return <div key={i} className="rounded-sm bg-primary" style={{ opacity }}></div>
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 text-white p-8 rounded-xl shadow-lg h-fit">
            <h4 className="text-lg font-bold font-headline mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              Flow Insights
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0"></div>
                <p className="text-sm font-body text-slate-300">Peak lunch traffic on <span className="text-white font-bold">{analytics.busiest_day}</span> has increased by 14% month-over-month.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>
                <p className="text-sm font-body text-slate-300">Early dinner bottleneck identified at <span className="text-white font-bold">6:15 PM</span>. Recommend pre-service briefing.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                <p className="text-sm font-body text-slate-300">Late night turnover is high. Staffing levels could be optimized by <span className="text-white font-bold">-1 FTE</span> after 10 PM.</p>
              </li>
            </ul>
          </div>
          <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 flex-1 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-md">
              <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            </div>
            <h5 className="text-lg font-black font-headline text-on-surface mb-2">Flow Analytics</h5>
            <p className="text-xs text-slate-500 font-body mb-6">Real-time customer flow patterns and peak hour analysis based on historical data.</p>
            <div className="w-full space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Peak Hour</span>
                <span className="font-bold">{peakHour}:00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Avg Wait</span>
                <span className="font-bold">18.5m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Efficiency</span>
                <span className="font-bold text-green-600">92%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Floor Status Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h4 className="text-xl font-bold font-headline">Historical Flow Details</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Day</th>
                <th className="px-8 py-5 text-center">Total Customers</th>
                <th className="px-8 py-5 text-center">Peak Hour</th>
                <th className="px-8 py-5 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="text-sm font-body">
              {dailyData.map((day, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100 last:border-0">
                  <td className="px-8 py-5 font-bold">{new Date(day.date).toLocaleDateString()}</td>
                  <td className="px-8 py-5 text-slate-500">{day.day}</td>
                  <td className="px-8 py-5 font-black text-center">{day.total_customers}</td>
                  <td className="px-8 py-5 text-slate-500 text-center">{day.peak_hour}:00</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      day.total_customers > analytics.avg_daily_customers 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-slate-50 text-slate-500'
                    }`}>
                      {day.total_customers > analytics.avg_daily_customers ? 'High' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Data Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black font-headline text-[#2b3437]">Add Customer Data</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</label>
                <input 
                  type="date" 
                  required 
                  value={customerEntry.date} 
                  onChange={(e) => setCustomerEntry({...customerEntry, date: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Customers</label>
                <input 
                  type="number" 
                  required 
                  value={customerEntry.customers} 
                  onChange={(e) => setCustomerEntry({...customerEntry, customers: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="e.g. 95"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Peak Hour (24h format)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="23" 
                  required 
                  value={customerEntry.peakHour} 
                  onChange={(e) => setCustomerEntry({...customerEntry, peakHour: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="e.g. 19 (for 7 PM)"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform uppercase tracking-widest text-xs">Add Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default CustomerFlow;
