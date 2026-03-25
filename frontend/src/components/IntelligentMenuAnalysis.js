import React, { useState, useEffect } from 'react';
import { safeToFixed, formatCurrency } from '../utils/formatters';

function IntelligentMenuAnalysis() {
  const [intelligentAnalysis, setIntelligentAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrapingStatus, setScrapingStatus] = useState(null);
  const [isRealScraping, setIsRealScraping] = useState(false);

  // Fetch intelligent menu analysis on component mount
  useEffect(() => {
    fetchIntelligentAnalysis();
  }, []);

  const fetchIntelligentAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8001/intelligent-menu-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_name: 'The French Door'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch intelligent analysis');
      }
      
      const result = await response.json();
      setIntelligentAnalysis(result);
    } catch (error) {
      console.error('Error fetching intelligent analysis:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerRealScraping = async () => {
    setIsRealScraping(true);
    setScrapingStatus('Starting real Google Maps scraping...');
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8001/scrape-french-door', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error('Failed to start scraping');
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setScrapingStatus(`✅ Scraping completed! Found ${result.reviews_found} reviews`);
        // Refresh the analysis with new data
        setTimeout(() => {
          fetchIntelligentAnalysis();
        }, 1000);
      } else {
        setScrapingStatus(`⚠️ Scraping completed with fallback data`);
      }
      
    } catch (error) {
      console.error('Error during scraping:', error);
      setScrapingStatus(`❌ Scraping failed: ${error.message}`);
      setError(error.message);
    } finally {
      setIsRealScraping(false);
    }
  };

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'promote':
        return 'bg-green-100 text-green-800';
      case 'keep_optimize_cost':
        return 'bg-blue-100 text-blue-800';
      case 'maintain':
        return 'bg-gray-100 text-gray-800';
      case 'improve_quality':
        return 'bg-yellow-100 text-yellow-800';
      case 'urgent_improvement':
        return 'bg-orange-100 text-orange-800';
      case 'consider_removal':
        return 'bg-red-100 text-red-800';
      case 'remove':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '📋';
      case 'low':
        return '✅';
      default:
        return '📋';
    }
  };

  const getSatisfactionColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Analyzing menu with AI...</p>
              <p className="text-sm text-gray-500">Prioritizing customer satisfaction over profit</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Analysis</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button 
                onClick={fetchIntelligentAnalysis}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Retry Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!intelligentAnalysis) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600">No analysis data available</p>
        </div>
      </div>
    );
  }

  const { analysis_summary, menu_recommendations } = intelligentAnalysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">🧠 Intelligent Menu Analysis</h2>
            <p className="text-gray-600 mt-1">AI-powered analysis prioritizing customer satisfaction</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={triggerRealScraping}
              disabled={isRealScraping}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isRealScraping 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isRealScraping ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scraping...
                </span>
              ) : (
                '🔍 Real Scraping'
              )}
            </button>
            <button 
              onClick={fetchIntelligentAnalysis}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Refresh Analysis
            </button>
          </div>
        </div>

        {/* Scraping Status */}
        {scrapingStatus && (
          <div className={`p-4 rounded-lg mb-4 ${
            scrapingStatus.includes('✅') ? 'bg-green-50 text-green-800' :
            scrapingStatus.includes('⚠️') ? 'bg-yellow-50 text-yellow-800' :
            scrapingStatus.includes('❌') ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            <p className="text-sm font-medium">{scrapingStatus}</p>
          </div>
        )}

        {/* Analysis Methodology */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-blue-900 mb-2">📊 Analysis Logic</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Priority 1:</strong> Customer Satisfaction (Reviews & Sentiment)</p>
            <p>• <strong>Priority 2:</strong> Revenue Performance</p>
            <p>• <strong>Priority 3:</strong> Profit Margins</p>
            <p>• <strong>Rule:</strong> High Reviews + Low Profit = KEEP (Customer satisfaction priority)</p>
            <p>• <strong>Rule:</strong> High Revenue + Poor Reviews = REMOVE (Poor customer experience)</p>
          </div>
        </div>

        {/* Real Scraping Info */}
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-green-900 mb-2">🔍 Real Google Maps Scraping</h3>
          <div className="text-sm text-green-800 space-y-1">
            <p>• <strong>Live Data:</strong> Scrapes actual Google Maps reviews using Playwright browser automation</p>
            <p>• <strong>Sentiment Analysis:</strong> Advanced AI analysis of customer emotions and satisfaction</p>
            <p>• <strong>Database Storage:</strong> Reviews saved to Neon PostgreSQL for historical tracking</p>
            <p>• <strong>Fallback:</strong> Uses enhanced mock data if scraping encounters issues</p>
            <p>• <strong>Target URL:</strong> The French Door restaurant on Google Maps</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Dishes Analyzed</p>
              <p className="text-2xl font-semibold text-gray-900">{analysis_summary?.total_dishes_analyzed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High Satisfaction</p>
              <p className="text-2xl font-semibold text-gray-900">{analysis_summary?.high_satisfaction_dishes || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Need Attention</p>
              <p className="text-2xl font-semibold text-gray-900">{analysis_summary?.low_satisfaction_dishes || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Menu Health</p>
              <p className="text-2xl font-semibold text-gray-900 capitalize">{analysis_summary?.overall_menu_health || 'Unknown'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Menu Recommendations</h3>
          <p className="text-sm text-gray-600">Based on customer satisfaction analysis</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dish</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satisfaction Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decision</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Required</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {menu_recommendations?.map((dish, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{dish.dish_name}</div>
                      <div className="text-sm text-gray-500">
                        {dish.total_mentions} mentions • ⭐ {safeToFixed(dish.average_rating, 1)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getSatisfactionColor(dish.customer_satisfaction_score).includes('green') ? 'bg-green-500' : 
                            getSatisfactionColor(dish.customer_satisfaction_score).includes('yellow') ? 'bg-yellow-500' :
                            getSatisfactionColor(dish.customer_satisfaction_score).includes('orange') ? 'bg-orange-500' : 'bg-red-500'}`}
                          style={{ width: `${dish.customer_satisfaction_score}%` }}
                        ></div>
                      </div>
                      <span className={`ml-2 text-sm font-medium ${getSatisfactionColor(dish.customer_satisfaction_score)}`}>
                        {safeToFixed(dish.customer_satisfaction_score, 1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="text-green-600">👍 {dish.positive_reviews} ({safeToFixed(dish.positive_ratio, 1)}%)</div>
                      <div className="text-red-600">👎 {dish.negative_reviews} ({safeToFixed(dish.negative_ratio, 1)}%)</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDecisionColor(dish.decision)}`}>
                      {dish.decision.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="flex items-center">
                      {getPriorityIcon(dish.priority)} {dish.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    <div>
                      <p className="font-medium">{dish.action_required}</p>
                      <p className="text-xs text-gray-400 mt-1">{dish.reason}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Feedback Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎉 Most Praised Aspects</h3>
          <div className="space-y-3">
            {menu_recommendations?.slice(0, 5).map((dish, index) => (
              dish.positive_themes.length > 0 && (
                <div key={index} className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900">{dish.dish_name}</div>
                  <div className="text-sm text-green-700 mt-1">
                    {dish.positive_themes.join(', ')}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Common Complaints</h3>
          <div className="space-y-3">
            {menu_recommendations?.slice(0, 5).map((dish, index) => (
              dish.negative_themes.length > 0 && (
                <div key={index} className="p-3 bg-red-50 rounded-lg">
                  <div className="font-medium text-red-900">{dish.dish_name}</div>
                  <div className="text-sm text-red-700 mt-1">
                    {dish.negative_themes.join(', ')}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntelligentMenuAnalysis;