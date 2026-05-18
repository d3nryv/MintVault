"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const GENERATIONS = [
  { id: 1, name: "Gen I", offset: 0, limit: 151 },
  { id: 2, name: "Gen II", offset: 151, limit: 100 },
  { id: 3, name: "Gen III", offset: 251, limit: 135 },
  { id: 4, name: "Gen IV", offset: 386, limit: 107 },
  { id: 5, name: "Gen V", offset: 493, limit: 156 },
  { id: 6, name: "Gen VI", offset: 649, limit: 72 },
  { id: 7, name: "Gen VII", offset: 721, limit: 88 },
  { id: 8, name: "Gen VIII", offset: 809, limit: 96 },
  { id: 9, name: "Gen IX", offset: 905, limit: 120 },
]

interface PokemonInfo {
  id: number
  name: string
  number: string
  sprite: string
}

export function PokedexSection() {
  const router = useRouter()
  const [selectedGen, setSelectedGen] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [allPokemon, setAllPokemon] = useState<PokemonInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAllPokemon() {
      setLoading(true)
      try {
        const apiBaseUrl = typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `http://${window.location.hostname}:3000`
        : `${window.location.protocol}//${window.location.hostname}/_/backend`)
    : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000');
        const response = await fetch(`${apiBaseUrl}/api/pokedex/all`)
        if (!response.ok) throw new Error('Failed to fetch from backend')
        const data = await response.json()

        setAllPokemon(data)
      } catch (error) {
        console.error("Error fetching all pokemon:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllPokemon()
  }, [])

  const displayedPokemon = useMemo(() => {
    if (searchQuery.trim() !== "") {
      // Global Search
      return allPokemon.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.number.includes(searchQuery)
      )
    } else {
      // Generation View
      const gen = GENERATIONS.find(g => g.id === selectedGen)
      if (!gen) return []
      return allPokemon.slice(gen.offset, gen.offset + gen.limit)
    }
  }, [allPokemon, searchQuery, selectedGen])

  return (
    <section className="py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            {searchQuery ? "Search Results" : "Pokédex Explorer"}
          </h2>
          <p className="text-muted-foreground">
            {searchQuery
              ? `Found ${displayedPokemon.length} Pokémon matching your search`
              : "Browse all Pokémon species from across the regions"}
          </p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search all generations..."
            className="pl-10 h-11 bg-card/50 border-border/50 focus-visible:ring-primary/20 transition-all rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Generation Bar - Hidden when searching for clarity */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-secondary/20 rounded-2xl w-fit">
          {GENERATIONS.map((gen) => (
            <Button
              key={gen.id}
              variant={selectedGen === gen.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedGen(gen.id)}
              className={`rounded-xl px-4 font-bold transition-all ${selectedGen === gen.id ? "shadow-md scale-105" : "text-muted-foreground hover:text-foreground"}`}
            >
              {gen.name}
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-card/50 border border-border/50 rounded-3xl animate-pulse p-4 flex flex-col items-center justify-center space-y-3">
              <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : displayedPokemon.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
          {displayedPokemon.map((p) => (
            <Card
              key={p.id}
              className="group cursor-pointer hover:shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.3)] transition-all duration-500 hover:-translate-y-3 bg-card border-border/50 rounded-3xl overflow-hidden"
              onClick={() => router.push(`/pokemon/${encodeURIComponent(p.name)}`)}
            >
              <CardContent className="p-2 pt-4 flex flex-col items-center text-center">
                <div className="relative aspect-square w-full mb-3 flex items-center justify-center overflow-visible">
                  <div className="absolute inset-4 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500" />

                  <img
                    src={p.sprite}
                    alt={p.name}
                    className="relative w-11/12 h-11/12 object-contain filter drop-shadow-xl scale-110 group-hover:scale-125 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-0 right-2">
                    <span className="text-[10px] font-black text-foreground/20 italic tracking-tighter">#{p.number}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 w-full px-2 pb-2">
                  <p className="text-xs font-black text-foreground truncate uppercase tracking-widest leading-none mb-1">{p.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground/60">No. {p.number}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-muted rounded-full">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">No Pokémon found</p>
            <p className="text-sm text-muted-foreground">Try searching for a different name or ID</p>
          </div>
          <Button variant="outline" onClick={() => setSearchQuery("")}>Clear Search</Button>
        </div>
      )}
    </section>
  )
}
