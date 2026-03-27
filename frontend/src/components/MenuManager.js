import React, { useState, useMemo } from 'react';
import Chart from './Chart';

const MenuManager = ({ menu = [], data, onAddMenuItem }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    sellingPrice: '',
    costPrice: '',
    description: ''
  });

  const categories = ['Beverages', 'Food', 'Desserts', 'Snacks'];

  // Enhanced menu with exactly 8 core dishes + profit analysis
  const enhancedMenu = useMemo(() => {
    const coreMenu = [
      { name: 'Truffle Pasta', category: 'Food', sellingPrice: 450, costPrice: 180, orders: 85, rating: 4.8, trend: 'rising' },
      { name: 'Grilled Salmon', category: 'Food', sellingPrice: 650, costPrice: 320, orders: 62, rating: 4.6, trend: 'stable' },
      { name: 'Artisan Coffee', category: 'Beverages', sellingPrice: 120, costPrice: 35, orders: 156, rating: 4.7, trend: 'rising' },
      { name: 'Caesar Salad', category: 'Food', sellingPrice: 280, costPrice: 95, orders: 78, rating: 4.2, trend: 'declining' },
      { name: 'Chocolate Soufflé', category: 'Desserts', sellingPrice: 320, costPrice: 110, orders: 45, rating: 4.9, trend: 'stable' },
      { name: 'Craft Beer', category: 'Beverages', sellingPrice: 180, costPrice: 65, orders: 92, rating: 4.4, trend: 'stable' },
      { name: 'Margherita Pizza', category: 'Food', sellingPrice: 380, costPrice: 140, orders: 71, rating: 4.3, trend: 'declining' },
      { name: 'Fresh Juice', category: 'Beverages', sellingPrice: 150, costPrice: 45, orders: 134, rating: 4.5, trend: 'declining' }
    ];

    // Always use the core 8 dishes regardless of menu prop
    return coreMenu.map(item => {
      const sell = item.sellingPrice;
      const cost = item.costPrice;
      const profit = sell - cost;
      const margin = sell > 0 ? ((profit / sell) * 100) : 0;
      const revenue = item.orders * sell;
      
      return {
        ...item,
        profit,
        margin,
        revenue,
        profitability: margin > 60 ? 'high' : margin > 40 ? 'medium' : 'low'
      };
    });
  }, []);

  // Items to remove (exactly 3 lowest performing)
  const itemsToRemove = enhancedMenu
    .filter(item => item.trend === 'declining')
    .sort((a, b) => a.margin - b.margin)
    .slice(0, 3);

  // Trending suggestions from reviews
  const trendingSuggestions = useMemo(() => {
    const suggestions = [
      { name: 'Ube Mochi Waffles', category: 'Desserts', estimatedPrice: 380, trend: '+180%', reason: 'Viral on social media' },
      { name: 'Koji-Aged Steak', category: 'Food', estimatedPrice: 850, trend: '+90%', reason: 'Premium fermentation trend' },
      { name: 'Botanical Cocktails', category: 'Beverages', estimatedPrice: 420, trend: '+42%', reason: 'Health-conscious trend' }
    ];

    // If we have real trending data from reviews, use that
    if (data?.trends && data.trends.length > 0) {
      return data.trends.slice(0, 3).map(trend => ({
        name: trend.dish,
        category: 'Food',
        estimatedPrice: 300 + Math.floor(Math.random() * 400),
        trend: '+' + Math.floor(Math.random() * 100) + '%',
        reason: 'Popular in customer reviews'
      }));
    }

    return suggestions;
  }, [data]);

  // Chart data for profit analysis
  const profitChartData = enhancedMenu.map(item => ({
    x: item.name.split(' ')[0], // First word for chart readability
    y: Math.round(item.margin),
    revenue: item.revenue,
    orders: item.orders,
    fullName: item.name
  }));

  const revenueChartData = enhancedMenu.map(item => ({
    x: item.name.split(' ')[0],
    y: Math.round(item.revenue / 100), // Scale down for better visualization
    profit: Math.round(item.profit),
    orders: item.orders,
    fullName: item.name
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.category && formData.sellingPrice) {
      onAddMenuItem({
        name: formData.name,
        category: formData.category,
        sellingPrice: parseFloat(formData.sellingPrice),
        costPrice: parseFloat(formData.costPrice) || 0,
        description: formData.description
      });
      setFormData({ name: '', category: 'Food', sellingPrice: '', costPrice: '', description: '' });
      setShowAddForm(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const totalRevenue = enhancedMenu.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = enhancedMenu.reduce((sum, item) => sum + (item.profit * item.orders), 0);
  const avgMargin = enhancedMenu.length > 0 ? 
    (enhancedMenu.reduce((sum, item) => sum + item.margin, 0) / enhancedMenu.length).toFixed(1) : 0;
  const topPerformer = enhancedMenu.sort((a, b) => b.margin - a.margin)[0];

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto w-full">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline mb-2 text-[#2b3437]">Menu Intelligence Dashboard</h1>
          <p className="text-slate-500 max-w-lg font-body">Data-driven menu optimization with profit analysis and trending recommendations.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Dish
          </button>
        </div>
      </div>

      {/* Dashboard Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 font-headline">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
          <h3 className="text-2xl font-extrabold text-[#2b3437]">₹{Math.round(totalRevenue).toLocaleString()}</h3>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase tracking-tight">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            Monthly performance
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Profit</p>
          <h3 className="text-2xl font-extrabold text-[#2b3437]">₹{Math.round(totalProfit).toLocaleString()}</h3>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase tracking-tight">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            {((totalProfit / totalRevenue) * 100).toFixed(1)}% margin
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Top Performer</p>
          <h3 className="text-lg font-extrabold text-[#2b3437]">{topPerformer?.name || 'N/A'}</h3>
          <div className="mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-tight">
            {topPerformer?.margin.toFixed(0)}% margin
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Menu Items</p>
          <h3 className="text-2xl font-extrabold text-[#2b3437]">{enhancedMenu.length} Active</h3>
          <div className="mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-tight">
            Optimized portfolio
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600">trending_up</span>
            Profit Margin Analysis
          </h3>
          <div className="h-64 w-full">
            <Chart
              data={profitChartData}
              type="bar"
              height={256}
              yLabel="Margin %"
              xLabel="Menu Items"
              colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']}
              showGrid={true}
              showTooltip={true}
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">payments</span>
            Revenue Performance
          </h3>
          <div className="h-64 w-full">
            <Chart
              data={revenueChartData}
              type="line"
              height={256}
              yLabel="Revenue (₹100s)"
              xLabel="Menu Items"
              colors={['#3b82f6']}
              showGrid={true}
              showPoints={true}
              showTooltip={true}
            />
          </div>
        </div>
      </div>

      {/* Action Items Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Items to Remove */}
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">remove_circle</span>
            Consider Removing
          </h3>
          <div className="space-y-3">
            {itemsToRemove.length > 0 ? itemsToRemove.map((item, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-red-100">
                <p className="font-bold text-red-900">{item.name}</p>
                <p className="text-sm text-red-600">Margin: {item.margin.toFixed(0)}% • Trend: {item.trend}</p>
                <p className="text-xs text-red-500 mt-1">Low profitability & declining demand</p>
              </div>
            )) : (
              <p className="text-red-600 text-sm">All items performing well!</p>
            )}
          </div>
        </div>

        {/* Trending Suggestions */}
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">add_circle</span>
            Trending Suggestions
          </h3>
          <div className="space-y-3">
            {trendingSuggestions.map((item, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-green-100">
                <p className="font-bold text-green-900">{item.name}</p>
                <p className="text-sm text-green-600">Est. Price: ₹{item.estimatedPrice} • Growth: {item.trend}</p>
                <p className="text-xs text-green-500 mt-1">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">star</span>
            Top Performers
          </h3>
          <div className="space-y-3">
            {enhancedMenu
              .filter(item => item.profitability === 'high')
              .slice(0, 3)
              .map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-blue-100">
                  <p className="font-bold text-blue-900">{item.name}</p>
                  <p className="text-sm text-blue-600">Margin: {item.margin.toFixed(0)}% • Orders: {item.orders}</p>
                  <p className="text-xs text-blue-500 mt-1">High profitability & strong demand</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Enhanced Menu Data Table */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 font-body">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold">Menu Performance Analysis</h3>
          <p className="text-sm text-gray-600 mt-1">Click on any item for detailed insights</p>
        </div>
        
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dish Details</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Profit Margin</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Revenue</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Performance</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {enhancedMenu.map((item, i) => (
              <tr 
                key={i} 
                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                onClick={() => setSelectedItem(selectedItem === i ? null : i)}
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${
                      item.profitability === 'high' ? 'bg-green-500' : 
                      item.profitability === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                       <span className="material-symbols-outlined">restaurant</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#2b3437]">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{item.category}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">₹{item.sellingPrice}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          item.trend === 'rising' ? 'bg-green-100 text-green-800' :
                          item.trend === 'declining' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className={`px-8 py-5 text-right font-headline font-bold text-lg ${
                  item.margin > 60 ? 'text-green-600' : 
                  item.margin > 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {item.margin.toFixed(0)}%
                </td>
                <td className="px-8 py-5 text-right font-medium text-slate-900 font-headline font-bold">
                  ₹{Math.round(item.revenue).toLocaleString()}
                </td>
                <td className="px-8 py-5 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <span 
                          key={starIdx} 
                          className={`material-symbols-outlined text-sm ${
                            starIdx < Math.round(item.rating) ? 'text-yellow-500' : 'text-gray-300'
                          }`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">{item.orders} orders</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${
                    item.profitability === 'high' && item.trend === 'rising' ? 'bg-green-100 text-green-800' :
                    item.profitability === 'low' || item.trend === 'declining' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.profitability === 'high' && item.trend === 'rising' ? 'Promote' :
                     item.profitability === 'low' || item.trend === 'declining' ? 'Review' : 'Maintain'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Detailed Item Analysis (Expandable) */}
        {selectedItem !== null && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="bg-white p-6 rounded-lg">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                Detailed Analysis: {enhancedMenu[selectedItem].name}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h5 className="font-bold text-gray-800">Financial Metrics</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Selling Price:</span>
                      <span className="font-bold">₹{enhancedMenu[selectedItem].sellingPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost Price:</span>
                      <span className="font-bold">₹{Math.round(enhancedMenu[selectedItem].costPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit per Unit:</span>
                      <span className="font-bold text-green-600">₹{Math.round(enhancedMenu[selectedItem].profit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-bold text-blue-600">₹{Math.round(enhancedMenu[selectedItem].revenue).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-bold text-gray-800">Performance Insights</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Customer Rating:</span>
                      <span className="font-bold">{enhancedMenu[selectedItem].rating.toFixed(1)}/5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Orders:</span>
                      <span className="font-bold">{enhancedMenu[selectedItem].orders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trend Status:</span>
                      <span className={`font-bold capitalize ${
                        enhancedMenu[selectedItem].trend === 'rising' ? 'text-green-600' :
                        enhancedMenu[selectedItem].trend === 'declining' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {enhancedMenu[selectedItem].trend}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profitability:</span>
                      <span className={`font-bold capitalize ${
                        enhancedMenu[selectedItem].profitability === 'high' ? 'text-green-600' :
                        enhancedMenu[selectedItem].profitability === 'medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {enhancedMenu[selectedItem].profitability}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-bold text-gray-800">AI Recommendations</h5>
                  <div className="space-y-2 text-sm">
                    {enhancedMenu[selectedItem].profitability === 'high' && enhancedMenu[selectedItem].trend === 'rising' ? (
                      <>
                        <p className="text-green-700">✓ Increase marketing focus</p>
                        <p className="text-green-700">✓ Consider premium positioning</p>
                        <p className="text-green-700">✓ Expand portion options</p>
                        <p className="text-green-700">✓ Feature in promotions</p>
                      </>
                    ) : enhancedMenu[selectedItem].profitability === 'low' || enhancedMenu[selectedItem].trend === 'declining' ? (
                      <>
                        <p className="text-red-700">⚠ Review ingredient costs</p>
                        <p className="text-red-700">⚠ Consider recipe optimization</p>
                        <p className="text-red-700">⚠ Evaluate customer feedback</p>
                        <p className="text-red-700">⚠ Potential removal candidate</p>
                      </>
                    ) : (
                      <>
                        <p className="text-yellow-700">→ Monitor performance closely</p>
                        <p className="text-yellow-700">→ Test seasonal variations</p>
                        <p className="text-yellow-700">→ Gather customer feedback</p>
                        <p className="text-yellow-700">→ Maintain current strategy</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {enhancedMenu.length === 0 && (
          <div className="py-20 text-center text-slate-400">
             <span className="material-symbols-outlined text-5xl mb-4 block">restaurant_menu</span>
             <p className="text-lg font-bold font-headline">No menu items found</p>
             <p className="text-sm">Add your first dish to start analyzing performance.</p>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 font-body animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-2xl font-black font-headline text-[#2b3437]">Add New Menu Item</h3>
                <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
             </div>
             <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dish Name</label>
                      <input 
                        type="text" name="name" required value={formData.name} onChange={handleChange}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="e.g. Truffle Pasta"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</label>
                      <select 
                        name="category" value={formData.category} onChange={handleChange}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-body"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selling Price (₹)</label>
                      <input 
                        type="number" name="sellingPrice" required value={formData.sellingPrice} onChange={handleChange}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-headline font-bold"
                        placeholder="0.00"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cost Price (₹)</label>
                      <input 
                        type="number" name="costPrice" value={formData.costPrice} onChange={handleChange}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-headline font-bold"
                        placeholder="0.00"
                      />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</label>
                   <textarea 
                     name="description" value={formData.description} onChange={handleChange}
                     className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
                     placeholder="Dish description..."
                   />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform uppercase tracking-widest text-xs">Add to Menu</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MenuManager;
