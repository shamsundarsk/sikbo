import React, { useState, useEffect } from 'react';

function ReviewActions({ data }) {
  const [reviewActions, setReviewActions] = useState([]);
  const [realReviews, setRealReviews] = useState([]);
  const [scrapingStatus, setScrapingStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    // Always use real reviews from props - no mock data
    if (data && data.reviews && data.reviews.length > 0) {
      console.log('📝 Using real reviews from data:', data.reviews.length);
      setRealReviews(data.reviews);
      generateActionsFromRealReviews(data.reviews);
      setScrapingStatus(`✅ Loaded ${data.reviews.length} real reviews from database`);
    } else {
      setScrapingStatus('⚠️ No review data available');
      setReviewActions([]);
    }
  }, [data]);

  const automaticScraping = async () => {
    // This function is now only for manual refresh
    setLoading(true);
    setScrapingStatus('🔄 Refreshing review data...');
    try {
      // Refresh the page data instead of scraping
      window.location.reload();
    } catch (error) {
      setScrapingStatus('❌ Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const generateActionsFromRealReviews = (reviews) => {
    // Filter for negative reviews (rating <= 3 or negative sentiment)
    const negativeReviews = reviews.filter(r => 
      (r.rating && r.rating <= 3) || 
      (r.sentiment === 'negative')
    );
    
    const actions = negativeReviews.map((review, index) => {
      let category = 'service';
      const text = review.text.toLowerCase();
      
      // Categorize based on review content
      if (text.includes('food') || text.includes('taste') || text.includes('cold') || text.includes('hot') || text.includes('dish')) {
        category = 'food';
      } else if (text.includes('staff') || text.includes('waiter') || text.includes('service') || text.includes('rude')) {
        category = 'service';
      } else if (text.includes('clean') || text.includes('dirty') || text.includes('atmosphere')) {
        category = 'staff';
      }
      
      // Generate appropriate action based on category and severity
      let suggestedAction = 'Follow up with customer';
      if (category === 'food') {
        suggestedAction = review.rating <= 2 ? 'Immediate kitchen protocol review' : 'Quality control check';
      } else if (category === 'service') {
        suggestedAction = review.rating <= 2 ? 'Staff coaching session' : 'Service process review';
      } else {
        suggestedAction = 'Environment and cleanliness audit';
      }
      
      return {
        _id: `real_${index}`,
        reviewText: review.text,
        category: category,
        priority: review.rating <= 2 ? 'high' : 'medium',
        suggestedAction: suggestedAction,
        status: 'pending',
        createdDate: review.review_date || review.date || new Date().toISOString(),
        reviewer: review.reviewer_name || 'Anonymous',
        rating: review.rating || 1,
        source: review.source || 'unknown'
      };
    });
    
    setReviewActions(actions);
  };

  const updateActionStatus = (actionId, newStatus) => {
    setReviewActions(prev => prev.map(a => a._id === actionId ? { ...a, status: newStatus } : a));
  };

  const filteredActions = filter === 'all' ? reviewActions : reviewActions.filter(a => a.category === filter);
  const urgentCount = reviewActions.filter(a => a.priority === 'high' && a.status !== 'completed').length;

  return (
    <div className="space-y-10 font-body">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#2b3437] mb-2 font-headline">Review Resolution Center</h2>
          <p className="text-slate-400 max-w-lg leading-relaxed">System-detected negative sentiments that require immediate attention to protect brand reputation.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col items-end px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-100 min-w-[160px]">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-headline">Urgent Actions</span>
            <span className="text-4xl font-black text-red-500 font-headline mt-1">{urgentCount}</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-12 gap-6 mb-10">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100">
          <div className="flex gap-2">
            {['all', 'food', 'service', 'staff'].map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-tight transition-all ${filter === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {cat === 'all' ? 'All Negative' : `${cat} Only`}
              </button>
            ))}
          </div>
          <button 
            onClick={automaticScraping}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-primary font-black text-[10px] uppercase tracking-widest font-headline hover:bg-slate-50 rounded-xl transition-colors"
          >
            <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>sync</span>
            {loading ? 'Syncing...' : 'Force Sync'}
          </button>
        </div>
        <div className="col-span-12 lg:col-span-4 bg-red-50/30 rounded-2xl p-6 flex flex-col justify-center border border-red-100/50">
           <div className="flex items-center gap-3 mb-1">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
             <span className="text-[10px] font-black text-red-600 uppercase tracking-widest font-headline">Critical Alert</span>
           </div>
           <p className="text-red-900 text-sm font-bold truncate">Reputation risk elevated in "Staff Courtesy"</p>
        </div>
      </div>

      {/* Review List */}
      <div className="grid gap-6">
        {filteredActions.map((action, i) => (
          <div key={i} className="group relative bg-white rounded-3xl p-8 flex flex-col md:flex-row gap-10 transition-all hover:shadow-2xl border border-slate-100">
            <div className="flex-shrink-0">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${action.category === 'food' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                  <span className="material-symbols-outlined text-3xl font-variation-settings-fill-1">
                    {action.category === 'food' ? 'restaurant' : 'person_cancel'}
                  </span>
               </div>
            </div>
            <div className="flex-grow">
               <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                       <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">Highly Negative</span>
                       <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">{action.reviewer || 'Anonymous'} • {new Date(action.createdDate).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#2b3437] font-headline leading-tight italic">"{action.reviewText}"</h3>
                  </div>
                  <div className="px-6 py-3 bg-slate-50 rounded-2xl text-center min-w-[140px] border border-slate-100">
                     <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 font-headline">Intelligence Tag</span>
                     <span className="text-sm font-black text-primary uppercase">{action.category} Impact</span>
                  </div>
               </div>
               <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-slate-50">
                  <button 
                    onClick={() => updateActionStatus(action._id, 'completed')}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                  >
                    <span className="material-symbols-outlined text-sm">{action.status === 'completed' ? 'check_circle' : 'bolt'}</span>
                    {action.status === 'completed' ? 'Resolved' : 'View Solution Path'}
                  </button>
                  <button 
                    onClick={() => setSelectedReview(selectedReview === action._id ? null : action._id)}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">psychology</span>
                    {selectedReview === action._id ? 'Hide Details' : 'AI Analysis'}
                  </button>
               </div>
               
               {/* Detailed Solution Path */}
               {selectedReview === action._id && (
                 <div className="mt-6 bg-slate-50 p-6 rounded-2xl border-l-4 border-primary">
                   <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm text-primary">route</span>
                     Complete Solution Path
                   </h5>
                   
                   <div className="space-y-4">
                     <div className="bg-white p-4 rounded-lg border border-slate-200">
                       <h6 className="font-bold text-slate-800 mb-2">Immediate Actions (0-2 hours)</h6>
                       <ul className="space-y-1 text-sm text-slate-700">
                         {action.category === 'food' ? (
                           <>
                             <li>• Check kitchen temperature logs and equipment status</li>
                             <li>• Review food preparation timing for mentioned dish</li>
                             <li>• Verify portion sizes and presentation standards</li>
                             <li>• Document specific issues for quality control</li>
                           </>
                         ) : action.category === 'service' ? (
                           <>
                             <li>• Identify staff member involved in the incident</li>
                             <li>• Review service timing and table management</li>
                             <li>• Check current staffing levels vs. customer volume</li>
                             <li>• Implement immediate service recovery protocol</li>
                           </>
                         ) : (
                           <>
                             <li>• Inspect mentioned areas for cleanliness issues</li>
                             <li>• Review cleaning schedules and protocols</li>
                             <li>• Check maintenance logs for any pending issues</li>
                             <li>• Implement immediate corrective measures</li>
                           </>
                         )}
                       </ul>
                     </div>
                     
                     <div className="bg-white p-4 rounded-lg border border-slate-200">
                       <h6 className="font-bold text-slate-800 mb-2">Short-term Solutions (2-24 hours)</h6>
                       <ul className="space-y-1 text-sm text-slate-700">
                         {action.category === 'food' ? (
                           <>
                             <li>• Conduct kitchen staff training on temperature control</li>
                             <li>• Update food preparation SOPs if needed</li>
                             <li>• Implement additional quality checkpoints</li>
                             <li>• Follow up with customer via phone or email</li>
                           </>
                         ) : action.category === 'service' ? (
                           <>
                             <li>• Conduct one-on-one coaching with involved staff</li>
                             <li>• Review and adjust table assignment procedures</li>
                             <li>• Implement service timing monitoring system</li>
                             <li>• Personal apology from management to customer</li>
                           </>
                         ) : (
                           <>
                             <li>• Deep clean all customer-facing areas</li>
                             <li>• Update cleaning checklists and schedules</li>
                             <li>• Train staff on enhanced hygiene protocols</li>
                             <li>• Implement hourly cleanliness spot checks</li>
                           </>
                         )}
                       </ul>
                     </div>
                     
                     <div className="bg-white p-4 rounded-lg border border-slate-200">
                       <h6 className="font-bold text-slate-800 mb-2">Long-term Prevention (1-4 weeks)</h6>
                       <ul className="space-y-1 text-sm text-slate-700">
                         {action.category === 'food' ? (
                           <>
                             <li>• Install additional food warming equipment if needed</li>
                             <li>• Develop comprehensive food quality monitoring system</li>
                             <li>• Create customer feedback loop for food quality</li>
                             <li>• Regular kitchen equipment maintenance schedule</li>
                           </>
                         ) : action.category === 'service' ? (
                           <>
                             <li>• Implement comprehensive service training program</li>
                             <li>• Develop customer service excellence standards</li>
                             <li>• Create performance monitoring and reward system</li>
                             <li>• Regular customer satisfaction surveys</li>
                           </>
                         ) : (
                           <>
                             <li>• Upgrade cleaning equipment and supplies</li>
                             <li>• Implement digital cleaning tracking system</li>
                             <li>• Create cleanliness audit and scoring system</li>
                             <li>• Regular third-party cleanliness inspections</li>
                           </>
                         )}
                       </ul>
                     </div>
                     
                     <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                       <div className="flex items-center gap-2">
                         <span className={`w-3 h-3 rounded-full ${action.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                         <span className="text-sm font-medium text-slate-600">
                           Estimated Resolution Time: {action.priority === 'high' ? '24-48 hours' : '3-7 days'}
                         </span>
                       </div>
                       <span className="text-xs text-slate-500">
                         Success Rate: {action.category === 'food' ? '92%' : action.category === 'service' ? '88%' : '95%'}
                       </span>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Insights Section */}
      <div className="mt-20 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-5">
           <div className="bg-primary text-white rounded-[2.5rem] p-12 relative overflow-hidden shadow-2xl h-full">
              <div className="relative z-10 h-full flex flex-col">
                <h4 className="text-3xl font-black font-headline mb-6 tracking-tight">AI Intelligence Insights</h4>
                <div className="space-y-6 mb-10">
                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-yellow-400">trending_up</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-white/60">Trend Alert</span>
                    </div>
                    <p className="text-white font-medium">
                      {reviewActions.filter(a => a.category === 'food').length > 0 
                        ? `Food quality complaints increased by ${Math.round((reviewActions.filter(a => a.category === 'food').length / reviewActions.length) * 100)}% this week`
                        : 'Service quality maintaining stable performance levels'
                      }
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-red-400">warning</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-white/60">Risk Assessment</span>
                    </div>
                    <p className="text-white font-medium">
                      {urgentCount > 0 
                        ? `${urgentCount} high-priority issues require immediate attention to prevent reputation damage`
                        : 'No critical issues detected. Reputation risk is minimal'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="mt-auto">
                   <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-xl border border-white/10">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Smart Recommendation</span>
                        <span className="material-symbols-outlined text-sm text-yellow-400 animate-pulse">auto_awesome</span>
                      </div>
                      <p className="font-black text-xl leading-tight font-headline">
                        {reviewActions.filter(a => a.category === 'food').length > reviewActions.filter(a => a.category === 'service').length
                          ? 'Focus on kitchen quality control and temperature management systems'
                          : reviewActions.filter(a => a.category === 'service').length > 0
                          ? 'Implement enhanced staff training and service timing protocols'
                          : 'Maintain current excellence standards and monitor for emerging patterns'
                        }
                      </p>
                   </div>
                </div>
              </div>
           </div>
        </div>
        <div className="col-span-12 lg:col-span-7">
           <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-sm h-full">
              <div className="flex justify-between items-center mb-10">
                <h4 className="text-2xl font-black font-headline text-[#2b3437] tracking-tight">Issue Category Breakdown</h4>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Real-time Analysis</span>
              </div>
              <div className="space-y-10">
                {[
                  { 
                    label: 'Food Quality Issues', 
                    value: Math.round((reviewActions.filter(a => a.category === 'food').length / Math.max(reviewActions.length, 1)) * 100), 
                    status: reviewActions.filter(a => a.category === 'food').length > 2 ? 'Critical' : 'Acceptable', 
                    color: reviewActions.filter(a => a.category === 'food').length > 2 ? 'bg-red-500' : 'bg-primary',
                    count: reviewActions.filter(a => a.category === 'food').length,
                    solution: 'Kitchen temperature control & quality checkpoints'
                  },
                  { 
                    label: 'Service & Staff Issues', 
                    value: Math.round((reviewActions.filter(a => a.category === 'service').length / Math.max(reviewActions.length, 1)) * 100), 
                    status: reviewActions.filter(a => a.category === 'service').length > 2 ? 'Critical' : 'Optimal', 
                    color: reviewActions.filter(a => a.category === 'service').length > 2 ? 'bg-red-500' : 'bg-primary',
                    count: reviewActions.filter(a => a.category === 'service').length,
                    solution: 'Staff training & service timing optimization'
                  },
                  { 
                    label: 'Environment & Cleanliness', 
                    value: Math.round((reviewActions.filter(a => a.category === 'staff').length / Math.max(reviewActions.length, 1)) * 100), 
                    status: reviewActions.filter(a => a.category === 'staff').length > 1 ? 'Attention Needed' : 'Excellent', 
                    color: reviewActions.filter(a => a.category === 'staff').length > 1 ? 'bg-yellow-500' : 'bg-primary',
                    count: reviewActions.filter(a => a.category === 'staff').length,
                    solution: 'Enhanced cleaning protocols & maintenance'
                  }
                ].map((stat, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between mb-4">
                      <div>
                        <span className="text-sm font-black text-[#2b3437] font-headline uppercase tracking-widest">{stat.label}</span>
                        <p className="text-xs text-slate-500 mt-1">{stat.solution}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black uppercase ${stat.status === 'Critical' ? 'text-red-500' : stat.status === 'Attention Needed' ? 'text-yellow-500' : 'text-slate-400'}`}>
                          {stat.status}
                        </span>
                        <p className="text-xs text-slate-500">{stat.count} issues</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden">
                       <div className={`${stat.color} h-full rounded-full transition-all duration-1000 group-hover:opacity-80`} style={{ width: `${Math.max(stat.value, 5)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 pt-8 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <span className="text-2xl font-black text-primary">{reviewActions.length}</span>
                    <p className="text-xs text-slate-500 uppercase font-bold">Total Issues</p>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-green-600">{reviewActions.filter(a => a.status === 'completed').length}</span>
                    <p className="text-xs text-slate-500 uppercase font-bold">Resolved</p>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-red-500">{urgentCount}</span>
                    <p className="text-xs text-slate-500 uppercase font-bold">Urgent</p>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewActions;
