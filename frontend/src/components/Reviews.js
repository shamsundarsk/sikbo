import React, { useState, useMemo } from 'react';

function Reviews({ data }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedReview, setSelectedReview] = useState(null);

  // Move all hooks before any early returns
  const { reviews = [] } = data || {};

  // Group similar reviews - moved before early return
  const groupSimilarReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];
    
    const groups = {};
    
    reviews.forEach(review => {
      const text = review.text.toLowerCase();
      let category = 'general';
      
      if (text.includes('food') || text.includes('taste') || text.includes('cold') || text.includes('hot')) {
        category = 'food_quality';
      } else if (text.includes('service') || text.includes('staff') || text.includes('wait')) {
        category = 'service';
      } else if (text.includes('clean') || text.includes('dirty') || text.includes('atmosphere')) {
        category = 'atmosphere';
      } else if (text.includes('price') || text.includes('expensive') || text.includes('value')) {
        category = 'pricing';
      }
      
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(review);
    });
    
    // Only return groups with more than 1 review
    return Object.entries(groups).filter(([_, reviews]) => reviews.length > 1);
  }, [reviews]);

  // Early return after all hooks
  if (!data || !reviews || reviews.length === 0) {
    return (
      <div className="p-10 text-center">
        <h3 className="text-2xl font-bold">No Reviews Available</h3>
        <p className="text-gray-500">Real reviews will appear here once data is loaded.</p>
      </div>
    );
  }

  // Generate suggestions and summaries for reviews
  const generateSuggestion = (review) => {
    const text = review.text.toLowerCase();
    const rating = review.rating || 0;
    
    if (review.sentiment === 'negative' || rating <= 2) {
      if (text.includes('food') || text.includes('taste') || text.includes('cold') || text.includes('hot')) {
        return {
          type: 'urgent',
          action: 'Kitchen Quality Control',
          steps: [
            'Immediate temperature check on food warmers',
            'Review cooking times and portion consistency',
            'Staff training on food presentation standards',
            'Follow up with customer within 24 hours'
          ],
          priority: 'High'
        };
      } else if (text.includes('service') || text.includes('staff') || text.includes('wait') || text.includes('rude')) {
        return {
          type: 'urgent',
          action: 'Service Recovery Protocol',
          steps: [
            'Schedule immediate staff coaching session',
            'Review service timing and workflow',
            'Implement customer service recovery training',
            'Personal apology from management'
          ],
          priority: 'High'
        };
      } else if (text.includes('clean') || text.includes('dirty') || text.includes('atmosphere')) {
        return {
          type: 'urgent',
          action: 'Environment Audit',
          steps: [
            'Deep cleaning of mentioned areas',
            'Review cleaning protocols and schedules',
            'Staff training on hygiene standards',
            'Implement quality checks every 2 hours'
          ],
          priority: 'Medium'
        };
      }
    } else if (review.sentiment === 'neutral' || rating === 3) {
      return {
        type: 'improvement',
        action: 'Enhancement Opportunity',
        steps: [
          'Identify specific areas mentioned for improvement',
          'Gather more feedback on similar concerns',
          'Implement gradual improvements',
          'Monitor customer satisfaction trends'
        ],
        priority: 'Medium'
      };
    } else {
      return {
        type: 'positive',
        action: 'Leverage Success',
        steps: [
          'Document what worked well',
          'Share best practices with team',
          'Use as training example',
          'Encourage similar positive experiences'
        ],
        priority: 'Low'
      };
    }
    
    return {
      type: 'general',
      action: 'Standard Follow-up',
      steps: ['Review feedback', 'Implement improvements', 'Monitor results'],
      priority: 'Low'
    };
  };

  const generateSummary = (review) => {
    const text = review.text.toLowerCase();
    const keywords = [];
    
    if (text.includes('food') || text.includes('taste') || text.includes('dish')) keywords.push('Food Quality');
    if (text.includes('service') || text.includes('staff') || text.includes('waiter')) keywords.push('Service');
    if (text.includes('atmosphere') || text.includes('ambiance') || text.includes('clean')) keywords.push('Atmosphere');
    if (text.includes('price') || text.includes('expensive') || text.includes('cheap')) keywords.push('Pricing');
    if (text.includes('wait') || text.includes('time') || text.includes('slow')) keywords.push('Timing');
    
    const sentiment = review.sentiment === 'positive' ? 'Positive' : 
                     review.sentiment === 'negative' ? 'Negative' : 'Neutral';
    
    return {
      mainTopics: keywords.length > 0 ? keywords : ['General Experience'],
      sentiment: sentiment,
      keyPhrase: text.length > 50 ? text.substring(0, 50) + '...' : text,
      impact: review.rating <= 2 ? 'High Impact' : review.rating >= 4 ? 'Positive Impact' : 'Moderate Impact'
    };
  };

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    return review.sentiment === filter;
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.review_date || b.date) - new Date(a.review_date || a.date);
    }
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStars = (rating) => {
    return '⭐'.repeat(rating || 0);
  };

  const getCategoryName = (category) => {
    const names = {
      'food_quality': 'Food & Dining Experience',
      'service': 'Service & Staff Experience', 
      'atmosphere': 'Atmosphere & Ambiance',
      'pricing': 'Value & Pricing Experience',
      'general': 'General Experience'
    };
    return names[category] || category;
  };

  // Determine if category is positive or negative based on reviews
  const getCategoryTone = (categoryReviews) => {
    const positiveCount = categoryReviews.filter(r => r.sentiment === 'positive' || r.rating >= 4).length;
    const negativeCount = categoryReviews.filter(r => r.sentiment === 'negative' || r.rating <= 2).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'mixed';
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <section className="flex justify-between items-end">
        <div className="space-y-1">
          <span className="text-primary font-label text-xs font-bold tracking-[0.2em] uppercase">Real Data</span>
          <h2 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight">Customer Reviews</h2>
          <p className="text-on-surface-variant max-w-xl font-body">
            Authentic reviews scraped from Google Maps and Zomato for The French Door restaurant.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white p-1 rounded-lg flex border border-surface-container shadow-sm">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-bold ${filter === 'all' ? 'bg-primary text-white' : 'text-gray-600'}`}
            >
              All ({reviews.length})
            </button>
            <button 
              onClick={() => setFilter('positive')}
              className={`px-4 py-2 rounded-md text-sm font-bold ${filter === 'positive' ? 'bg-green-500 text-white' : 'text-gray-600'}`}
            >
              Positive ({reviews.filter(r => r.sentiment === 'positive').length})
            </button>
            <button 
              onClick={() => setFilter('negative')}
              className={`px-4 py-2 rounded-md text-sm font-bold ${filter === 'negative' ? 'bg-red-500 text-white' : 'text-gray-600'}`}
            >
              Negative ({reviews.filter(r => r.sentiment === 'negative').length})
            </button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-surface-container">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">reviews</span>
            <span className="text-sm font-medium text-gray-600">Total Reviews</span>
          </div>
          <h3 className="text-3xl font-bold">{reviews.length}</h3>
          <p className="text-xs text-gray-500 mt-1">From real sources</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-surface-container">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-green-600">thumb_up</span>
            <span className="text-sm font-medium text-gray-600">Positive</span>
          </div>
          <h3 className="text-3xl font-bold text-green-600">
            {reviews.filter(r => r.sentiment === 'positive').length}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {Math.round((reviews.filter(r => r.sentiment === 'positive').length / reviews.length) * 100)}% of total
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-surface-container">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-yellow-600">star</span>
            <span className="text-sm font-medium text-gray-600">Avg Rating</span>
          </div>
          <h3 className="text-3xl font-bold text-yellow-600">
            {(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)}
          </h3>
          <p className="text-xs text-gray-500 mt-1">Out of 5 stars</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-surface-container">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-blue-600">source</span>
            <span className="text-sm font-medium text-gray-600">Sources</span>
          </div>
          <h3 className="text-3xl font-bold text-blue-600">
            {new Set(reviews.map(r => r.source)).size}
          </h3>
          <p className="text-xs text-gray-500 mt-1">Different platforms</p>
        </div>
      </section>

      {/* Similar Reviews Section */}
      {groupSimilarReviews.length > 0 && (
        <section className="bg-white rounded-xl shadow-sm border border-surface-container">
          <div className="p-6 border-b border-surface-container">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">group</span>
              Similar Review Patterns
            </h3>
            <p className="text-sm text-gray-600 mt-1">Reviews grouped by common themes and issues</p>
          </div>
          
          <div className="p-6 space-y-6">
            {groupSimilarReviews.map(([category, categoryReviews]) => {
              const tone = getCategoryTone(categoryReviews);
              const categoryName = getCategoryName(category);
              const displayName = tone === 'positive' ? `${categoryName} - Highlights` : 
                                 tone === 'negative' ? `${categoryName} - Areas for Improvement` : 
                                 `${categoryName} - Mixed Feedback`;
              
              return (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-900">{displayName}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      tone === 'positive' ? 'bg-green-100 text-green-800' :
                      tone === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {categoryReviews.length} reviews
                    </span>
                  </div>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryReviews.slice(0, 4).map((review, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-yellow-500 text-sm">{getStars(review.rating)}</span>
                          <span className="text-xs text-gray-500">{review.reviewer_name || 'Anonymous'}</span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">"{review.text.substring(0, 100)}..."</p>
                      </div>
                    ))}
                  </div>
                  
                  {categoryReviews.length > 4 && (
                    <p className="text-sm text-gray-500 mt-2">
                      +{categoryReviews.length - 4} more similar reviews
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Reviews List */}
      <section className="bg-white rounded-xl shadow-sm border border-surface-container">
        <div className="p-6 border-b border-surface-container">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Real Customer Reviews</h3>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>
        
        <div className="divide-y divide-surface-container">
          {sortedReviews.map((review, index) => {
            const suggestion = generateSuggestion(review);
            const summary = generateSummary(review);
            
            return (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">person</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{review.reviewer_name || 'Anonymous'}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-500">{getStars(review.rating)}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(review.review_date || review.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSentimentColor(review.sentiment)}`}>
                      {review.sentiment?.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                      {review.source?.replace('_', ' ').toUpperCase()}
                    </span>
                    <button 
                      onClick={() => setSelectedReview(selectedReview === index ? null : index)}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-200 transition-colors"
                    >
                      {selectedReview === index ? 'Hide Details' : 'View Analysis'}
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  "{review.text}"
                </p>
                
                {/* Summary */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">summarize</span>
                    Quick Summary
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Topics:</span>
                      <p className="text-blue-800">{summary.mainTopics.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Sentiment:</span>
                      <p className="text-blue-800">{summary.sentiment}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Impact:</span>
                      <p className="text-blue-800">{summary.impact}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Priority:</span>
                      <p className="text-blue-800">{suggestion.priority}</p>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis (Expandable) */}
                {selectedReview === index && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 border-l-4 border-primary">
                    <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">psychology</span>
                      AI Recommendation: {suggestion.action}
                    </h5>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Action Plan:</span>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                          {suggestion.steps.map((step, stepIdx) => (
                            <li key={stepIdx} className="text-sm text-gray-700">{step}</li>
                          ))}
                        </ol>
                      </div>
                      
                      <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          suggestion.priority === 'High' ? 'bg-red-100 text-red-800' :
                          suggestion.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {suggestion.priority} Priority
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          suggestion.type === 'urgent' ? 'bg-red-100 text-red-800' :
                          suggestion.type === 'improvement' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)} Action
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {review.dish && review.dish !== 'general' && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">restaurant</span>
                      Mentioned: {review.dish}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">category</span>
                    Category: {review.category}
                  </span>
                  {review.confidence && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">psychology</span>
                      AI Confidence: {Math.round(review.confidence * 100)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-6 border-t border-surface-container bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Showing {sortedReviews.length} of {reviews.length} reviews • 
            Data sourced from: {Array.from(new Set(reviews.map(r => r.source))).join(', ')}
          </p>
        </div>
      </section>
    </div>
  );
}

export default Reviews;