import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Trends({ data }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [trendingData, setTrendingData] = useState([]);
  const [error, setError] = useState(null);

  // Fetch real trending data from ML service
  useEffect(() => {
    fetchTrendingData();
  }, [selectedTimeframe]);

  const fetchTrendingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8001/trending-analysis');
      if (!response.ok) {
        throw new Error('Failed to fetch trending data');
      }
      
      const result = await response.json();
      
      // Transform the data for display
      const transformedData = result.trending_dishes.map((dish, index) => ({
        dish: dish.dish,
        count: dish.mentions,
        source: 'ml_analysis',
        season: getCurrentSeason(),
        growth: `${dish.sentiment_score > 0 ? '+' : ''}${Math.round(dish.sentiment_score * 100)}%`,
        trend_status: dish.trend_status
      }));
      
      setTrendingData(transformedData);
    } catch (error) {
      console.error('Error fetching trending data:', error);
      setError(error.message);
      // Fallback to empty array
      setTrendingData([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trending data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Trends</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button 
              onClick={fetchTrendingData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Seasonal trends
  const seasonalTrends = {
    spring: trendingData.filter(t => t.season === 'spring'),
    summer: trendingData.filter(t => t.season === 'summer'),
    winter: trendingData.filter(t => t.season === 'winter'),
    autumn: trendingData.filter(t => t.season === 'autumn')
  };

  // Chart data for trending dishes
  const trendChartData = {
    labels: trendingData.slice(0, 8).map(t => t.dish),
    datasets: [
      {
        label: 'Mentions',
        data: trendingData.slice(0, 8).map(t => t.count),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Monthly trend simulation
  const monthlyTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Trending Score',
        data: [45, 52, 48, 61, 55, 67, 72, 68, 58, 63, 59, 54],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const getTrendIcon = (growth) => {
    if (!growth) return '📊';
    const growthNum = parseInt(growth.replace('%', '').replace('+', ''));
    if (growthNum > 25) return '🚀';
    if (growthNum > 15) return '📈';
    return '📊';
  };

  const getTrendColor = (growth) => {
    if (!growth) return 'text-gray-600';
    const growthNum = parseInt(growth.replace('%', '').replace('+', ''));
    if (growthNum > 25) return 'text-green-600';
    if (growthNum > 15) return 'text-blue-600';
    return 'text-yellow-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Trending Dishes & Market Analysis</h2>
            <p className="text-gray-600 mt-1">Discover what's trending and identify new opportunities</p>
          </div>
          <div className="flex space-x-2">
            {['weekly', 'monthly', 'seasonal'].map(timeframe => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Top Trending</p>
              <p className="text-2xl font-semibold text-gray-900">{trendingData[0]?.dish || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Mentions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {trendingData.reduce((sum, t) => sum + t.count, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Fastest Growing</p>
              <p className="text-2xl font-semibold text-gray-900">
                {trendingData.find(t => t.growth && t.growth === Math.max(...trendingData.filter(item => item.growth).map(item => parseInt(item.growth.replace('%', '').replace('+', '')))))?.dish || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Opportunities</p>
              <p className="text-2xl font-semibold text-gray-900">{trendingData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Dishes Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Trending Dishes</h3>
          <Bar data={trendChartData} options={chartOptions} />
        </div>

        {/* Monthly Trend Line */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Score Over Time</h3>
          <Line data={monthlyTrendData} options={chartOptions} />
        </div>
      </div>

      {/* Trending Dishes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Trending Dishes</h3>
          <div className="space-y-4">
            {trendingData.slice(0, 6).map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">{trend.dish}</div>
                    <div className="text-sm text-gray-500">
                      {trend.count} mentions • {trend.source}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getTrendColor(trend.growth)}`}>
                    {getTrendIcon(trend.growth)} {trend.growth || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{trend.season}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal Opportunities */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Opportunities</h3>
          <div className="space-y-4">
            {Object.entries(seasonalTrends).map(([season, items]) => (
              <div key={season} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">{season}</h4>
                  <span className="text-sm text-gray-500">{items.length} items</span>
                </div>
                <div className="space-y-2">
                  {items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{item.dish}</span>
                      <span className="text-gray-500">{item.count} mentions</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend-Based Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add to Menu */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h4 className="font-medium text-green-900">Add to Menu</h4>
            </div>
            <div className="space-y-2">
              {trendingData.slice(0, 3).map((trend, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium text-green-800">{trend.dish}</div>
                  <div className="text-green-600">Expected popularity: {trend.count} mentions</div>
                </div>
              ))}
            </div>
          </div>

          {/* Promote Existing */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h4 className="font-medium text-blue-900">Promote Existing</h4>
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <div className="font-medium text-blue-800">Coffee Variations</div>
                <div className="text-blue-600">Align with matcha/specialty coffee trend</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-blue-800">Healthy Options</div>
                <div className="text-blue-600">Capitalize on wellness trend</div>
              </div>
            </div>
          </div>

          {/* Market Timing */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-purple-900">Optimal Timing</h4>
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <div className="font-medium text-purple-800">Spring Launch</div>
                <div className="text-purple-600">Fresh, light menu items</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-purple-800">Summer Focus</div>
                <div className="text-purple-600">Cold beverages & healthy bowls</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Trends;