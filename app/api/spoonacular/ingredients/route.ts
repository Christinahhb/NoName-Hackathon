import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const number = searchParams.get('number') || '5'

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    )
  }

  const apiKey = process.env.SPOONACULAR_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Spoonacular API key is not configured' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://api.spoonacular.com/food/ingredients/search?apiKey=${apiKey}&query=${encodeURIComponent(query)}&number=${number}&addChildren=true&fillIngredients=true`
    )

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching from Spoonacular:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ingredient data' },
      { status: 500 }
    )
  }
} 