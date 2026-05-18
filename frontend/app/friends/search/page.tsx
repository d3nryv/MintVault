"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Users, Library, Layers, Tag, Search, Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const query = searchParams?.get("q") || ""
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/users/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
        }
      } catch (error) {
        console.warn("Error fetching search results:", error)
      } finally {
        setLoading(false)
      }
    }

    if (query) {
      fetchResults()
    }
  }, [query])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-12 px-6 lg:px-8 max-w-[1700px] mx-auto w-full">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {query ? `Search results for "${query}"` : "Search People"}
            </h1>
            <p className="text-muted-foreground">
              {results.length} {results.length === 1 ? "person" : "people"} found
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Finding trainers...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((user) => (
                <Card 
                  key={user.id} 
                  className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-border/50 overflow-hidden cursor-pointer bg-secondary/20"
                  onClick={() => router.push(`/profile/${user.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        {user.profilePicUrl ? (
                          <img 
                            src={user.profilePicUrl} 
                            alt={user.username} 
                            className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-8 w-8 text-primary" />
                          </div>
                        )}
                        {user.medals?.length > 0 && (
                          <Badge className="absolute -bottom-1 -right-1 px-1 h-5 min-w-5 flex items-center justify-center bg-yellow-500 hover:bg-yellow-500 text-black border-none">
                            <span className="text-[10px] font-bold">Lvl {user.medals.length}</span>
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                          {user.username}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          {user.title || "Trainer"}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {user.followers?.length || 0} followers
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-background/50 rounded-xl p-3 flex flex-col items-center justify-center gap-1 border border-border/30">
                        <Library className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-bold">
                          {(user.ownedEnglishCards?.length || 0) + (user.ownedJapaneseCards?.length || 0) + (user.ownedPokemon?.length || 0)}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Cards</span>
                      </div>
                      <div className="bg-background/50 rounded-xl p-3 flex flex-col items-center justify-center gap-1 border border-border/30">
                        <Layers className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-bold">
                          {user.ownedDecks?.length || 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Decks</span>
                      </div>
                      <div className="bg-background/50 rounded-xl p-3 flex flex-col items-center justify-center gap-1 border border-border/30">
                        <Tag className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-bold">
                          {user.cardsOnSale?.length || 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Sales</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-6 rounded-xl font-bold transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/profile/${user.id}`);
                      }}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">No results found</h3>
                <p className="text-muted-foreground">Try searching for a different name or trainer.</p>
              </div>
              <Button variant="outline" onClick={() => router.push("/")} className="mt-2">
                Go back home
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function FriendsSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}
