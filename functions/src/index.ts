import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { v4 as uuidv4 } from "uuid"
import * as Busboy from "busboy"

// Initialize Firebase Admin SDK
admin.initializeApp()
const db = admin.firestore()
const storage = admin.storage()

// Define CORS options
const cors = require("cors")({ origin: true })

// Types for API requests and responses
interface GenerateRecipeRequest {
  name: string
  recipeImage: File // This will be handled as multipart form data
  briefDescription: string
}

interface GenerateRecipeResponse {
  success: boolean
  data?: {
    draftId: string // ID to reference this draft later
    generatedRecipe: string
    extractedIngredients: ExtractedIngredient[]
    imageUrl: string // Temporary image URL
  }
  error?: string
  message?: string
}

interface ExtractedIngredient {
  id: string
  name: string
  quantity: string
  storeProduct?: {
    id: string
    name: string
    price: string
    imageUrl: string
  }
}

interface SubmitRecipeRequest {
  draftId: string // Reference to the draft created in generateRecipe
  recipeName: string
  briefIngredients: string
  fullRecipe: string
  ingredients: RecipeIngredient[]
}

interface RecipeIngredient {
  name: string
  quantity: string
  storeProductId?: string | null
  storeProductName?: string | null
  storeProductPrice?: string | null
  storeProductImageUrl?: string | null
}

interface SubmitRecipeResponse {
  success: boolean
  message: string
  recipeId?: string
  imageUrl?: string
  error?: string
  details?: string
}

// Helper function to authenticate user
async function authenticateUser(req: functions.Request): Promise<admin.auth.DecodedIdToken | null> {
  const idToken = req.headers.authorization?.split("Bearer ")[1]
  if (!idToken) {
    return null
  }

  try {
    return await admin.auth().verifyIdToken(idToken)
  } catch (error) {
    console.error("Error verifying ID token:", error)
    return null
  }
}

// Helper function to parse multipart form data
function parseMultipartData(req: functions.Request): Promise<{
  fields: { [key: string]: any }
  fileBuffer: Buffer | null
  fileMimeType: string | null
  originalFileName: string | null
}> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers })
    const fields: { [key: string]: any } = {}
    let fileBuffer: Buffer | null = null
    let fileMimeType: string | null = null
    let originalFileName: string | null = null

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      if (fieldname !== "recipeImage") {
        file.resume() // Ignore other files
        return
      }

      originalFileName = filename.filename
      fileMimeType = mimetype

      const chunks: Buffer[] = []
      file.on("data", (chunk) => {
        chunks.push(chunk)
      })
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks)
      })
      file.on("error", reject)
    })

    busboy.on("field", (fieldname, val) => {
      fields[fieldname] = val
    })

    busboy.on("finish", () => {
      resolve({ fields, fileBuffer, fileMimeType, originalFileName })
    })

    busboy.on("error", reject)

    req.pipe(busboy)
  })
}

// Helper function to validate image file
function validateImageFile(fileBuffer: Buffer | null, fileMimeType: string | null): { valid: boolean; error?: string } {
  if (!fileBuffer || !fileMimeType) {
    return { valid: false, error: "Image file is required" }
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  const maxFileSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(fileMimeType)) {
    return { valid: false, error: "Please upload a valid image file (JPG, PNG, GIF, WebP)" }
  }

  if (fileBuffer.length > maxFileSize) {
    return { valid: false, error: "Image file must be smaller than 5MB" }
  }

  return { valid: true }
}

// Real AI function to generate recipe using OpenAI API
async function generateRecipeWithAI(
  recipeName: string,
  briefDescription: string,
  imageBuffer: Buffer,
): Promise<{
  generatedRecipe: string
  extractedIngredients: ExtractedIngredient[]
}> {
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) {
    throw new Error('OpenAI API key is not configured')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
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
            content: `Recipe: ${recipeName}\nIngredients: ${briefDescription}\n\nPlease analyze and provide structured data with detailed, concrete, step-by-step instructions for this specific recipe. Strictly parse ingredient fields and ensure unique, relevant product matches.`
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

    const analysis = JSON.parse(content)
    
    // Convert AI analysis to our format
    const generatedRecipe = `# ${recipeName}

## Ingredients:
${analysis.ingredients.map(ing => `- ${ing.quantity} ${ing.unit} ${ing.name} (${ing.category})`).join('\n')}

## Instructions:
${analysis.instructions.map((step: string, idx: number) => `${idx + 1}. ${step}`).join('\n')}

## Recipe Info:
- **Cuisine:** ${analysis.cuisine}
- **Difficulty:** ${analysis.difficulty}
- **Cooking Time:** ${analysis.cookingTime}
- **Dietary:** ${analysis.dietaryInfo.join(', ') || 'Standard'}`

    const extractedIngredients: ExtractedIngredient[] = analysis.ingredients.map((ing: any, index: number) => ({
      id: `ing-${index}-${Date.now()}`,
      name: ing.name,
      quantity: `${ing.quantity} ${ing.unit}`,
      storeProduct: analysis.productMatches.find((match: any) => match.category === ing.category) ? {
        id: `prod-${index}-${Date.now()}`,
        name: analysis.productMatches.find((match: any) => match.category === ing.category)?.name || `NoName ${ing.name}`,
        price: analysis.productMatches.find((match: any) => match.category === ing.category)?.price || '$3.99',
        imageUrl: analysis.productMatches.find((match: any) => match.category === ing.category)?.imageUrl || `/placeholder.svg?width=50&height=50&text=${ing.name.charAt(0).toUpperCase()}`,
      } : undefined,
    }))

    return { generatedRecipe, extractedIngredients }
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    throw new Error('Failed to generate recipe with AI. Please try again.')
  }
}

// Cloud Function 1: Generate Recipe and Ingredients (Store as Draft)
export const generateRecipe = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "METHOD_NOT_ALLOWED",
        message: "Only POST requests are allowed.",
      } as GenerateRecipeResponse)
    }

    // Authenticate user
    const decodedToken = await authenticateUser(req)
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
        message: "Authentication required.",
      } as GenerateRecipeResponse)
    }

    const userId = decodedToken.uid
    const userName = decodedToken.name || decodedToken.email || "Anonymous Chef"

    try {
      // Parse multipart form data
      const { fields, fileBuffer, fileMimeType, originalFileName } = await parseMultipartData(req)

      const { name, briefDescription } = fields

      // Validate required fields
      if (!name || !briefDescription) {
        return res.status(400).json({
          success: false,
          error: "MISSING_FIELDS",
          message: "Recipe name and brief description are required.",
        } as GenerateRecipeResponse)
      }

      // Validate image file
      const imageValidation = validateImageFile(fileBuffer, fileMimeType)
      if (!imageValidation.valid) {
        return res.status(400).json({
          success: false,
          error: "INVALID_IMAGE",
          message: imageValidation.error,
        } as GenerateRecipeResponse)
      }

      // Upload image to Firebase Storage (temporary location)
      const bucket = storage.bucket()
      const draftId = uuidv4() // Generate unique draft ID
      const imageFileName = `${userId}/${draftId}-${originalFileName}`
      const file = bucket.file(`recipeDrafts/${imageFileName}`)

      await file.save(fileBuffer!, {
        metadata: {
          contentType: fileMimeType!,
        },
      })

      // Get temporary URL for the image
      const [imageUrl] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
      })

      // Generate recipe and ingredients using AI
      const { generatedRecipe, extractedIngredients } = await generateRecipeWithAI(name, briefDescription, fileBuffer!)

      // Store draft in Firestore
      const draftData = {
        draftId,
        userId,
        userName,
        recipeName: name,
        briefDescription,
        generatedRecipe,
        extractedIngredients,
        imageUrl,
        imagePath: `recipeDrafts/${imageFileName}`, // Store path for later use
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "draft", // Mark as draft
        expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // Expire in 24 hours
      }

      await db.collection("recipeDrafts").doc(draftId).set(draftData)

      return res.status(200).json({
        success: true,
        data: {
          draftId,
          generatedRecipe,
          extractedIngredients,
          imageUrl,
        },
        message: "Recipe and ingredients generated and saved as draft!",
      } as GenerateRecipeResponse)
    } catch (error) {
      console.error("Error in generateRecipe Cloud Function:", error)
      return res.status(500).json({
        success: false,
        error: "SERVER_ERROR",
        message: "An internal server error occurred during recipe generation.",
      } as GenerateRecipeResponse)
    }
  })
})

// Cloud Function 2: Submit Recipe (Convert Draft to Final Recipe)
export const submitRecipe = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "METHOD_NOT_ALLOWED",
        message: "Only POST requests are allowed.",
      } as SubmitRecipeResponse)
    }

    // Authenticate user
    const decodedToken = await authenticateUser(req)
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
        message: "Authentication token missing or invalid.",
      } as SubmitRecipeResponse)
    }

    const userId = decodedToken.uid

    try {
      // Parse form data (no file upload needed here, just text fields)
      const { fields } = await parseMultipartData(req)

      const { draftId, recipeName, briefIngredients, fullRecipe, ingredients: ingredientsString } = fields

      // Basic validation of received fields
      if (!draftId || !recipeName || !briefIngredients || !fullRecipe || !ingredientsString) {
        return res.status(400).json({
          success: false,
          error: "MISSING_FIELDS",
          message: "Missing required recipe information or draft ID.",
        } as SubmitRecipeResponse)
      }

      // Retrieve the draft from Firestore
      const draftDoc = await db.collection("recipeDrafts").doc(draftId).get()
      if (!draftDoc.exists) {
        return res.status(404).json({
          success: false,
          error: "DRAFT_NOT_FOUND",
          message: "Recipe draft not found or has expired.",
        } as SubmitRecipeResponse)
      }

      const draftData = draftDoc.data()!

      // Verify the draft belongs to the authenticated user
      if (draftData.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: "UNAUTHORIZED_DRAFT",
          message: "You are not authorized to submit this draft.",
        } as SubmitRecipeResponse)
      }

      // Parse and validate ingredients
      let ingredients: RecipeIngredient[]
      try {
        ingredients = JSON.parse(ingredientsString)
        if (!Array.isArray(ingredients)) {
          throw new Error("Ingredients must be an array.")
        }
        for (const ingredient of ingredients) {
          if (!ingredient.name || !ingredient.quantity) {
            throw new Error("Each ingredient must have a name and quantity.")
          }
        }
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "INVALID_INGREDIENTS_FORMAT",
          message: "Ingredients must be a valid JSON array with name and quantity for each item.",
        } as SubmitRecipeResponse)
      }

      // Move image from draft location to final location
      const bucket = storage.bucket()
      const draftImagePath = draftData.imagePath
      const finalImagePath = `recipeImages/${userId}/${uuidv4()}-${recipeName.replace(/[^a-zA-Z0-9]/g, "_")}`

      const draftFile = bucket.file(draftImagePath)
      const finalFile = bucket.file(finalImagePath)

      // Copy the file to the final location
      await draftFile.copy(finalFile)

      // Get permanent URL for the final image
      const [finalImageUrl] = await finalFile.getSignedUrl({
        action: "read",
        expires: "03-09-2491", // A far future date for effectively public read access
      })

      // Prepare final recipe data for Firestore
      const recipeData = {
        userId,
        userName: draftData.userName,
        recipeName,
        briefIngredients,
        fullRecipe,
        ingredients,
        imageUrl: finalImageUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        likes: 0,
        tags: [],
        difficulty: "medium",
        // Keep reference to original draft
        originalDraftId: draftId,
      }

      // Save final recipe to recipes collection
      const recipeDocRef = await db.collection("recipes").add(recipeData)

      // Clean up: Delete the draft and temporary image
      await db.collection("recipeDrafts").doc(draftId).delete()
      await draftFile.delete().catch(console.error) // Don't fail if cleanup fails

      return res.status(201).json({
        success: true,
        message: "Recipe submitted successfully!",
        recipeId: recipeDocRef.id,
        imageUrl: finalImageUrl,
      } as SubmitRecipeResponse)
    } catch (error) {
      console.error("Error in submitRecipe Cloud Function:", error)
      return res.status(500).json({
        success: false,
        error: "SERVER_ERROR",
        message: "An internal server error occurred during recipe submission.",
      } as SubmitRecipeResponse)
    }
  })
})

// Optional: Cloud Function to clean up expired drafts (run as scheduled function)
export const cleanupExpiredDrafts = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
  const now = admin.firestore.Timestamp.now()
  const expiredDraftsQuery = db.collection("recipeDrafts").where("expiresAt", "<=", now)

  const expiredDrafts = await expiredDraftsQuery.get()
  const batch = db.batch()
  const bucket = storage.bucket()

  for (const doc of expiredDrafts.docs) {
    const draftData = doc.data()

    // Delete the draft document
    batch.delete(doc.ref)

    // Delete the associated image file
    if (draftData.imagePath) {
      const file = bucket.file(draftData.imagePath)
      await file.delete().catch(console.error)
    }
  }

  await batch.commit()
  console.log(`Cleaned up ${expiredDrafts.size} expired recipe drafts`)
  return null
})
