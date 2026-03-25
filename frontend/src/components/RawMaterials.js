import React, { useState } from 'react';
import axios from 'axios';

function RawMaterials({ data }) {
  const [selectedDish, setSelectedDish] = useState('');
  const [rawMaterialData, setRawMaterialData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { sales } = data;
  const dishNames = Object.keys(sales);

  // Mock raw materials data
  const mockRawMaterials = {
    'Coffee': {
      dish: 'Coffee',
      ingredients: ['Coffee Beans', 'Milk', 'Sugar', 'Water'],
      quantities: [20, 150, 5, 200],
      costs: [15, 8, 2, 0.5],
      units: ['g', 'ml', 'g', 'ml'],
      total_cost: 0.26,
      breakdown: [
        { ingredient: 'Coffee Beans', quantity: 20, unit: 'g', cost: 15, total: 0.15 },
        { ingredient: 'Milk', quantity: 150, unit: 'ml', cost: 8, total: 0.08 },
        { ingredient: 'Sugar', quantity: 5, unit: 'g', cost: 2, total: 0.02 },
        { ingredient: 'Water', quantity: 200, unit: 'ml', cost: 0.5, total: 0.01 }
      ]
    },
    'Burger': {
      dish: 'Burger',
      ingredients: ['Bun', 'Patty', 'Lettuce', 'Tomato', 'Cheese', 'Sauce'],
      quantities: [1, 150, 20, 30, 20, 15],
      costs: [12, 45, 5, 8, 15, 3],
      units: ['piece', 'g', 'g', 'g', 'g', 'ml'],
      total_cost: 0.88,
      breakdown: [
        { ingredient: 'Bun', quantity: 1, unit: 'piece', cost: 12, total: 0.12 },
        { ingredient: 'Patty', quantity: 150, unit: 'g', cost: 45, total: 0.45 },
        { ingredient: 'Lettuce', quantity: 20, unit: 'g', cost: 5, total: 0.05 },
        { ingredient: 'Tomato', quantity: 30, unit: 'g', cost: 8, total: 0.08 },
        { ingredient: 'Cheese', quantity: 20, unit: 'g', cost: 15, total: 0.15 },
        { ingredient: 'Sauce', quantity: 15, unit: 'ml', cost: 3, total: 0.03 }
      ]
    },
    'Pizza': {
      dish: 'Pizza',
      ingredients: ['Dough', 'Tomato Sauce', 'Cheese', 'Toppings', 'Herbs'],
      quantities: [200, 50, 100, 80, 5],
      costs: [20, 8, 35, 25, 3],
      units: ['g', 'ml', 'g', 'g', 'g'],
      total_cost: 0.91,
      breakdown: [
        { ingredient: 'Dough', quantity: 200, unit: 'g', cost: 20, total: 0.20 },
        { ingredient: 'Tomato Sauce', quantity: 50, unit: 'ml', cost: 8, total: 0.08 },
        { ingredient: 'Cheese', quantity: 100, unit: 'g', cost: 35, total: 0.35 },
        { ingredient: 'Toppings', quantity: 80, unit: 'g', cost: 25, total: 0.25 },
        { ingredient: 'Herbs', quantity: 5, unit: 'g', cost: 3, total: 0.03 }
      ]
    }
  };

  const fetchRawMaterials = async (dishName) => {
    setLoading(true);
    try {
      // Try to fetch from API first
      const response = await axios.get(`http://localhost:5001/api/raw-materials/${dishName}`);
      setRawMaterialData(response.data);
    } catch (error) {
      // Fallback to mock data
      const mockData = mockRawMaterials[dishName] || {
        dish: dishName,
        ingredients: ['Unknown'],
        quantities: [1],
        costs: [50],
        units: ['unit'],
        total_cost: 0.50,
        breakdown: [{ ingredient: 'Unknown', quantity: 1, unit: 'unit', cost: 50, total: 0.50 }]
      };
      setRawMaterialData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleDishSelect = (dishName) => {
    setSelectedDish(dishName);
    fetchRawMaterials(dishName);
  };

  // Calculate cost optimization suggestions
  const getCostOptimization = (breakdown) => {
    const suggestions = [];
    breakdown.forEach(item => {
      if (item.total > 0.20) {
        suggestions.push({
          ingredient: item.ingredient,
          current_cost: item.total,
          suggestion: 'Consider bulk purchasing or alternative suppliers',
          potential_saving: typeof item.total === 'number' ? (item.total * 0.15).toFixed(2) : '0.00'
        });
      }
    });
    return suggestions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Raw Materials Cost Analysis</h2>
        <p className="text-gray-600 mb-4">
          Select a dish to view its ingredient breakdown, costs, and optimization suggestions.
        </p>
        
        {/* Dish Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {dishNames.map(dish => (
            <button
              key={dish}
              onClick={() => handleDishSelect(dish)}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                selectedDish === dish
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {dish}
            </button>
          ))}
        </div>
      </div>

      {/* Raw Materials Breakdown */}
      {selectedDish && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ingredient Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDish} - Ingredient Breakdown
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : rawMaterialData ? (
              <div className="space-y-4">
                {/* Total Cost Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-900">Total Raw Material Cost</span>
                    <span className="text-lg font-bold text-blue-900">₹{rawMaterialData.total_cost}</span>
                  </div>
                </div>

                {/* Ingredient List */}
                <div className="space-y-3">
                  {rawMaterialData.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.ingredient}</div>
                        <div className="text-sm text-gray-500">
                          {item.quantity} {item.unit} @ ₹{typeof item.cost === 'number' ? (item.cost / 100).toFixed(2) : '0.00'} per {item.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">₹{item.total}</div>
                        <div className="text-xs text-gray-500">
                          {typeof item.total === 'number' && typeof rawMaterialData.total_cost === 'number' && rawMaterialData.total_cost !== 0
                            ? ((item.total / rawMaterialData.total_cost) * 100).toFixed(1)
                            : '0.0'}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Profit Analysis */}
                {sales[selectedDish] && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Profit Analysis</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700">Selling Price:</span>
                        <span className="font-medium ml-2">
                          ₹{typeof sales[selectedDish].revenue === 'number' && typeof sales[selectedDish].orders === 'number' && sales[selectedDish].orders !== 0
                            ? (sales[selectedDish].revenue / sales[selectedDish].orders).toFixed(2)
                            : '0.00'}
                        </span>
                      </div>
                      <div>
                        <span className="text-green-700">Raw Material Cost:</span>
                        <span className="font-medium ml-2">₹{rawMaterialData.total_cost}</span>
                      </div>
                      <div>
                        <span className="text-green-700">Gross Profit:</span>
                        <span className="font-medium ml-2">
                          ₹{typeof sales[selectedDish].revenue === 'number' && typeof sales[selectedDish].orders === 'number' && sales[selectedDish].orders !== 0 && typeof rawMaterialData.total_cost === 'number'
                            ? ((sales[selectedDish].revenue / sales[selectedDish].orders) - rawMaterialData.total_cost).toFixed(2)
                            : '0.00'}
                        </span>
                      </div>
                      <div>
                        <span className="text-green-700">Profit Margin:</span>
                        <span className="font-medium ml-2">
                          {typeof sales[selectedDish].revenue === 'number' && typeof sales[selectedDish].orders === 'number' && sales[selectedDish].orders !== 0 && typeof rawMaterialData.total_cost === 'number'
                            ? (((sales[selectedDish].revenue / sales[selectedDish].orders) - rawMaterialData.total_cost) / 
                               (sales[selectedDish].revenue / sales[selectedDish].orders) * 100).toFixed(1)
                            : '0.0'}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Cost Optimization */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Optimization Suggestions</h3>
            
            {rawMaterialData && (
              <div className="space-y-4">
                {getCostOptimization(rawMaterialData.breakdown).map((suggestion, index) => (
                  <div key={index} className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-900">{suggestion.ingredient}</h4>
                        <p className="text-sm text-yellow-800 mt-1">{suggestion.suggestion}</p>
                        <p className="text-xs text-yellow-700 mt-2">
                          Potential saving: ₹{suggestion.potential_saving} per dish
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {getCostOptimization(rawMaterialData.breakdown).length === 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-800 font-medium">Cost structure looks optimized!</span>
                    </div>
                  </div>
                )}

                {/* Alternative Ingredients */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Alternative Ingredients</h4>
                  <div className="space-y-2">
                    {rawMaterialData.breakdown.slice(0, 3).map((item, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-900">
                            {item.ingredient} Alternative
                          </span>
                          <span className="text-sm text-blue-700">
                            Save ₹{typeof item.total === 'number' ? (item.total * 0.1).toFixed(2) : '0.00'}
                          </span>
                        </div>
                        <p className="text-xs text-blue-800 mt-1">
                          Consider local suppliers or seasonal alternatives
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overall Cost Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Raw Material Cost Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dish</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raw Material Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dishNames.map((dish) => {
                const dishSales = sales[dish];
                const avgSellingPrice = typeof dishSales?.revenue === 'number' && typeof dishSales?.orders === 'number' && dishSales.orders !== 0
                  ? dishSales.revenue / dishSales.orders
                  : 0;
                const rawCost = mockRawMaterials[dish]?.total_cost || 0.50;
                const grossProfit = avgSellingPrice - rawCost;
                const margin = avgSellingPrice !== 0 ? (grossProfit / avgSellingPrice) * 100 : 0;

                return (
                  <tr key={dish}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dish}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{typeof rawCost === 'number' ? rawCost.toFixed(2) : '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{typeof avgSellingPrice === 'number' ? avgSellingPrice.toFixed(2) : '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{typeof grossProfit === 'number' ? grossProfit.toFixed(2) : '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{typeof margin === 'number' ? margin.toFixed(1) : '0.0'}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        margin > 60 ? 'bg-green-100 text-green-800' :
                        margin > 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {margin > 60 ? 'Excellent' : margin > 40 ? 'Good' : 'Poor'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RawMaterials;