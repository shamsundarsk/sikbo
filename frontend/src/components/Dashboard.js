import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function Dashboard({ data }) {
  const { 
    sales, 
    reviews, 
    trends, 
    recommendations, 
    sentimentBreakdown,
    serviceAnalytics,
    staffAnalytics,
    customerFlow,
    totalRevenue, 
    totalProfit,
    totalReviews
  } = data;

  // Prepare chart data
  const dishNames = Object.keys(sales);
  const dishOrders = dishNames.map(dish => sales[dish].orders);
  const dishRevenue = dishNames.map(dish => sales[dish].revenue);

  const salesData = {
    labels: dishNames,
    datasets: [
      {
        label: 'Orders',
        data: dishOrders,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Overall sentiment data
  const overallSentiment = {
    positive: (sentimentBreakdown?.food?.positive || 0) + (sentimentBreakdown?.service?.positive || 0) + (sentimentBreakdown?.staff?.positive || 0),
    negative: (sentimentBreakdown?.food?.negative || 0) + (sentimentBreakdown?.service?.negative || 0) + (sentimentBreakdown?.staff?.negative || 0),
    neutral: (sentimentBreakdown?.food?.neutral || 0) + (sentimentBreakdown?.service?.neutral || 0) + (sentimentBreakdown?.staff?.neutral || 0)
  };

  const sentimentData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [overallSentiment.positive, overallSentiment.negative, overallSentiment.neutral],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
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
  };

  // Get top performing dishes
  const topDishes = dishNames
    .sort((a, b) => sales[b].orders - sales[a].orders)
    .slice(0, 5);

  // Get recent recommendations
  const recentRecommendations = recommendations.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalRevenue?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Profit</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalProfit?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">{totalReviews || reviews.length}</p>
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
              <p className="text-sm font-medium text-gray-500">Service Rating</p>
              <p className="text-2xl font-semibold text-gray-900">
                {serviceAnalytics?.service_rating && typeof serviceAnalytics.service_rating === 'number' 
                  ? serviceAnalytics.service_rating.toFixed(1) 
                  : '4.2'}/5.0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
          <Bar data={salesData} options={chartOptions} />
        </div>

        {/* Overall Sentiment */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Sentiment</h3>
          <Pie data={sentimentData} options={chartOptions} />
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Dishes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Dishes</h3>
          <div className="space-y-3">
            {topDishes.map((dish, index) => (
              <div key={dish} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="ml-3 text-sm font-medium text-gray-900">{dish}</span>
                </div>
                <span className="text-sm text-gray-500">{sales[dish].orders} orders</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Recommendations */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
          <div className="space-y-3">
            {recentRecommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{rec.dish}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.action === 'promote' ? 'bg-green-100 text-green-800' :
                    rec.action === 'fix' ? 'bg-yellow-100 text-yellow-800' :
                    rec.action === 'remove' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {rec.action}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Dishes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Dishes</h3>
          <div className="space-y-3">
            {trends.slice(0, 5).map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="ml-3 text-sm font-medium text-gray-900">{trend.dish}</span>
                </div>
                <span className="text-sm text-gray-500">{trend.count} mentions</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Food Quality */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-gray-900">Food Quality</h4>
            <p className="text-2xl font-semibold text-green-600 mt-1">
              {sentimentBreakdown?.food ? 
                Math.round((sentimentBreakdown.food.positive / (sentimentBreakdown.food.positive + sentimentBreakdown.food.negative + sentimentBreakdown.food.neutral)) * 100) : 85}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Positive feedback</p>
          </div>

          {/* Service Quality */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-gray-900">Service Quality</h4>
            <p className="text-2xl font-semibold text-blue-600 mt-1">
              {serviceAnalytics?.service_rating && typeof serviceAnalytics.service_rating === 'number'
                ? serviceAnalytics.service_rating.toFixed(1)
                : '4.2'}/5.0
            </p>
            <p className="text-xs text-gray-500 mt-1">Average rating</p>
          </div>

          {/* Staff Performance */}
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-gray-900">Staff Performance</h4>
            <p className="text-2xl font-semibold text-purple-600 mt-1">
              {staffAnalytics?.overall_staff_rating && typeof staffAnalytics.overall_staff_rating === 'number'
                ? staffAnalytics.overall_staff_rating.toFixed(1)
                : '4.1'}/5.0
            </p>
            <p className="text-xs text-gray-500 mt-1">Average rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;