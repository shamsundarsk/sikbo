import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Settings as SettingsIcon, 
  ChefHat, 
  MessageSquare, 
  Package, 
  UserCheck,
  Home,
  Coffee
} from 'lucide-react';

// Import components
import Dashboard from './components/Dashboard';
import FoodAnalytics from './components/FoodAnalytics';
import ServiceAnalytics from './components/ServiceAnalytics';
import CustomerFlow from './components/CustomerFlow';
import StaffManagement from './components/StaffManagement';
import MenuManager from './components/MenuManager';
import IntelligentMenuAnalysis from './components/IntelligentMenuAnalysis';
import RawMaterials from './components/RawMaterials';
import Trends from './components/Trends';
import ReviewActions from './components/ReviewActions';
import Settings from './components/Settings';
import SalesInput from './components/SalesInput';

import './App.css';

const API_BASE = 'http://localhost:5001/api';

function App() {
  const [data, setData] = useState({
    sales: {},
    reviews: [],
    trends: [],
    recommendations: [],
    menu: [],
    staff: [],
    sentimentBreakdown: {},
    serviceAnalytics: {},
    staffAnalytics: {},
    customerFlow: {},
    reviewActions: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        analytics, 
        trends, 
        recommendations, 
        menu, 
        staff,
        serviceAnalytics,
        staffAnalytics,
        customerFlow
      ] = await Promise.all([
        axios.get(`${API_BASE}/analytics`),
        axios.get(`${API_BASE}/trends`),
        axios.get(`${API_BASE}/recommendations`),
        axios.get(`${API_BASE}/menu`),
        axios.get(`${API_BASE}/staff`),
        axios.get(`${API_BASE}/service-analytics`),
        axios.get(`${API_BASE}/staff-analytics`),
        axios.get(`${API_BASE}/customer-flow`)
      ]);

      setData({
        sales: analytics.data.sales,
        reviews: analytics.data.reviews,
        sentimentBreakdown: analytics.data.sentimentBreakdown,
        trends: trends.data,
        recommendations: recommendations.data,
        menu: menu.data,
        staff: staff.data,
        serviceAnalytics: serviceAnalytics.data,
        staffAnalytics: staffAnalytics.data,
        customerFlow: customerFlow.data,
        totalRevenue: analytics.data.totalRevenue,
        totalProfit: analytics.data.totalProfit,
        totalReviews: analytics.data.totalReviews
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

  const addStaff = async (staffData) => {
    try {
      await axios.post(`${API_BASE}/staff`, staffData);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  // Sidebar navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'food-analytics', label: 'Food Analytics', icon: Coffee },
    { id: 'service-analytics', label: 'Service Analytics', icon: UserCheck },
    { id: 'customer-flow', label: 'Customer Flow', icon: Users },
    { id: 'staff-management', label: 'Staff Management', icon: Users },
    { id: 'menu-management', label: 'Menu Management', icon: ChefHat },
    { id: 'intelligent-menu', label: 'AI Menu Analysis', icon: Coffee },
    { id: 'raw-materials', label: 'Raw Materials', icon: Package },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'review-actions', label: 'Review Actions', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading Restaurant Intelligence System...</div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={data} />;
      case 'food-analytics':
        return <FoodAnalytics data={data} />;
      case 'service-analytics':
        return <ServiceAnalytics data={data} />;
      case 'customer-flow':
        return <CustomerFlow data={data} />;
      case 'staff-management':
        return <StaffManagement data={data} onAddStaff={addStaff} />;
      case 'menu-management':
        return <MenuManager menu={data.menu} onAddMenuItem={addMenuItem} />;
      case 'intelligent-menu':
        return <IntelligentMenuAnalysis />;
      case 'raw-materials':
        return <RawMaterials data={data} />;
      case 'trends':
        return <Trends data={data} />;
      case 'review-actions':
        return <ReviewActions data={data} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">SIKBO</h1>
          <p className="text-sm text-gray-500 mt-1">Restaurant Intelligence</p>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={() => setActiveTab('sales-input')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Add Sales Data
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === 'dashboard' && 'Overview of your restaurant performance'}
                {activeTab === 'food-analytics' && 'Analyze food performance and sentiment'}
                {activeTab === 'service-analytics' && 'Monitor service quality and feedback'}
                {activeTab === 'customer-flow' && 'Track customer patterns and peak hours'}
                {activeTab === 'staff-management' && 'Manage staff and performance'}
                {activeTab === 'menu-management' && 'Manage menu items and categories'}
                {activeTab === 'intelligent-menu' && 'AI-powered menu analysis prioritizing customer satisfaction'}
                {activeTab === 'raw-materials' && 'Track ingredient costs and optimization'}
                {activeTab === 'trends' && 'Discover trending dishes and opportunities'}
                {activeTab === 'review-actions' && 'Manage review responses and actions'}
                {activeTab === 'settings' && 'Configure system settings'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <button
                onClick={fetchData}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'sales-input' ? (
            <SalesInput onAddSales={addSales} menu={data.menu} />
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
}

export default App;