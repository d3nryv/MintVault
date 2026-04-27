import Link from "next/link"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/sections/hero-section"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, Swords, ShoppingBag, ArrowRight, BookOpen, Trophy, Tag } from "lucide-react"

const features = [
  {
    title: "Collection",
    description: "Track your cards across all sets, explore the Pokédex, and showcase your collection with interactive binders.",
    href: "/collection",
    icon: Layers,
    highlights: ["Browse all sets", "Track owned cards", "Interactive binders"],
  },
  {
    title: "Gameplay",
    description: "Stay on top of the meta, find tournaments near you, and build winning decks with our deck builder.",
    href: "/gameplay",
    icon: Swords,
    highlights: ["Meta deck analysis", "Tournament finder", "Deck builder"],
  },
  {
    title: "Marketplace",
    description: "Buy and sell cards with collectors worldwide. Create want lists and manage your cart all in one place.",
    href: "/marketplace",
    icon: ShoppingBag,
    highlights: ["Buy cards", "Sell your collection", "Want lists & cart"],
  },
]

const quickLinks = [
  { title: "Browse Sets", description: "Explore all Pokémon TCG sets", href: "/collection", icon: BookOpen },
  { title: "Meta Decks", description: "See what&apos;s winning", href: "/gameplay", icon: Trophy },
  { title: "Sell Cards", description: "List your cards for sale", href: "/marketplace", icon: Tag },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection />
        
        {/* Features Section */}
        <section className="mx-auto max-w-[1700px] px-6 py-24 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Manage your collection, compete in tournaments, and trade with collectors
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="group relative overflow-hidden transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mb-6 space-y-2">
                    {feature.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                    <Link href={feature.href}>
                      Explore {feature.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-[1700px] px-6 py-16 lg:px-8">
            <h3 className="mb-8 text-center text-2xl font-bold text-foreground">
              Quick Links
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted group-hover:bg-primary group-hover:text-primary-foreground">
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{link.title}</h4>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
