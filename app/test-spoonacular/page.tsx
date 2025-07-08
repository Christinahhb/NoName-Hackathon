'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Search, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { spoonacularService } from '@/lib/spoonacular-service'

export default function TestSpoonacularPage() {
  const [query, setQuery] = useState('')
  const [ingredients, setIngredients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setIngredients([])

    try {
      const results = await spoonacularService.searchIngredients(query, 10)
      setIngredients(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败')
    } finally {
      setLoading(false)
    }
  }

  const handleTestBatch = async () => {
    const testIngredients = ['tomato', 'onion', 'garlic', 'olive oil', 'salt']
    setLoading(true)
    setError('')

    try {
      const imageMap = await spoonacularService.getIngredientImages(testIngredients)
      console.log('Batch image results:', imageMap)
      alert(`成功获取 ${imageMap.size} 个食材图片`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '批量测试失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="w-6 h-6 mr-2" />
            Spoonacular API 测试
          </CardTitle>
          <CardDescription>
            测试真实Spoonacular API食材搜索和图片获取功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 搜索表单 */}
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入食材名称 (如: tomato, onion, garlic)"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              搜索
            </Button>
            <Button variant="outline" onClick={handleTestBatch} disabled={loading}>
              批量测试
            </Button>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          {/* 搜索结果 */}
          {ingredients.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">搜索结果 ({ingredients.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ingredients.map((ingredient, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        {ingredient.image ? (
                          <Image
                            src={`https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`}
                            alt={ingredient.name}
                            width={60}
                            height={60}
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-15 h-15 bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-gray-500 text-xs">无图片</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{ingredient.name}</h4>
                          <p className="text-xs text-gray-500">{ingredient.aisle || '未知分类'}</p>
                          {ingredient.originalName && (
                            <p className="text-xs text-gray-400">原名: {ingredient.originalName}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-800 mb-2">使用说明</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 确保已设置 SPOONACULAR_API_KEY 环境变量</li>
                <li>• 搜索食材名称获取真实图片和信息</li>
                <li>• 批量测试会尝试获取常见食材的图片</li>
                <li>• 图片来自 Spoonacular 的真实食材数据库</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
} 