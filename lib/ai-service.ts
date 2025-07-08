// AI Service for intelligent ingredient processing and product matching
import { spoonacularService } from './spoonacular-service'

export interface AIIngredient {
  name: string
  quantity: string
  unit: string
  category: string
  description: string
  imageUrl?: string // 新增：食材图片URL
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
  instructions: string[]
}

export class AIService {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY
  }

  async analyzeIngredients(briefIngredients: string, recipeName: string): Promise<AIRecipeAnalysis> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is missing. Please set NEXT_PUBLIC_OPENAI_API_KEY or OPENAI_API_KEY.')
    }
    
    // 先调用OpenAI分析食材
    const analysis = await this.callOpenAI(briefIngredients, recipeName)
    
    // 为每个食材获取图片
    const ingredientsWithImages = await this.enrichIngredientsWithImages(analysis.ingredients)
    
    return {
      ...analysis,
      ingredients: ingredientsWithImages
    }
  }

  /**
   * 为食材添加Spoonacular图片
   */
  private async enrichIngredientsWithImages(ingredients: AIIngredient[]): Promise<AIIngredient[]> {
    try {
      // 获取所有食材名称
      const ingredientNames = ingredients.map(ing => ing.name)
      
      // 批量获取图片
      const imageMap = await spoonacularService.getIngredientImages(ingredientNames)
      
      // 为每个食材添加图片URL
      return ingredients.map(ingredient => ({
        ...ingredient,
        imageUrl: imageMap.get(ingredient.name.toLowerCase()) || undefined
      }))
    } catch (error) {
      console.error('Error enriching ingredients with images:', error)
      // 如果获取图片失败，返回原始食材数据
      return ingredients
    }
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
      throw new Error('Failed to analyze ingredients with OpenAI API. Please check your API key and try again.')
    }
  }
}

export const aiService = new AIService()