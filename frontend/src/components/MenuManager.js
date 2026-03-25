import React, { useState, useEffect } from 'react';
import { safeToFixed, formatCurrency } from '../utils/formatters';

const MenuManager = ({ menu, onAddMenuItem }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sellingPrice: '',
    costPrice: '',
    description: ''
  });

  const categories = ['Beverages', 'Food', 'Desserts', 'Snacks'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.category && formData.sellingPrice) {
      onAddMenuItem({
        name: formData.name,
        category: formData.category,
        sellingPrice: parseFloat(formData.sellingPrice),
        costPrice: parseFloat(formData.costPrice) || 0,
        description: formData.description
      });
      setFormData({ name: '', category: '', sellingPrice: '', costPrice: '', description: '' });
      setShowAddForm(false);
      alert('Menu item added successfully!');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const groupedMenu = menu.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showAddForm ? 'Cancel' : 'Add Menu Item'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Menu Item</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Item Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Cold Coffee"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">
                Selling Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                name="sellingPrice"
                id="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 120"
                required
              />
            </div>

            <div>
              <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700">
                Cost Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                name="costPrice"
                id="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 80"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Menu Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedMenu).map(([category, items]) => (
          <div key={category} className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{category}</h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-500">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">₹{item.sellingPrice || item.price}</div>
                      {item.costPrice && (
                        <div className="text-sm text-gray-500">Cost: ₹{item.costPrice}</div>
                      )}
                      {item.costPrice && (
                        <div className="text-xs text-blue-600">
                          Profit: ₹{typeof item.sellingPrice === 'number' && typeof item.costPrice === 'number' 
                            ? ((item.sellingPrice || item.price) - item.costPrice).toFixed(0)
                            : '0'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {menu.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <p className="text-lg">No menu items yet</p>
            <p className="text-sm">Add your first menu item to get started</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;