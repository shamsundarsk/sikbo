import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = ({ data }) => {
  const { sales, trends, recommendations } = data;

  // Prepare chart data
  const chartData = {
    labels: Object.keys(sales).slice(0, 10),
    datasets: [
      {
        label: 'Revenue',
        data: Object.values(sales).slice(0, 10).map(item => item.revenue),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Profit',
        data: Object.values(sales).slice(0, 10).map(item => item.profit || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Revenue vs Profit Analysis' },
    },
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'remove': return 'bg-red-100 text-red-800';
      case 'fix': return 'bg-yellow-100 text-yellow-800';
      case 'promote': return 'bg-green-100 text-green-800';
      case 'add': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Dishes</dt>
                  <dd className="text-lg font-medium text-gray-900">{Object.keys(sales).length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{data.totalRevenue || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Profit</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{data.totalProfit || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">🔥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Trending Items</dt>
                  <dd className="text-lg font-medium text-gray-900">{trends.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Performance</h3>
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Recommendations */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">AI Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-900">{rec.dish}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(rec.action)}`}>
                    {rec.action.toUpperCase()}
                  </span>
                  {rec.trending > 0 && (
                    <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                      🔥 Trending: {rec.trending}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Score: {rec.score} | Orders: {rec.orders}
                </div>
              </div>
            ))}
            {recommendations.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recommendations yet. Add sales data to get AI insights.</p>
            )}
          </div>
        </div>
      </div>

      {/* Trending Dishes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Trending Dishes (AI Analysis)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends.slice(0, 8).map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔥</span>
                  <span className="font-medium text-gray-900">{trend.dish}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-orange-600">{trend.count} mentions</span>
                  <p className="text-xs text-gray-500">{trend.source}</p>
                </div>
              </div>
            ))}
            {trends.length === 0 && (
              <div className="md:col-span-2 text-center py-8">
                <p className="text-gray-500">Loading trending dishes...</p>
                <p className="text-xs text-gray-400 mt-1">AI is analyzing social media trends</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;