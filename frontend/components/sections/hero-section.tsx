"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"

/**
 * HeroSection component displayed at the top of the landing page.
 * Highlights primary value propositions, platform statistics, and dynamic call-to-action buttons.
 * Adapts navigation destination based on user authentication status.
 *
 * @returns React functional component rendering the hero display.
 */
export function HeroSection() {
  const { user } = useAuth();
  return (
    <section className="relative pt-32 pb-20 px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        {/* Value Proposition Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-foreground">The ultimate Pokémon TCG companion</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
        
        {/* Main Headline */}
        <h1 className="font-sans text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground text-balance">
          Collect, trade, and
          <br />
          master the game
        </h1>
        
        {/* Subheadline Explanation */}
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          Track your Pokémon card collection, build competitive decks, connect with collectors worldwide, and explore the marketplace.
        </p>
        
        {/* Primary Call-To-Action Button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="gap-2 px-8 py-6 text-base">
            <Link href={user ? "/collection" : "/login"}>Start Collecting</Link>
          </Button>
        </div>
        
        {/* Platform Milestones & Stats Summary */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-8">
          <div>
            <p className="font-sans text-3xl sm:text-4xl font-bold text-foreground">15K+</p>
            <p className="text-sm text-muted-foreground mt-1">Cards Catalogued</p>
          </div>
          <div>
            <p className="font-sans text-3xl sm:text-4xl font-bold text-foreground">250+</p>
            <p className="text-sm text-muted-foreground mt-1">Sets Available</p>
          </div>
          <div>
            <p className="font-sans text-3xl sm:text-4xl font-bold text-foreground">10K+</p>
            <p className="text-sm text-muted-foreground mt-1">Active Collectors</p>
          </div>
        </div>
      </div>
      
      {/* Decorative Floating Cards Background Effect */}
      <div className="absolute top-1/2 left-8 -translate-y-1/2 hidden xl:block">
        <div className="w-32 h-44 bg-card rounded-xl shadow-2xl -rotate-12 border border-border" />
        <div className="w-32 h-44 bg-card rounded-xl shadow-2xl rotate-6 -mt-36 ml-8 border border-border" />
      </div>
      <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden xl:block">
        <div className="w-32 h-44 bg-card rounded-xl shadow-2xl rotate-12 border border-border" />
        <div className="w-32 h-44 bg-card rounded-xl shadow-2xl -rotate-6 -mt-36 -ml-8 border border-border" />
      </div>
    </section>
  )
}
