import React, { useState, useEffect } from 'react';
import Chart from './Chart';

function Trends({ data }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');
  const [trendingData, setTrendingData] = useState([]);

  useEffect(() => {
    // Use real data from props instead of fetching
    if (data && data.trends) {
      setTrendingData(data.trends);
    } else {
      // Fallback trending data
      setTrendingData([
        { dish: 'Coffee', count: 45, source: 'reviews' },
        { dish: 'Avocado Toast', count: 32, source: 'reviews' },
        { dish: 'Pizza', count: 28, source: 'reviews' },
        { dish: 'Pasta', count: 22, source: 'reviews' },
        { dish: 'Hot Chocolate', count: 18, source: 'reviews' }
      ]);
    }
  }, [data, selectedTimeframe]);

  // Convert trending data to chart format with shorter names
  const trendChartData = trendingData.map(item => ({
    x: item.dish.length > 8 ? item.dish.substring(0, 8) + '...' : item.dish,
    y: item.count,
    fullName: item.dish
  }));

  const mockTrendData = [
    { dish: 'Ube Mochi Waffles', count: 620, source: 'Social Pulse', season: 'winter', growth: '+180%', trend_status: 'Rising', description: 'Vibrant aesthetics meeting nostalgic comfort flavors.' },
    { dish: 'Koji-Aged Steak', count: 590, source: 'Chef Intel', season: 'winter', growth: '+90%', trend_status: 'Stable', description: 'Shift towards traditional fermentation techniques in fine dining.' },
    { dish: 'Botanical Cocktails', count: 420, source: 'Bar Logic', season: 'winter', growth: '+42%', trend_status: 'Hot', description: 'Non-alcoholic spirits infused with floral notes like lavender and elderflower.' },
    { dish: 'Regenerative Grains', count: 280, source: 'Eco Sensor', season: 'winter', growth: '+28%', trend_status: 'Rising', description: 'Ancient grains appearing in luxury menus as climate-positive options.' }
  ];

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-headline">Market Intelligence</span>
          <h1 className="text-4xl font-extrabold font-headline tracking-tight text-[#2b3437] mt-1">Culinary Trends Analysis</h1>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Trend Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-headline text-xl font-bold text-[#2b3437]">Trending Dishes</h3>
              <p className="text-sm text-slate-400">Most mentioned dishes in customer reviews</p>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <Chart
              data={trendChartData}
              type="bar"
              height={256}
              yLabel="Mentions"
              xLabel="Dishes"
              colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
              showGrid={true}
            />
          </div>
        </div>

        {/* Ranking Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex-1">
            <h3 className="font-headline text-lg font-bold text-[#2b3437] mb-6">Ranking Leaders</h3>
            <div className="space-y-4">
              {trendingData.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black font-headline text-slate-100 group-hover:text-primary/20 transition-colors">0{i+1}</span>
                    <div>
                      <p className="text-sm font-bold text-[#2b3437]">{item.dish}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{item.source}</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-primary">{item.count}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-colors font-headline">View Full Leaderboard</button>
          </div>
        </div>

        {/* Trend Cards */}
        {mockTrendData.slice(0, 4).map((item, i) => (
          <div key={i} className="col-span-12 md:col-span-6 lg:col-span-3">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-lg transition-all">
              <div className="h-32 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-4 left-6">
                  <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Growth Vector</span>
                  <h4 className="text-white font-bold text-xl mt-2 font-headline">{item.dish}</h4>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-[9px] uppercase font-black text-slate-300 tracking-[0.2em] font-headline mb-1">{item.source}</div>
                    <div className="text-sm text-slate-600">{item.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black font-headline text-primary">{item.growth}</div>
                    <div className="text-[9px] uppercase font-black text-slate-300 tracking-[0.2em] font-headline">Growth Index</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Trends;