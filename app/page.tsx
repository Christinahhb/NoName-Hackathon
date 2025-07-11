import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, UploadCloud, ShoppingBasket } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-white">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-yellow-400 dark:bg-yellow-600 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-cooking.jpg"
            alt="Cooking background"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/icon.png"
              alt="NoName Recipes Logo"
              width={120}
              height={120}
              className="rounded-full bg-white p-2 shadow-lg"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">Share Recipes, Get Rewards!</h1>
          <p className="text-lg md:text-xl text-neutral-800 max-w-2xl mx-auto mb-8">
            Join the NoName Recipes community. Upload your favorite dishes, discover new ones, and earn PCO points for
            every like and ingredient purchase.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/recipes">
              <Button size="lg" className="bg-neutral-800 hover:bg-neutral-700 text-white">
                Explore Recipes
              </Button>
            </Link>
            <Link href="/upload">
              <Button
                size="lg"
                variant="outline"
                className="bg-neutral-800 hover:bg-neutral-700 text-white"
              >
                Upload Your Recipe
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How NoName Recipes Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<UploadCloud className="w-10 h-10 text-yellow-500" />}
              title="Upload & Share"
              description="Easily upload your recipe with an image and brief ingredients. Our AI helps generate the full recipe and ingredient list."
            />
            <FeatureCard
              icon={<ShoppingBasket className="w-10 h-10 text-yellow-500" />}
              title="Smart Cart"
              description="We extract ingredients from recipes and add them to your NoName shopping cart. Swap items with AI-powered suggestions."
            />
            <FeatureCard
              icon={<Gift className="w-10 h-10 text-yellow-500" />}
              title="Earn PCO Points"
              description="Get PCO points when others like your recipe or purchase ingredients through it. More popular recipes get bigger discounts on campus!"
            />
          </div>
        </div>
      </section>

      {/* For Students Section */}
      <section className="py-16 md:py-24 bg-gray-100 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Especially for Students!</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              We're building a community for students who love to cook, share, and save.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <Image
                src="student.png"
                alt="Students cooking together"
                width={500}
                height={350}
                className="rounded-lg shadow-lg mx-auto object-cover"
              />
            </div>
            <div className="space-y-6">
              <InfoPill
                title="Reward System"
                description="Value for money is key. Earn PCO points and enjoy university-specific discounts."
              />
              <InfoPill
                title="Community Focused"
                description="Share with friends, discover what's popular on campus, and connect with fellow foodies."
              />
              <InfoPill
                title="Convenient Distribution"
                description="Regional hubs on campus make getting your NoName ingredients easier than ever."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-yellow-500 dark:bg-yellow-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">Ready to Join the Culinary Community?</h2>
          <p className="text-lg text-neutral-800 max-w-xl mx-auto mb-8">
            Sign up today, start sharing your culinary creations, and turn your recipes into rewards!
          </p>
          <Link href="/get-started">
            <Button size="lg" className="bg-neutral-800 hover:bg-neutral-700 text-white px-10 py-6 text-lg">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-white dark:bg-neutral-800 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="items-center text-center">
        <div className="p-4 bg-yellow-100 dark:bg-yellow-500/20 rounded-full inline-block mb-4">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center">{description}</p>
      </CardContent>
    </Card>
  )
}

function InfoPill({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 bg-white dark:bg-neutral-700 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-yellow-600 dark:text-yellow-500 mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
