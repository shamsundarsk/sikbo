const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function populateSampleData() {
  console.log('🚀 Populating SIKBO with sample data...');
  
  try {
    // Add sample menu items
    console.log('📋 Adding menu items...');
    const menuItems = [
      { name: 'Cappuccino', category: 'Beverages', sellingPrice: 120, costPrice: 40, description: 'Rich espresso with steamed milk foam' },
      { name: 'Americano', category: 'Beverages', sellingPrice: 100, costPrice: 30, description: 'Classic black coffee' },
      { name: 'Avocado Toast', category: 'Food', sellingPrice: 280, costPrice: 120, description: 'Fresh avocado on sourdough bread' },
      { name: 'Chicken Burger', category: 'Food', sellingPrice: 350, costPrice: 180, description: 'Grilled chicken with fresh vegetables' },
      { name: 'Margherita Pizza', category: 'Food', sellingPrice: 450, costPrice: 200, description: 'Classic tomato and mozzarella pizza' },
      { name: 'Caesar Salad', category: 'Food', sellingPrice: 320, costPrice: 140, description: 'Fresh romaine with caesar dressing' },
      { name: 'Chocolate Brownie', category: 'Desserts', sellingPrice: 180, costPrice: 60, description: 'Rich chocolate brownie with ice cream' },
      { name: 'Tiramisu', category: 'Desserts', sellingPrice: 220, costPrice: 80, description: 'Classic Italian dessert' }
    ];

    for (const item of menuItems) {
      await axios.post(`${API_BASE}/menu`, item);
    }
    console.log(`✅ Added ${menuItems.length} menu items`);

    // Add sample sales data
    console.log('💰 Adding sales data...');
    const salesData = [
      { dish: 'Cappuccino', orders: 45, revenue: 5400, costPerItem: 40 },
      { dish: 'Americano', orders: 32, revenue: 3200, costPerItem: 30 },
      { dish: 'Avocado Toast', orders: 28, revenue: 7840, costPerItem: 120 },
      { dish: 'Chicken Burger', orders: 22, revenue: 7700, costPerItem: 180 },
      { dish: 'Margherita Pizza', orders: 18, revenue: 8100, costPerItem: 200 },
      { dish: 'Caesar Salad', orders: 15, revenue: 4800, costPerItem: 140 },
      { dish: 'Chocolate Brownie', orders: 25, revenue: 4500, costPerItem: 60 },
      { dish: 'Tiramisu', orders: 12, revenue: 2640, costPerItem: 80 }
    ];

    for (const sale of salesData) {
      await axios.post(`${API_BASE}/sales`, sale);
    }
    console.log(`✅ Added ${salesData.length} sales records`);

    // Add sample reviews
    console.log('⭐ Adding sample reviews...');
    const reviews = [
      { text: 'Amazing cappuccino! The foam art was beautiful and taste was perfect.', sentiment: 'positive', category: 'food', dish: 'Cappuccino' },
      { text: 'Great service, staff was very friendly and attentive.', sentiment: 'positive', category: 'service', serviceScore: 5 },
      { text: 'The avocado toast was fresh and delicious. Highly recommend!', sentiment: 'positive', category: 'food', dish: 'Avocado Toast' },
      { text: 'Pizza was a bit cold when it arrived, but still tasty.', sentiment: 'neutral', category: 'food', dish: 'Margherita Pizza' },
      { text: 'Waited too long for our order. Service needs improvement.', sentiment: 'negative', category: 'service', serviceScore: 2 },
      { text: 'The burger was overcooked and dry. Not worth the price.', sentiment: 'negative', category: 'food', dish: 'Chicken Burger' },
      { text: 'Excellent tiramisu! Best dessert I\'ve had in a while.', sentiment: 'positive', category: 'food', dish: 'Tiramisu' },
      { text: 'Clean restaurant with good ambiance. Will come back!', sentiment: 'positive', category: 'service', serviceScore: 4 },
      { text: 'Coffee was too bitter for my taste, but the brownie was amazing.', sentiment: 'neutral', category: 'food', dish: 'Americano' },
      { text: 'Staff member John was extremely helpful and made great recommendations.', sentiment: 'positive', category: 'staff', staffMentions: ['John'] }
    ];

    // Note: We'll add reviews directly via a custom endpoint since the Review model might not be accessible via API
    console.log('📝 Reviews will be added via ML service integration...');

    // Add sample staff
    console.log('👥 Adding staff members...');
    const staff = [
      { name: 'John Smith', role: 'Waiter', rating: 4.5, reviewCount: 25, positiveReviews: 20, negativeReviews: 2 },
      { name: 'Sarah Johnson', role: 'Chef', rating: 4.8, reviewCount: 30, positiveReviews: 28, negativeReviews: 1 },
      { name: 'Mike Wilson', role: 'Bartender', rating: 4.2, reviewCount: 18, positiveReviews: 15, negativeReviews: 2 },
      { name: 'Emma Davis', role: 'Manager', rating: 4.6, reviewCount: 22, positiveReviews: 19, negativeReviews: 1 }
    ];

    for (const member of staff) {
      await axios.post(`${API_BASE}/staff`, member);
    }
    console.log(`✅ Added ${staff.length} staff members`);

    // Set default restaurant settings
    console.log('⚙️ Setting up restaurant configuration...');
    await axios.post(`${API_BASE}/set-default-cafe`);
    console.log('✅ Restaurant settings configured');

    console.log('\n🎉 Sample data population completed successfully!');
    console.log('📊 Dashboard should now display:');
    console.log('   • Menu items with pricing');
    console.log('   • Sales data and revenue');
    console.log('   • Staff information');
    console.log('   • Restaurant settings');
    console.log('\n🌐 Open http://localhost:3000 to view the dashboard');

  } catch (error) {
    console.error('❌ Error populating data:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the population script
populateSampleData();