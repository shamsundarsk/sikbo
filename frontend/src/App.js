import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import SalesInput from './components/SalesInput';
import MenuManager from './components/MenuManager';
import './App.css';

const API_BASE = 'http://localhost:5001/api';

function App() {
  const [data, setData] = useState({
    sales: {},
    reviews: [],
    trends: [],
    recommendations: [],
    menu: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analytics, trends, recommendations, menu] = await Promise.all([
        axios.get(`${API_BASE}/analytics`),
        axios.get(`${API_BASE}/trends`),
        axios.get(`${API_BASE}/recommendations`),
        axios.get(`${API_BASE}/menu`)
      ]);

      // Also fetch trending data from ML service
      let mlTrends = [];
      try {
        const mlResponse = await axios.post('http://localhost:8001/scrape', {});
        mlTrends = mlResponse.data.trends || [];
      } catch (error) {
        console.log('Could not fetch ML trends');
      }

      setData({
        sales: analytics.data.sales,
        reviews: analytics.data.reviews,
        trends: mlTrends,
        recommendations: recommendations.data,
        menu: menu.data
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSales = async (salesData) => {
    try {
      await axios.post(`${API_BASE}/sales`, salesData);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding sales:', error);
    }
  };

  const addMenuItem = async (menuData) => {
    try {
      await axios.post(`${API_BASE}/menu`, menuData);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading SIKBO...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">SIKBO</h1>
              <span className="ml-2 text-sm text-gray-500">Restaurant Analytics</span>
            </div>
            <div className="flex space-x-4 items-center">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'menu' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Menu
              </button>
              <button
                onClick={() => setActiveTab('input')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'input' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Add Sales
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'menu' && <MenuManager menu={data.menu} onAddMenuItem={addMenuItem} />}
        {activeTab === 'input' && <SalesInput onAddSales={addSales} menu={data.menu} />}
      </main>
    </div>
  );
}

export default App;