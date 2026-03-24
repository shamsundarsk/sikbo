import React, { useState } from 'react';

const SalesInput = ({ onAddSales, menu }) => {
  const [formData, setFormData] = useState({
    dish: '',
    orders: '',
    revenue: '',
    costPerItem: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.dish && formData.orders && formData.revenue) {
      onAddSales({
        dish: formData.dish,
        orders: parseInt(formData.orders),
        revenue: parseFloat(formData.revenue),
        costPerItem: parseFloat(formData.costPerItem) || 0
      });
      setFormData({ dish: '', orders: '', revenue: '', costPerItem: '' });
      alert('Sales data added successfully!');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Get unique dish names from menu
  const menuDishes = [...new Set(menu.map(item => item.name))];

  return (
    <div className="max-w-md mx-auto bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Sales Data</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="dish" className="block text-sm font-medium text-gray-700">
              Dish Name
            </label>
            <select
              name="dish"
              id="dish"
              value={formData.dish}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a dish</option>
              {menuDishes.map((dish, index) => (
                <option key={index} value={dish}>{dish}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {menuDishes.length === 0 ? 'Add menu items first' : `${menuDishes.length} dishes available`}
            </p>
          </div>

          <div>
            <label htmlFor="orders" className="block text-sm font-medium text-gray-700">
              Number of Orders
            </label>
            <input
              type="number"
              name="orders"
              id="orders"
              value={formData.orders}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., 25"
              required
            />
          </div>

          <div>
            <label htmlFor="revenue" className="block text-sm font-medium text-gray-700">
              Revenue (₹)
            </label>
            <input
              type="number"
              step="0.01"
              name="revenue"
              id="revenue"
              value={formData.revenue}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., 2500"
              required
            />
          </div>

          <div>
            <label htmlFor="costPerItem" className="block text-sm font-medium text-gray-700">
              Cost Per Item (₹) - Optional
            </label>
            <input
              type="number"
              step="0.01"
              name="costPerItem"
              id="costPerItem"
              value={formData.costPerItem}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., 80"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter cost to calculate profit automatically
            </p>
          </div>

          <button
            type="submit"
            disabled={menuDishes.length === 0}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {menuDishes.length === 0 ? 'Add Menu Items First' : 'Add Sales Data'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SalesInput;