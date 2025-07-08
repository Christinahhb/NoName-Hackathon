// Spoonacular Service for ingredient images and information
export interface SpoonacularIngredient {
  id: number
  name: string
  image: string
  aisle: string
  amount: number
  unit: string
  unitShort: string
  unitLong: string
  original: string
  originalName: string
  meta: string[]
  imageType: string
}

export interface SpoonacularSearchResult {
  results: SpoonacularIngredient[]
  offset: number
  number: number
  totalResults: number
}

export class SpoonacularService {
  private apiKey: string | undefined
  private baseUrl = 'https://api.spoonacular.com/food'

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || process.env.SPOONACULAR_API_KEY
  }

  /**
   * Search for ingredients by name
   */
  async searchIngredients(query: string, number: number = 5): Promise<SpoonacularIngredient[]> {
    try {
      const response = await fetch(
        `/api/spoonacular/ingredients?query=${encodeURIComponent(query)}&number=${number}`
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data: SpoonacularSearchResult = await response.json()
      return data.results || []
    } catch (error) {
      console.error('Error searching ingredients:', error)
      return []
    }
  }

  /**
   * Get ingredient information by ID
   */
  async getIngredientInfo(id: number): Promise<SpoonacularIngredient | null> {
    if (!this.apiKey) {
      console.warn('Spoonacular API key is missing.')
      return null
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/ingredients/${id}/information?apiKey=${this.apiKey}&amount=1&unit=piece`
      )

      if (!response.ok) {
        throw new Error(`Spoonacular API error: ${response.status}`)
      }

      const data: SpoonacularIngredient = await response.json()
      return data
    } catch (error) {
      console.error('Error getting ingredient info:', error)
      return null
    }
  }

  /**
   * Get the best matching ingredient image for a given ingredient name
   */
  async getIngredientImage(ingredientName: string): Promise<string | null> {
    try {
      const ingredients = await this.searchIngredients(ingredientName, 1)
      
      if (ingredients.length > 0 && ingredients[0].image) {
        return `https://spoonacular.com/cdn/ingredients_100x100/${ingredients[0].image}`
      }
      
      return null
    } catch (error) {
      console.error('Error getting ingredient image:', error)
      return null
    }
  }

  /**
   * Get ingredient images for multiple ingredients
   */
  async getIngredientImages(ingredientNames: string[]): Promise<Map<string, string>> {
    const imageMap = new Map<string, string>()
    
    // Process ingredients in parallel with rate limiting
    const batchSize = 3 // Process 3 at a time to avoid rate limits
    for (let i = 0; i < ingredientNames.length; i += batchSize) {
      const batch = ingredientNames.slice(i, i + batchSize)
      
      const promises = batch.map(async (name) => {
        const image = await this.getIngredientImage(name)
        return { name, image }
      })
      
      const results = await Promise.all(promises)
      
      results.forEach(({ name, image }) => {
        if (image) {
          imageMap.set(name.toLowerCase(), image)
        }
      })
      
      // Add a small delay between batches to be respectful to the API
      if (i + batchSize < ingredientNames.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
    
    return imageMap
  }

  /**
   * Get ingredient information with image for a single ingredient
   */
  async getIngredientWithImage(ingredientName: string): Promise<{
    name: string
    image: string | null
    aisle: string | null
    originalName: string | null
  }> {
    try {
      const ingredients = await this.searchIngredients(ingredientName, 1)
      
      if (ingredients.length > 0) {
        const ingredient = ingredients[0]
        return {
          name: ingredient.name,
          image: ingredient.image ? `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}` : null,
          aisle: ingredient.aisle || null,
          originalName: ingredient.originalName || null
        }
      }
      
      return {
        name: ingredientName,
        image: null,
        aisle: null,
        originalName: null
      }
    } catch (error) {
      console.error('Error getting ingredient with image:', error)
      return {
        name: ingredientName,
        image: null,
        aisle: null,
        originalName: null
      }
    }
  }
}

// Export a singleton instance
export const spoonacularService = new SpoonacularService() 