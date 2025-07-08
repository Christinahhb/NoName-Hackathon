// AI Service for intelligent ingredient processing and product matching
export interface AIIngredient {
  name: string
  quantity: string
  unit: string
  category: string
  description: string
}

export interface AIProductMatch {
  id: string
  name: string
  price: string
  imageUrl: string
  confidence: number
  category: string
}

export interface AIRecipeAnalysis {
  ingredients: AIIngredient[]
  productMatches: AIProductMatch[]
  cookingTime: string
  difficulty: string
  cuisine: string
  dietaryInfo: string[]
  instructions: string[] // 新增
}

// Mock AI service - replace with actual AI API calls
export class AIService {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY
  }

  async analyzeIngredients(briefIngredients: string, recipeName: string): Promise<AIRecipeAnalysis> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is missing. Please set NEXT_PUBLIC_OPENAI_API_KEY or OPENAI_API_KEY.')
    }
    return this.callOpenAI(briefIngredients, recipeName)
  }

  private async callOpenAI(briefIngredients: string, recipeName: string): Promise<AIRecipeAnalysis> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert culinary AI assistant. Analyze the given ingredients and recipe name to:
1. For each ingredient, strictly extract:
   - name (e.g. 'mushroom spaghetti sauce')
   - quantity (e.g. '3')
   - unit (e.g. '12 ounce jars')
   - category (e.g. 'sauce')
   - description (e.g. 'A tomato-based sauce that includes mushrooms.')
2. For productMatches, ensure each ingredient matches to a unique, relevant product (no duplicates, no generic matches). If no match, leave blank. Use a placeholder image URL (e.g. '/placeholder.svg') if no real image is available.
3. Provide cooking time, difficulty, cuisine type, and dietary information.
4. Generate detailed, step-by-step cooking instructions for the recipe. Each step should be specific, actionable, and tailored to the ingredients and cuisine. Do not use generic phrases like 'prepare all ingredients' or 'follow standard procedures'.
5. Return the response as valid JSON with the following structure:
{
  "ingredients": [
    {
      "name": "...",
      "quantity": "...",
      "unit": "...",
      "category": "...",
      "description": "..."
    }
  ],
  "productMatches": [
    {
      "id": "...",
      "name": "...",
      "price": "...",
      "imageUrl": "...",
      "confidence": 0.95,
      "category": "..."
    }
  ],
  "cookingTime": "...",
  "difficulty": "...",
  "cuisine": "...",
  "dietaryInfo": ["..."],
  "instructions": ["Step 1...", "Step 2...", ...]
}`
            },
            {
              role: 'user',
              content: `Recipe: ${recipeName}\nIngredients: ${briefIngredients}\n\nPlease analyze and provide structured data with detailed, concrete, step-by-step instructions for this specific recipe. Strictly parse ingredient fields and ensure unique, relevant product matches.`
            }
          ],
          temperature: 0.3,
          max_tokens: 1200
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content
      
      if (!content) {
        throw new Error('No content received from OpenAI')
      }

      return JSON.parse(content)
    } catch (error) {
      console.error('OpenAI API error:', error)
      // Fallback to enhanced mock
      return this.enhancedMockAnalysis(briefIngredients, recipeName)
    }
  }

  private enhancedMockAnalysis(briefIngredients: string, recipeName: string): AIRecipeAnalysis {
    const ingredientList = briefIngredients.split(',').map(ing => ing.trim())
    
    // Enhanced ingredient parsing with better logic
    const ingredients: AIIngredient[] = ingredientList.map((ing, index) => {
      const quantity = this.extractQuantity(ing)
      const unit = this.extractUnit(ing)
      const name = this.extractName(ing)
      const category = this.categorizeIngredient(name)
      
      return {
        name,
        quantity: quantity || '1',
        unit: unit || 'unit',
        category,
        description: this.generateDescription(name, category)
      }
    })

    // Smart product matching based on ingredient categories
    const productMatches: AIProductMatch[] = ingredients.map((ing, index) => {
      const shouldMatch = Math.random() > 0.2 // 80% match rate
      if (!shouldMatch) return null

      const productName = this.generateProductName(ing.name, ing.category)
      const price = this.generatePrice(ing.category)
      const confidence = 0.7 + Math.random() * 0.3 // 70-100% confidence

      return {
        id: `prod-${index}-${Date.now()}`,
        name: productName,
        price,
        imageUrl: `/placeholder.svg?width=50&height=50&text=${ing.name.charAt(0).toUpperCase()}`,
        confidence,
        category: ing.category
      }
    }).filter(Boolean) as AIProductMatch[]

    return {
      ingredients,
      productMatches,
      cookingTime: this.estimateCookingTime(ingredients),
      difficulty: this.assessDifficulty(ingredients),
      cuisine: this.detectCuisine(recipeName, ingredients),
      dietaryInfo: this.analyzeDietaryInfo(ingredients),
      instructions: [
        `Preheat your oven to 180°C (350°F).`,
        `Prepare all ingredients as listed above.`,
        `Follow standard cooking procedures for ${recipeName}.`,
        `Cook for the recommended time.`,
        `Serve hot and enjoy!`
      ]
    }
  }

  private extractQuantity(ingredient: string): string {
    const quantityMatch = ingredient.match(/^(\d+(?:\.\d+)?)\s*/)
    return quantityMatch ? quantityMatch[1] : '1'
  }

  private extractUnit(ingredient: string): string {
    const units = ['cup', 'cups', 'tbsp', 'tablespoon', 'tablespoons', 'tsp', 'teaspoon', 'teaspoons', 'pound', 'pounds', 'lb', 'lbs', 'ounce', 'ounces', 'oz', 'gram', 'grams', 'g', 'kilogram', 'kilograms', 'kg', 'ml', 'milliliter', 'milliliters', 'l', 'liter', 'liters']
    
    for (const unit of units) {
      if (ingredient.toLowerCase().includes(unit)) {
        return unit
      }
    }
    return 'unit'
  }

  private extractName(ingredient: string): string {
    // Remove quantity and unit, clean up the name
    return ingredient
      .replace(/^\d+(?:\.\d+)?\s*/, '') // Remove quantity
      .replace(/\b(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|pound|pounds|lb|lbs|ounce|ounces|oz|gram|grams|g|kilogram|kilograms|kg|ml|milliliter|milliliters|l|liter|liters)\b/gi, '') // Remove units
      .trim()
      .replace(/\s+/g, ' ') // Clean up extra spaces
  }

  private categorizeIngredient(name: string): string {
    const categories = {
      protein: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'eggs', 'tofu', 'tempeh', 'lentils', 'beans'],
      vegetable: ['tomato', 'onion', 'garlic', 'carrot', 'celery', 'bell pepper', 'mushroom', 'spinach', 'kale', 'lettuce', 'cucumber', 'zucchini'],
      dairy: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream', 'cream cheese'],
      grain: ['rice', 'pasta', 'bread', 'flour', 'quinoa', 'oats', 'barley'],
      spice: ['salt', 'pepper', 'oregano', 'basil', 'thyme', 'rosemary', 'cumin', 'paprika', 'cinnamon'],
      fruit: ['apple', 'banana', 'orange', 'lemon', 'lime', 'strawberry', 'blueberry'],
      oil: ['olive oil', 'vegetable oil', 'coconut oil', 'sesame oil']
    }

    const lowerName = name.toLowerCase()
    for (const [category, items] of Object.entries(categories)) {
      if (items.some(item => lowerName.includes(item))) {
        return category
      }
    }
    return 'other'
  }

  private generateDescription(name: string, category: string): string {
    const descriptions = {
      protein: 'High-quality protein source',
      vegetable: 'Fresh and nutritious vegetable',
      dairy: 'Rich dairy product',
      grain: 'Wholesome grain product',
      spice: 'Aromatic spice for flavoring',
      fruit: 'Sweet and fresh fruit',
      oil: 'Healthy cooking oil',
      other: 'Essential cooking ingredient'
    }
    return descriptions[category as keyof typeof descriptions] || 'Essential cooking ingredient'
  }

  private generateProductName(name: string, category: string): string {
    const prefixes = {
      protein: 'NoName Premium',
      vegetable: 'NoName Fresh',
      dairy: 'NoName Dairy',
      grain: 'NoName Whole Grain',
      spice: 'NoName Spice',
      fruit: 'NoName Fresh',
      oil: 'NoName Pure',
      other: 'NoName'
    }
    const prefix = prefixes[category as keyof typeof prefixes] || 'NoName'
    return `${prefix} ${name.charAt(0).toUpperCase() + name.slice(1)}`
  }

  private generatePrice(category: string): string {
    const priceRanges = {
      protein: [3, 8],
      vegetable: [1, 4],
      dairy: [2, 6],
      grain: [1, 5],
      spice: [1, 3],
      fruit: [2, 5],
      oil: [3, 7],
      other: [1, 4]
    }
    const [min, max] = priceRanges[category as keyof typeof priceRanges] || [1, 4]
    return `$${(min + Math.random() * (max - min)).toFixed(2)}`
  }

  private estimateCookingTime(ingredients: AIIngredient[]): string {
    const hasProtein = ingredients.some(ing => ing.category === 'protein')
    const hasGrains = ingredients.some(ing => ing.category === 'grain')
    const ingredientCount = ingredients.length

    if (hasProtein && hasGrains && ingredientCount > 5) return '45-60 minutes'
    if (hasProtein && ingredientCount > 3) return '30-45 minutes'
    if (ingredientCount > 4) return '20-30 minutes'
    return '15-20 minutes'
  }

  private assessDifficulty(ingredients: AIIngredient[]): string {
    const ingredientCount = ingredients.length
    const hasMultipleCategories = new Set(ingredients.map(ing => ing.category)).size > 3

    if (ingredientCount > 8 || hasMultipleCategories) return 'Hard'
    if (ingredientCount > 5) return 'Medium'
    return 'Easy'
  }

  private detectCuisine(recipeName: string, ingredients: AIIngredient[]): string {
    const name = recipeName.toLowerCase()
    const ingredientNames = ingredients.map(ing => ing.name.toLowerCase())

    if (name.includes('pasta') || ingredientNames.some(ing => ing.includes('pasta'))) return 'Italian'
    if (name.includes('curry') || ingredientNames.some(ing => ing.includes('curry'))) return 'Indian'
    if (name.includes('taco') || name.includes('burrito') || ingredientNames.some(ing => ing.includes('tortilla'))) return 'Mexican'
    if (name.includes('sushi') || ingredientNames.some(ing => ing.includes('rice') && ing.includes('fish'))) return 'Japanese'
    if (name.includes('stir fry') || ingredientNames.some(ing => ing.includes('soy sauce'))) return 'Asian'
    
    return 'International'
  }

  private analyzeDietaryInfo(ingredients: AIIngredient[]): string[] {
    const dietaryInfo: string[] = []
    const ingredientNames = ingredients.map(ing => ing.name.toLowerCase())

    // Check for vegetarian
    const hasMeat = ingredients.some(ing => ing.category === 'protein' && 
      !['tofu', 'tempeh', 'lentils', 'beans'].some(veg => ing.name.toLowerCase().includes(veg)))
    if (!hasMeat) dietaryInfo.push('vegetarian')

    // Check for vegan
    const hasDairy = ingredients.some(ing => ing.category === 'dairy')
    if (!hasMeat && !hasDairy) dietaryInfo.push('vegan')

    // Check for gluten-free
    const hasGluten = ingredients.some(ing => 
      ing.category === 'grain' && !['quinoa', 'rice'].some(gf => ing.name.toLowerCase().includes(gf)))
    if (!hasGluten) dietaryInfo.push('gluten-free')

    return dietaryInfo
  }
}

export const aiService = new AIService()