// Test script for Spoonacular API integration
const fetch = require('node-fetch');

async function testSpoonacularAPI() {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  
  if (!apiKey) {
    console.error('❌ SPOONACULAR_API_KEY environment variable is not set');
    console.log('Please set your Spoonacular API key:');
    console.log('export SPOONACULAR_API_KEY=your_api_key_here');
    return;
  }

  console.log('🧪 Testing Spoonacular API integration...\n');

  const testIngredients = ['tomato', 'onion', 'garlic', 'olive oil', 'salt', 'pepper'];

  for (const ingredient of testIngredients) {
    try {
      console.log(`🔍 Searching for: ${ingredient}`);
      
      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/search?apiKey=${apiKey}&query=${encodeURIComponent(ingredient)}&number=1&addChildren=true&fillIngredients=true`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        console.log(`✅ Found: ${result.name}`);
        console.log(`   Image: ${result.image ? '✅ Available' : '❌ Not available'}`);
        console.log(`   Aisle: ${result.aisle || 'Unknown'}`);
        if (result.image) {
          console.log(`   Image URL: https://spoonacular.com/cdn/ingredients_100x100/${result.image}`);
        }
      } else {
        console.log(`❌ No results found for: ${ingredient}`);
      }
      
      console.log('');
      
      // Add a small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`❌ Error searching for ${ingredient}:`, error.message);
      console.log('');
    }
  }

  console.log('🎉 Test completed!');
console.log('\n📝 Next steps:');
console.log('1. Make sure your API keys are set in .env.local');
console.log('2. Start your development server: npm run dev');
console.log('3. Visit /test-spoonacular to test the web interface');
console.log('4. Try uploading a recipe to see real AI analysis with ingredient images');
}

// Run the test
testSpoonacularAPI().catch(console.error); 