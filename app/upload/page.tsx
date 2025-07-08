"use client"

import type React from "react"
import { useState, type FormEvent, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  UploadCloud, Wand2, Edit3, CheckCircle, AlertTriangle, Loader2, PlusCircle, Trash2, Clock, ChefHat, Globe, Leaf
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

import { aiService, type AIRecipeAnalysis } from "@/lib/ai-service"
import ProtectedRoute from "@/components/protected-route"

interface StoreProduct {
  id: string
  name: string
  price: string
  imageUrl: string
}

interface Ingredient {
  id: string
  name: string
  quantity: string
  storeProduct?: StoreProduct
}

function UploadRecipePageContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [recipeName, setRecipeName] = useState("")
  const [recipeDescription, setRecipeDescription] = useState("")
  const [recipeImage, setRecipeImage] = useState<File | null>(null)
  const [recipeImageUrl, setRecipeImageUrl] = useState<string | null>(null)
  const [briefIngredients, setBriefIngredients] = useState("")
  const [generatedRecipe, setGeneratedRecipe] = useState<string | null>(null)
  const [extractedIngredients, setExtractedIngredients] = useState<Ingredient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isEditingRecipe, setIsEditingRecipe] = useState(false)
  const [editedRecipe, setEditedRecipe] = useState("")
  const [aiAnalysis, setAiAnalysis] = useState<AIRecipeAnalysis | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid File Type", description: "Please select a valid image file.", variant: "destructive" })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File Too Large", description: "Image must be under 5MB.", variant: "destructive" })
        return
      }
      setRecipeImage(file)
      setRecipeImageUrl(URL.createObjectURL(file))
    }
  }

  const handleUploadRecipe = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: "Not Authenticated", description: "Please sign in first.", variant: "destructive" })
      return
    }
    if (!recipeName.trim() || !recipeDescription.trim() || !recipeImage) {
      toast({ title: "Missing Information", description: "Please provide all fields.", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      const analysis = await aiService.analyzeIngredients(briefIngredients, recipeName)
      setAiAnalysis(analysis)
      const aiGeneratedRecipe = generateRecipeFromAnalysis(analysis, recipeName)
      setGeneratedRecipe(aiGeneratedRecipe)
      setEditedRecipe(aiGeneratedRecipe)
      const ingredients: Ingredient[] = analysis.ingredients.map((aiIng, index) => ({
        id: `ing-${index}-${Date.now()}`,
        name: aiIng.name,
        quantity: `${aiIng.quantity} ${aiIng.unit}`,
        storeProduct:
          analysis.productMatches.find(
            match =>
              match.name.toLowerCase().includes(aiIng.name.toLowerCase()) ||
              aiIng.name.toLowerCase().includes(match.name.toLowerCase())
          )
          || analysis.productMatches.find(match => match.category === aiIng.category)
          || undefined,
      }))
      setExtractedIngredients(ingredients)
      toast({
        title: "AI Recipe Generated!",
        description: "AI has generated a smart recipe with product matches.",
      })
    } catch (error) {
      console.error("Error generating recipe:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate recipe.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateRecipeFromAnalysis = (analysis: AIRecipeAnalysis, recipeName: string): string => {
    const { ingredients, cookingTime, difficulty, cuisine, dietaryInfo, instructions } = analysis
    let recipe = `# ${recipeName}\n\n`
    recipe += `**Cuisine:** ${cuisine} | **Difficulty:** ${difficulty} | **Time:** ${cookingTime}\n`
    if (dietaryInfo.length > 0) recipe += `**Dietary:** ${dietaryInfo.join(', ')}\n\n`
    recipe += `## Ingredients\n`
    ingredients.forEach(ing => {
      recipe += `- ${ing.quantity} ${ing.unit} ${ing.name} (${ing.category})\n`
    })
    recipe += `\n## Instructions\n`
    if (instructions && instructions.length > 0) {
      instructions.forEach((step, idx) => {
        recipe += `${idx + 1}. ${step}\n`
      })
    } else {
      recipe += 'No instructions provided.\n'
    }
    return recipe
  }

  const handleSwapIngredient = (id: string) => toast({ title: "Swap not implemented", variant: "default" })
  const handleRemoveIngredient = (id: string) => {
    setExtractedIngredients(prev => prev.filter(ing => ing.id !== id))
    toast({ title: "Ingredient Removed", variant: "default" })
  }
  const handleAddIngredient = () => {
    setExtractedIngredients(prev => [...prev, { id: `new-${Date.now()}`, name: "", quantity: "" }])
    toast({ title: "Ingredient Added", variant: "default" })
  }
  const handleSubmitRecipe = async () => toast({ title: "Submit not implemented", variant: "default" })
  const handleUploadAnother = () => {
    setRecipeName(""); setRecipeDescription(""); setRecipeImage(null); setRecipeImageUrl(null); setBriefIngredients(""); setGeneratedRecipe(null); setExtractedIngredients([]); setAiAnalysis(null)
  }
  const handleViewRecipes = () => router.push("/recipes")
  const handleEditIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setExtractedIngredients(prev => prev.map(ing => (ing.id === id ? { ...ing, [field]: value } : ing)))
  }

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload a recipe.",
        variant: "destructive",
      })
      router.push("/signin")
    }
  }, [user, authLoading, router])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto bg-white dark:bg-neutral-800">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <UploadCloud className="w-6 h-6 mr-2 text-yellow-500" />
            Upload Your Recipe
          </CardTitle>
          <CardDescription>Share your culinary creations with the community.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Always show the upload form at the top */}
          <form onSubmit={handleUploadRecipe} className="space-y-6 mb-8">
            <div className="space-y-2">
              <Label htmlFor="recipeName">Recipe Name *</Label>
              <Input
                id="recipeName"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                required
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipeDescription">Description *</Label>
              <Textarea
                id="recipeDescription"
                value={recipeDescription}
                onChange={(e) => setRecipeDescription(e.target.value)}
                required
                rows={4}
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="briefIngredients">Ingredients (comma separated) *</Label>
              <Input
                id="briefIngredients"
                value={briefIngredients}
                onChange={(e) => setBriefIngredients(e.target.value)}
                placeholder="e.g. 2 eggs, 1 cup flour, 1/2 cup sugar"
                required
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipeImage">Image *</Label>
              <Input
                id="recipeImage"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                required
                disabled={isUploading}
              />
              {recipeImageUrl && (
                <Image
                  src={recipeImageUrl}
                  alt="Preview"
                  width={300}
                  height={200}
                  className="rounded-md mt-2"
                />
              )}
            </div>
            <Button type="submit" disabled={isUploading || isLoading} className="w-full bg-yellow-500 hover:bg-yellow-600">
              {isUploading || isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</>
              ) : (
                <><UploadCloud className="w-4 h-4 mr-2" /> Upload & Analyze</>
              )}
            </Button>
          </form>
          {/* Show AI results only after analysis */}
          {aiAnalysis && (
            <Card className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="flex flex-col md:flex-row justify-between gap-4 py-4">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /><div><div className="text-xs text-muted-foreground">Cooking Time</div><div className="font-medium">{aiAnalysis.cookingTime}</div></div></div>
                <div className="flex items-center gap-2"><ChefHat className="w-4 h-4 text-green-500" /><div><div className="text-xs text-muted-foreground">Difficulty</div><div className="font-medium">{aiAnalysis.difficulty}</div></div></div>
                <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-purple-500" /><div><div className="text-xs text-muted-foreground">Cuisine</div><div className="font-medium">{aiAnalysis.cuisine}</div></div></div>
                <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-500" /><div><div className="text-xs text-muted-foreground">Dietary</div><div className="font-medium">{aiAnalysis.dietaryInfo && aiAnalysis.dietaryInfo.length > 0 ? aiAnalysis.dietaryInfo.join(', ') : 'Standard'}</div></div></div>
              </CardContent>
            </Card>
          )}
          {generatedRecipe && (
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-green-500" /><span className="text-lg font-semibold">Generated Recipe</span></div>
                <Button variant="ghost" size="sm" onClick={() => setIsEditingRecipe(!isEditingRecipe)}><Edit3 className="w-4 h-4 mr-1" /> {isEditingRecipe ? "Save" : "Edit"}</Button>
              </CardHeader>
              <CardContent>
                {isEditingRecipe ? (
                  <Textarea value={editedRecipe} onChange={e => setEditedRecipe(e.target.value)} rows={10} />
                ) : (
                  <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm">{editedRecipe}</pre>
                )}
              </CardContent>
            </Card>
          )}
          {extractedIngredients.length > 0 && (
            <Card className="mb-6">
              <CardHeader><span className="text-lg font-semibold flex items-center"><Wand2 className="w-5 h-5 mr-2 text-yellow-600" />AI-Enhanced Ingredients</span><CardDescription>Our AI has intelligently parsed your ingredients and matched them with NoName products.</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {extractedIngredients.map((ing) => {
                    const aiIngredient = aiAnalysis?.ingredients.find(ai => ai.name === ing.name)
                    // 优先显示商品图片，否则Spoonacular图片，否则占位图
                    const displayImage = (ing.storeProduct?.imageUrl && ing.storeProduct.imageUrl !== '/placeholder.svg')
                      ? ing.storeProduct.imageUrl
                      : aiIngredient?.imageUrl || '/placeholder.svg';
                    const displayName = ing.storeProduct?.name || ing.name;
                    const displayPrice = ing.storeProduct?.price || '';
                    return (
                      <Card key={ing.id} className="p-3 bg-gray-50 dark:bg-neutral-700/50 flex flex-col sm:flex-row gap-2 items-start">
                        <div className="flex-grow space-y-1">
                          <Input value={ing.name} onChange={e => handleEditIngredient(ing.id, "name", e.target.value)} placeholder="Ingredient Name" className="text-sm" />
                          <Input value={ing.quantity} onChange={e => handleEditIngredient(ing.id, "quantity", e.target.value)} placeholder="Quantity (e.g. 2 cups)" className="text-sm" />
                          {aiIngredient && (
                            <div className="text-xs text-muted-foreground">
                              <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-2">{aiIngredient.category}</span>
                              <span>{aiIngredient.description}</span>
                            </div>
                          )}
                        </div>
                        <div className="sm:w-48 flex-shrink-0 flex flex-col items-center">
                          <div className="flex flex-row items-center p-2 border dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800">
                            <Image
                              src={displayImage}
                              alt={displayName}
                              width={50}
                              height={50}
                              className="rounded-md object-cover border mr-2"
                            />
                            <div className="text-xs">
                              <p className="font-medium">{displayName}</p>
                              <p className="text-muted-foreground">{displayPrice}</p>
                            </div>
                          </div>
                          <Button variant="link" size="sm" onClick={() => handleSwapIngredient(ing.id)} className="text-xs text-yellow-600 dark:text-yellow-500 p-1">Swap Product</Button>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveIngredient(ing.id)} className="text-red-500 hover:text-red-600 flex-shrink-0"><Trash2 className="w-4 h-4" /></Button>
                      </Card>
                    )
                  })}
                  <Button variant="outline" size="sm" onClick={handleAddIngredient} className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"><PlusCircle className="w-4 h-4 mr-2" /> Add Ingredient</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {extractedIngredients.length > 0 && (
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 mt-4" onClick={handleSubmitRecipe} disabled={isLoading}>Confirm & Submit Recipe</Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function UploadRecipePage() {
  return (
    <ProtectedRoute message="Please sign in to upload a recipe.">
      <UploadRecipePageContent />
    </ProtectedRoute>
  )
}