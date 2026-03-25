import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ReviewActions({ data }) {
  const [reviewActions, setReviewActions] = useState([]);
  const [realReviews, setRealReviews] = useState([]);
  const [scrapingStatus, setScrapingStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  // Mock review actions data
  const mockActions = [
    {
      _id: '1',
      reviewText: 'Food was cold when it arrived, and the service was extremely slow. Very disappointed with the experience.',
      category: 'service',
      actionType: 'improve_service',
      priority: 'high',
      suggestedAction: 'Provide additional staff training on service speed and food temperature management',
      status: 'pending',
      createdDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '2',
      reviewText: 'The pasta was overcooked and tasteless. Expected much better quality for the price.',
      category: 'food',
      actionType: 'fix_quality',
      priority: 'high',
      suggestedAction: 'Review pasta preparation process and conduct chef training on cooking times',
      status: 'in_progress',
      createdDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '3',
      reviewText: 'Waiter was rude and unprofessional. Made our dining experience very uncomfortable.',
      category: 'staff',
      actionType: 'staff_training',
      priority: 'high',
      suggestedAction: 'Conduct customer service training and review staff behavior guidelines',
      status: 'pending',
      createdDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '4',
      reviewText: 'Coffee was lukewarm and took 20 minutes to arrive. Not acceptable for a simple order.',
      category: 'service',
      actionType: 'improve_service',
      priority: 'medium',
      suggestedAction: 'Optimize coffee preparation workflow and implement order tracking system',
      status: 'pending',
      createdDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '5',
      reviewText: 'Burger was dry and the bun was stale. Quality has definitely gone down.',
      category: 'food',
      actionType: 'fix_quality',
      priority: 'medium',
      suggestedAction: 'Review burger preparation standards and ingredient freshness protocols',
      status: 'completed',
      createdDate: new Date().toISOString(),
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    // Automatically trigger real scraping when component mounts
    automaticScraping();
  }, []);

  const automaticScraping = async () => {
    setLoading(true);
    setScrapingStatus('🔍 Automatically scraping real Google Maps reviews...');
    
    try {
      console.log('🚀 Starting automatic Google Maps scraping...');
      
      // First, try to get real scraped reviews
      const scrapingResponse = await fetch('http://localhost:8001/scrape-french-door', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (scrapingResponse.ok) {
        const scrapingResult = await scrapingResponse.json();
        console.log('✅ Scraping completed:', scrapingResult);
        
        if (scrapingResult.sample_reviews && scrapingResult.sample_reviews.length > 0) {
          setRealReviews(scrapingResult.sample_reviews);
          setScrapingStatus(`✅ Found ${scrapingResult.reviews_found} real Google Maps reviews`);
          
          // Generate review actions from real reviews
          generateActionsFromRealReviews(scrapingResult.sample_reviews);
        } else {
          setScrapingStatus('⚠️ No reviews found, using fallback data');
          fetchReviewActions(); // Fallback to mock data
        }
      } else {
        console.error('❌ Scraping failed');
        setScrapingStatus('❌ Scraping failed, using mock data');
        fetchReviewActions(); // Fallback to mock data
      }
      
    } catch (error) {
      console.error('❌ Automatic scraping error:', error);
      setScrapingStatus('❌ Connection error, using mock data');
      fetchReviewActions(); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const generateActionsFromRealReviews = (reviews) => {
    console.log('📊 Generating actions from real reviews...');
    
    const actions = [];
    
    reviews.forEach((review, index) => {
      const sentiment = review.analysis?.overall_sentiment || 'neutral';
      const rating = review.rating || 3;
      
      // Only create actions for negative reviews (rating <= 2 or negative sentiment)
      if (rating <= 2 || sentiment === 'negative') {
        let category = 'service';
        let actionType = 'improve_service';
        let suggestedAction = 'Review and improve overall service quality';
        
        // Determine category based on review content
        const reviewText = review.text.toLowerCase();
        if (reviewText.includes('food') || reviewText.includes('taste') || reviewText.includes('cold') || reviewText.includes('overcooked')) {
          category = 'food';
          actionType = 'fix_quality';
          suggestedAction = 'Review food preparation process and quality control';
        } else if (reviewText.includes('staff') || reviewText.includes('waiter') || reviewText.includes('server') || reviewText.includes('rude')) {
          category = 'staff';
          actionType = 'staff_training';
          suggestedAction = 'Conduct staff training on customer service and professionalism';
        } else if (reviewText.includes('slow') || reviewText.includes('wait') || reviewText.includes('service')) {
          category = 'service';
          actionType = 'improve_service';
          suggestedAction = 'Optimize service workflow and reduce wait times';
        }
        
        actions.push({
          _id: `real_${index}`,
          reviewText: review.text,
          category: category,
          actionType: actionType,
          priority: rating <= 1 ? 'high' : 'medium',
          suggestedAction: suggestedAction,
          status: 'pending',
          createdDate: review.review_date || new Date().toISOString(),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          reviewer: review.reviewer_name || 'Anonymous',
          rating: rating,
          sentiment: sentiment,
          source: 'real_google_maps'
        });
      }
    });
    
    // If no negative reviews found, show positive message
    if (actions.length === 0) {
      console.log('🎉 No negative reviews found - all reviews are positive!');
      setScrapingStatus('🎉 Great news! All scraped reviews are positive - no actions needed');
      
      // Create a summary action showing positive feedback
      const positiveAction = {
        _id: 'positive_summary',
        reviewText: 'All recent Google Maps reviews are positive! Customers are satisfied with food and service.',
        category: 'summary',
        actionType: 'maintain_quality',
        priority: 'low',
        suggestedAction: 'Continue maintaining current high standards of food and service quality',
        status: 'completed',
        createdDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        reviewer: 'System Analysis',
        rating: 5,
        sentiment: 'positive',
        source: 'real_google_maps'
      };
      
      setReviewActions([positiveAction]);
    } else {
      console.log(`📋 Generated ${actions.length} actions from negative reviews`);
      setReviewActions(actions);
    }
  };

  const fetchReviewActions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/review-actions');
      setReviewActions(response.data.length > 0 ? response.data : mockActions);
    } catch (error) {
      console.error('Error fetching review actions:', error);
      setReviewActions(mockActions);
    } finally {
      setLoading(false);
    }
  };

  const generateNewActions = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/review-actions/generate');
      fetchReviewActions();
    } catch (error) {
      console.error('Error generating actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateActionStatus = async (actionId, newStatus) => {
    try {
      await axios.put(`http://localhost:5001/api/review-actions/${actionId}`, {
        status: newStatus
      });
      fetchReviewActions();
    } catch (error) {
      console.error('Error updating action status:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'food':
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'service':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'staff':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'summary':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const pendingActions = reviewActions.filter(a => a.status === 'pending');
  const inProgressActions = reviewActions.filter(a => a.status === 'in_progress');
  const completedActions = reviewActions.filter(a => a.status === 'completed');
  const highPriorityActions = reviewActions.filter(a => a.priority === 'high');

  return (
    <div className="space-y-6">
      {/* Real Scraping Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">🔍 Real Google Maps Reviews</h3>
            <p className="text-gray-600 mt-1">Automatically scraped and analyzed</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {realReviews.length > 0 ? `${realReviews.length} reviews found` : 'Scraping...'}
            </p>
            <p className="text-xs text-gray-500">Auto-refresh every page load</p>
          </div>
        </div>
        
        {scrapingStatus && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            scrapingStatus.includes('✅') ? 'bg-green-50 text-green-800' :
            scrapingStatus.includes('🎉') ? 'bg-blue-50 text-blue-800' :
            scrapingStatus.includes('⚠️') ? 'bg-yellow-50 text-yellow-800' :
            scrapingStatus.includes('❌') ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            <p className="font-medium">{scrapingStatus}</p>
          </div>
        )}
        
        {/* Show sample real reviews */}
        {realReviews.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">📝 Sample Real Reviews:</h4>
            <div className="space-y-2">
              {realReviews.slice(0, 3).map((review, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{review.reviewer_name}</span>
                    <div className="flex items-center">
                      <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        review.analysis?.overall_sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                        review.analysis?.overall_sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {review.analysis?.overall_sentiment || 'neutral'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 italic">"{review.text.substring(0, 150)}..."</p>
                  <p className="text-xs text-gray-500 mt-1">Source: {review.source}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High Priority</p>
              <p className="text-2xl font-semibold text-gray-900">{highPriorityActions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingActions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{inProgressActions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{completedActions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📋 Review Action Management</h3>
            <p className="text-gray-600 mt-1">Actions generated from real Google Maps reviews</p>
          </div>
          <button
            onClick={automaticScraping}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scraping...
              </span>
            ) : '🔄 Refresh Reviews'}
          </button>
        </div>
      </div>

      {/* Actions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">📋 Action Items from Real Reviews</h3>
          <p className="text-sm text-gray-600">Generated from actual Google Maps review analysis</p>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviewActions.map((action) => (
              <div key={action._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getCategoryIcon(action.category)}
                      <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                        {action.category === 'summary' ? 'Summary' : `${action.category} Issue`}
                      </span>
                      <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(action.priority)}`}>
                        {action.priority} priority
                      </span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(action.status)}`}>
                        {action.status.replace('_', ' ')}
                      </span>
                      {action.source === 'real_google_maps' && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Real Review
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 italic">
                        "{action.reviewText}"
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Suggested Action:</h4>
                      <p className="text-sm text-gray-700">{action.suggestedAction}</p>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      {action.reviewer && (
                        <>
                          <span>Reviewer: {action.reviewer}</span>
                          <span className="mx-2">•</span>
                        </>
                      )}
                      {action.rating && (
                        <>
                          <span>Rating: {action.rating}⭐</span>
                          <span className="mx-2">•</span>
                        </>
                      )}
                      <span>Created: {new Date(action.createdDate).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                      {new Date(action.dueDate) < new Date() && action.status !== 'completed' && (
                        <span className="ml-2 text-red-600 font-medium">Overdue</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    {action.status === 'pending' && (
                      <button
                        onClick={() => updateActionStatus(action._id, 'in_progress')}
                        className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                      >
                        Start
                      </button>
                    )}
                    {action.status === 'in_progress' && (
                      <button
                        onClick={() => updateActionStatus(action._id, 'completed')}
                        className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedAction(action)}
                      className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Details Modal */}
      {selectedAction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Action Details</h3>
                <button
                  onClick={() => setSelectedAction(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Review Text</label>
                  <p className="mt-1 text-sm text-gray-600 italic">"{selectedAction.reviewText}"</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedAction.category}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedAction.priority)}`}>
                    {selectedAction.priority}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAction.status)}`}>
                    {selectedAction.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Suggested Action</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAction.suggestedAction}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedAction.createdDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedAction.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => setSelectedAction(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
                {selectedAction.status !== 'completed' && (
                  <button
                    onClick={() => {
                      const newStatus = selectedAction.status === 'pending' ? 'in_progress' : 'completed';
                      updateActionStatus(selectedAction._id, newStatus);
                      setSelectedAction(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {selectedAction.status === 'pending' ? 'Start Action' : 'Mark Complete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewActions;