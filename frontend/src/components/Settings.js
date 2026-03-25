import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {
  const [settings, setSettings] = useState({
    restaurantName: '',
    googleMapsUrl: '',
    instagramHandle: '',
    location: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/settings');
      if (response.data.success) {
        // Ensure all fields have default values to prevent controlled/uncontrolled input issues
        setSettings({
          restaurantName: response.data.data.restaurantName || '',
          googleMapsUrl: response.data.data.googleMapsUrl || '',
          instagramHandle: response.data.data.instagramHandle || '',
          location: response.data.data.location || '',
          currency: response.data.data.currency || 'INR',
          timezone: response.data.data.timezone || 'Asia/Kolkata'
        });
      }
    } catch (error) {
      console.log('No existing settings found, using defaults');
      // Keep default empty values
    }
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value || ''  // Ensure value is never undefined
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/settings', settings);
      if (response.data.success) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error saving settings');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const testGoogleScraping = async () => {
    if (!settings.googleMapsUrl) {
      setMessage('Please enter Google Maps URL first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8001/scrape', {
        google_url: settings.googleMapsUrl
      });
      
      if (response.data.status === 'success') {
        setMessage(`Scraping test successful! Found ${response.data.reviews.length} reviews and ${response.data.trends.length} trends`);
      }
    } catch (error) {
      setMessage('Scraping test failed');
    } finally {
      setLoading(false);
    }
  };

  const extractMenuFromReviews = async () => {
    if (!settings.googleMapsUrl) {
      setMessage('Please enter Google Maps URL first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/extract-menu', {
        googleUrl: settings.googleMapsUrl
      });
      
      if (response.data.success) {
        setMessage(`Menu extraction successful! Found ${response.data.extracted} items, added ${response.data.added} new menu items from ${response.data.reviews} reviews`);
      }
    } catch (error) {
      setMessage('Menu extraction failed');
    } finally {
      setLoading(false);
    }
  };

  const setDefaultCafe = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/set-default-cafe');
      
      if (response.data.success) {
        setSettings(response.data.data);
        setMessage('Default cafe (The French Door) settings loaded successfully!');
      }
    } catch (error) {
      setMessage('Error setting default cafe');
    } finally {
      setLoading(false);
    }
  };

  const refreshTrends = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/trends');
      setMessage(`Trends refreshed! Found ${response.data.length} trending dishes`);
    } catch (error) {
      setMessage('Error refreshing trends');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Restaurant Settings</h3>
          
          {message && (
            <div className={`mb-4 p-3 rounded-md ${message.includes('Error') || message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  id="restaurantName"
                  value={settings.restaurantName}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Cafe Delight"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={settings.location}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Mumbai, India"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="googleMapsUrl" className="block text-sm font-medium text-gray-700">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  name="googleMapsUrl"
                  id="googleMapsUrl"
                  value={settings.googleMapsUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://maps.google.com/place/your-restaurant"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Used for scraping customer reviews and sentiment analysis
                </p>
              </div>

              <div>
                <label htmlFor="instagramHandle" className="block text-sm font-medium text-gray-700">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  name="instagramHandle"
                  id="instagramHandle"
                  value={settings.instagramHandle}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="@your_restaurant"
                />
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  name="currency"
                  id="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* AI & Analytics Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">AI & Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <button
              onClick={setDefaultCafe}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Load Default Cafe (French Door)'}
            </button>

            <button
              onClick={testGoogleScraping}
              disabled={loading || !settings.googleMapsUrl}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Testing...' : 'Test Google Reviews Scraping'}
            </button>

            <button
              onClick={extractMenuFromReviews}
              disabled={loading || !settings.googleMapsUrl}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Extracting...' : 'Auto-Extract Menu from Reviews'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={refreshTrends}
              disabled={loading}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-400"
            >
              {loading ? 'Refreshing...' : 'Refresh Trending Analysis'}
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <h4 className="font-medium text-blue-900 mb-2">🎯 Real Data Integration</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• <strong>Load Default Cafe:</strong> Sets up The French Door cafe with real Google Maps URL</p>
              <p>• <strong>Test Scraping:</strong> Validates Google Maps review extraction</p>
              <p>• <strong>Auto-Extract Menu:</strong> Automatically finds menu items from customer reviews</p>
              <p>• <strong>Real Reviews:</strong> Processes actual customer feedback with sentiment analysis</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">AI Features Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Sentiment Analysis:</span>
                <span className="text-green-600">✅ Active</span>
              </div>
              <div className="flex justify-between">
                <span>Trend Detection:</span>
                <span className="text-green-600">✅ Active</span>
              </div>
              <div className="flex justify-between">
                <span>Decision Engine:</span>
                <span className="text-green-600">✅ Active</span>
              </div>
              <div className="flex justify-between">
                <span>Google Reviews Scraping:</span>
                <span className="text-green-600">✅ Real Data</span>
              </div>
              <div className="flex justify-between">
                <span>Menu Auto-Extraction:</span>
                <span className="text-green-600">✅ Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;