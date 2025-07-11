# NoName Recipes 🍳

## 🧠 Introduction

This project was developed for the **NoName Hackathon**, with a focus on **loyalty, social engagement, and rewards**.

The main goal is to build a platform where **students can share their daily recipes**, upload them to the NoName Recipe system, and receive help from an **AI assistant** to complete and enhance the recipes.

Once a recipe is published, **other students** can easily add all the required ingredients to their shopping cart with one click.

To encourage participation and community engagement, recipe authors earn **reward points** when their posts receive likes. These points can be redeemed for **discounts** — making cooking both **social and rewarding**.

> _Cook. Share. Earn. Let AI spice up your student life!_

## 🌟 Features

### Core Functionality
- **Recipe Upload & Sharing**: Upload recipes with images and get AI-generated full recipes
- **Smart Ingredient Management**: Automatic ingredient extraction and shopping cart integration
- **PCO Points System**: Earn rewards when others like your recipes or purchase ingredients
- **Student-Focused**: Campus-specific discounts and regional distribution hubs
- **Community Features**: Discover popular recipes on campus and connect with fellow foodies

### Technical Features
- **AI-Powered Analysis**: OpenAI GPT-4 integration for recipe generation
- **Real Ingredient Images**: Spoonacular API integration for authentic ingredient photos
- **Modern UI/UX**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first approach with dark mode support
- **Firebase Integration**: Authentication, database, and file storage
- **Code Editor**: Interactive code editing capabilities for developers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Firebase account
- OpenAI API key (optional)
- Spoonacular API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NoName-Hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # OpenAI API (optional)
   OPENAI_API_KEY=your_openai_api_key

   # Spoonacular API (optional)
   SPOONACULAR_API_KEY=your_spoonacular_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
NoName-Hackathon/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── upload/            # Recipe upload page
│   ├── recipes/           # Recipe browsing
│   ├── profile/           # User profile
│   └── ...
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/ui components
│   └── ...
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   ├── ai-service.ts     # OpenAI integration
│   └── spoonacular-service.ts # Spoonacular API
├── models/               # TypeScript interfaces
├── context/              # React context providers
└── public/               # Static assets
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm run test:spoonacular  # Test Spoonacular API integration
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication, Firestore, and Storage
3. Add your Firebase configuration to environment variables

### OpenAI Integration (Optional)
1. Get an API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to environment variables for AI-powered recipe analysis

### Spoonacular Integration (Optional)
1. Register at [Spoonacular Food API](https://spoonacular.com/food-api)
2. Get your API key (free tier: 150 requests/day)
3. Add to environment variables for ingredient images

## 🎨 Key Pages

- **Home** (`/`): Landing page with feature overview
- **Upload** (`/upload`): Recipe upload with AI analysis
- **Recipes** (`/recipes`): Browse and search recipes
- **Profile** (`/profile`): User profile and settings
- **Get Started** (`/get-started`): Onboarding flow
- **Code Editor** (`/code-editor`): Interactive code editing

## 🧪 Testing

### Spoonacular API Test
```bash
npm run test:spoonacular
```

### Manual Testing
- Visit `/test-spoonacular` for API testing
- Visit `/test-upload` for upload functionality testing

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Shadcn/ui](https://ui.shadcn.com/) for UI components
- [Firebase](https://firebase.google.com/) for backend services
- [OpenAI](https://openai.com/) for AI capabilities
- [Spoonacular](https://spoonacular.com/) for ingredient data

## 📞 Support

For support, email support@noname-recipes.com or create an issue in this repository.

---

**Built with ❤️ for the student community**
