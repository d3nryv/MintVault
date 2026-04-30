"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertCircle, Flame } from "lucide-react"

interface CardInfo {
  id: string
  name: string
  supertype?: string
  subtypes?: string[]
  hp?: string
  types?: string[]
  images?: {
    small?: string
    large?: string
  }
  set?: {
    id?: string
    name?: string
    series?: string
  }
  rarity?: string
  abilities?: unknown[]
  attacks?: unknown[]
}

interface PokemonData {
  id: number
  name: string
  sprites?: {
    other?: {
      "official-artwork"?: {
        front_default?: string
      }
    }
    front_default?: string
  }
  types?: Array<{ type: { name: string } }>
  height?: number
  weight?: number
}

const typeColors: Record<string, string> = {
  fire: "bg-red-500/80",
  water: "bg-blue-500/80",
  grass: "bg-green-500/80",
  electric: "bg-yellow-500/80",
  ice: "bg-cyan-400/80",
  fighting: "bg-orange-700/80",
  poison: "bg-purple-500/80",
  ground: "bg-amber-600/80",
  flying: "bg-blue-400/80",
  psychic: "bg-pink-500/80",
  bug: "bg-lime-600/80",
  rock: "bg-gray-600/80",
  ghost: "bg-indigo-600/80",
  dragon: "bg-indigo-700/80",
  dark: "bg-slate-800/80",
  steel: "bg-slate-500/80",
  fairy: "bg-pink-400/80",
  normal: "bg-slate-400/80",
}

export default function PokemonPage() {
  const router = useRouter()
  const params = useParams()
  const pokemonName = params.name as string
  const decodedName = decodeURIComponent(pokemonName)

  const [cards, setCards] = useState<CardInfo[]>([])
  const [pokemon, setPokemon] = useState<PokemonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch Pokemon data from PokeAPI
        try {
          const pokemonResponse = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${decodedName.toLowerCase()}`
          )
          if (pokemonResponse.ok) {
            const pokemonData = await pokemonResponse.json()
            setPokemon(pokemonData)
          }
        } catch (pokemonErr) {
          console.error("Error fetching pokemon:", pokemonErr)
        }

        // Fetch cards from backend
        const cardsResponse = await fetch(
          `http://127.0.0.1:3000/api/cards/search/${encodeURIComponent(decodedName)}`
        )

        if (cardsResponse.ok) {
          const cardsData = await cardsResponse.json()
          setCards(Array.isArray(cardsData) ? cardsData : [])
        } else {
          throw new Error("Failed to fetch cards")
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An error occurred while loading data")
      } finally {
        setLoading(false)
      }
    }

    if (decodedName) {
      fetchData()
    }
  }, [decodedName])

  const pokemonImageUrl =
    pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon?.sprites?.front_default

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {/* Error state */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-destructive">Error loading data</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {/* Pokemon Header */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-1">
              <Skeleton className="h-80 w-full rounded-2xl" />
            </div>
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-start">
            {/* Pokemon Image */}
            <div className="md:col-span-1">
              <div className="relative w-full aspect-square bg-gradient-to-br from-primary/5 via-background to-secondary/10 rounded-3xl border border-border overflow-hidden flex items-center justify-center shadow-lg">
                {pokemonImageUrl ? (
                  <img
                    src={pokemonImageUrl}
                    alt={decodedName}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pokemon Info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h1 className="text-5xl font-black text-foreground capitalize mb-2">
                  {decodedName}
                </h1>
                {pokemon && (
                  <p className="text-muted-foreground text-lg">
                    Pokédex #{pokemon.id}
                  </p>
                )}
              </div>

              {/* Types */}
              {pokemon?.types && pokemon.types.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Types</p>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.types.map((typeData) => (
                      <Badge
                        key={typeData.type.name}
                        className={`${
                          typeColors[typeData.type.name] || "bg-slate-600/80"
                        } capitalize text-white border-0`}
                      >
                        {typeData.type.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              {pokemon && (
                <div className="grid grid-cols-2 gap-4">
                  {pokemon.height && (
                    <Card className="bg-card border-border">
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground mb-1">Height</p>
                        <p className="text-2xl font-bold text-foreground">
                          {(pokemon.height / 10).toFixed(1)} m
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  {pokemon.weight && (
                    <Card className="bg-card border-border">
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground mb-1">Weight</p>
                        <p className="text-2xl font-bold text-foreground">
                          {(pokemon.weight / 10).toFixed(1)} kg
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Cards Count */}
              <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Available Cards</p>
                      <p className="text-3xl font-black text-foreground">
                        {cards.length}
                      </p>
                    </div>
                    <Flame className="h-12 w-12 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Cards Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Trading Cards Collection
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-72 w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : cards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-500 hover:-translate-y-2 bg-card border-border overflow-hidden rounded-2xl hover:border-primary/50"
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                      {card.images?.large ? (
                        <img
                          src={card.images.large}
                          alt={card.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : card.images?.small ? (
                        <img
                          src={card.images.small}
                          alt={card.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/50">
                          <span className="text-muted-foreground text-xs text-center px-2">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <p className="font-bold text-foreground truncate text-sm line-clamp-2">
                        {card.name}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {card.set?.name && (
                          <Badge variant="outline" className="text-xs">
                            {card.set.name}
                          </Badge>
                        )}
                        {card.supertype && (
                          <Badge className="text-xs bg-primary/20 text-primary hover:bg-primary/30 border-0">
                            {card.supertype}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-card border border-border rounded-2xl">
              <div className="p-3 bg-muted rounded-full">
                <AlertCircle className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">No cards found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  No trading cards available for {decodedName} at the moment.
                </p>
              </div>
              <Button variant="outline" onClick={() => router.back()} className="mt-4">
                Go Back
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
