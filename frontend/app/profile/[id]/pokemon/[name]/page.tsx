"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertCircle, Flame, Loader2, Search, Filter, Hash, CheckCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface PokemonData {
  id: number
  name: string
  sprites?: {
    other?: {
      "official-artwork"?: { front_default?: string }
    }
    front_default?: string
  }
  types?: Array<{ type: { name: string } }>
  height?: number
  weight?: number
}

export default function ProfilePokemonPage() {
  const router = useRouter()
  const params = useParams()
  const profileId = params.id as string
  const pokemonName = params.name as string
  const decodedName = decodeURIComponent(pokemonName)
  const apiBaseUrl = typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `http://${window.location.hostname}:3000`
        : `${window.location.protocol}//${window.location.hostname}/_/backend`)
    : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000');

  const [profileUser, setProfileUser] = useState<any | null>(null)
  const [pokemon, setPokemon] = useState<PokemonData | null>(null)
  const [cards, setCards] = useState<any[]>([])
  const [pokemonLoading, setPokemonLoading] = useState(true)
  const [cardsLoading, setCardsLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(20)

  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"number" | "owned">("number")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [collectionFilter, setCollectionFilter] = useState<"all" | "owned" | "not-owned">("all")
  const [showGrayscale, setShowGrayscale] = useState(false)

  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true)
      const res = await fetch(`${apiBaseUrl}/api/users/${profileId}`)
      if (res.ok) {
        const data = await res.json()
        setProfileUser(data)
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
    } finally {
      setProfileLoading(false)
    }
  }, [profileId, apiBaseUrl])

  const fetchPokemon = useCallback(async () => {
    try {
      setPokemonLoading(true)
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${decodedName.toLowerCase()}`)
      if (response.ok) {
        const data = await response.json()
        setPokemon(data)
      }
    } catch (err) {
      console.error("Error fetching pokemon:", err)
    } finally {
      setPokemonLoading(false)
    }
  }, [decodedName])

  const fetchCards = useCallback(async () => {
    try {
      setCardsLoading(true)
      setError(null)
      const response = await fetch(`${apiBaseUrl}/api/cards/search/${encodeURIComponent(decodedName)}`)
      if (response.ok) {
        const data = await response.json()
        setCards(Array.isArray(data) ? data : [])
      } else {
        throw new Error("Failed to fetch cards")
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "An error occurred while loading data")
    } finally {
      setCardsLoading(false)
    }
  }, [decodedName])

  useEffect(() => {
    if (profileId) fetchProfile()
    if (decodedName) {
      fetchPokemon()
      fetchCards()
      setVisibleCount(20)
    }
  }, [profileId, decodedName, fetchProfile, fetchPokemon, fetchCards])

  const ownedCardIds = useMemo(() => {
    if (!profileUser) return new Set<string>()
    const owned = profileUser.allOwnedCardIds || []
    const pokemon = profileUser.ownedPokemon || []
    return new Set<string>([...owned, ...pokemon])
  }, [profileUser])

  const filteredCards = useMemo(() => {
    let result = [...cards]

    if (searchQuery) {
      result = result.filter(c =>
        c.set?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (collectionFilter !== "all") {
      result = result.filter(c => {
        const isOwned = ownedCardIds.has(c.id)
        return collectionFilter === "owned" ? isOwned : !isOwned
      })
    }

    result.sort((a, b) => {
      if (sortBy === "owned") {
        const aOwned = ownedCardIds.has(a.id) ? 1 : 0
        const bOwned = ownedCardIds.has(b.id) ? 1 : 0
        return sortOrder === "asc" ? aOwned - bOwned : bOwned - aOwned
      } else {
        const aNum = a.number?.match(/\d+/) ? parseInt(a.number.match(/\d+/)![0]) : 0
        const bNum = b.number?.match(/\d+/) ? parseInt(b.number.match(/\d+/)![0]) : 0
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum
      }
    })

    return result
  }, [cards, searchQuery, collectionFilter, sortBy, sortOrder, ownedCardIds])

  const lazyCards = useMemo(() => filteredCards.slice(0, visibleCount), [filteredCards, visibleCount])

  useEffect(() => {
    if (cardsLoading || lazyCards.length >= filteredCards.length) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) setVisibleCount(prev => prev + 15) },
      { threshold: 0.1, rootMargin: "300px" }
    )
    const target = document.querySelector("#profile-pokemon-load-trigger")
    if (target) observer.observe(target)
    return () => observer.disconnect()
  }, [cardsLoading, lazyCards.length, filteredCards.length])

  const pokemonImageUrl =
    pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon?.sprites?.front_default

  const ownedCount = useMemo(() =>
    cards.filter(c => ownedCardIds.has(c.id)).length,
    [cards, ownedCardIds]
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-6 lg:px-8 max-w-[1700px]">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/profile/${profileId}`)}
            className="gap-2 mb-8 font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {profileUser?.username || "Profile"}
          </Button>

          {/* Error */}
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
          {pokemonLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Skeleton className="h-80 w-full rounded-2xl" />
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 items-start">
              {/* Pokemon Image */}
              <div className="md:col-span-1">
                <div className="relative w-full aspect-square bg-gradient-to-br from-primary/5 via-background to-secondary/10 rounded-3xl border border-border overflow-hidden flex items-center justify-center shadow-lg">
                  {pokemonImageUrl ? (
                    <img src={pokemonImageUrl} alt={decodedName} className="w-full h-full object-contain drop-shadow-2xl" />
                  ) : (
                    <div className="text-center space-y-2">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">No image available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pokemon Info */}
              <div className="md:col-span-3 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    {!profileLoading && profileUser && (
                      <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
                        {profileUser.username}'s Collection
                      </p>
                    )}
                  </div>
                  <h1 className="text-5xl font-black text-foreground capitalize mb-2">{decodedName}</h1>
                  {pokemon && <p className="text-muted-foreground text-lg">Pokédex #{pokemon.id}</p>}
                </div>

                {pokemon?.types && (
                  <div className="flex gap-2">
                    {pokemon.types.map(({ type }) => (
                      <Badge key={type.name} className={`${typeColors[type.name] || "bg-slate-500/80"} text-white capitalize font-bold text-xs px-3 py-1`}>
                        {type.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {pokemon?.height && (
                    <Card className="bg-card border-border">
                      <CardContent className="pt-4 pb-4">
                        <p className="text-xs text-muted-foreground mb-1">Height</p>
                        <p className="text-2xl font-bold">{(pokemon.height / 10).toFixed(1)} m</p>
                      </CardContent>
                    </Card>
                  )}
                  {pokemon?.weight && (
                    <Card className="bg-card border-border">
                      <CardContent className="pt-4 pb-4">
                        <p className="text-xs text-muted-foreground mb-1">Weight</p>
                        <p className="text-2xl font-bold">{(pokemon.weight / 10).toFixed(1)} kg</p>
                      </CardContent>
                    </Card>
                  )}
                  <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
                    <CardContent className="pt-4 pb-4">
                      <p className="text-xs text-muted-foreground mb-1">Total Cards</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-black">{cards.length}</p>
                        <Flame className="h-5 w-5 text-primary/60" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30">
                    <CardContent className="pt-4 pb-4">
                      <p className="text-xs text-muted-foreground mb-1">Owned</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-black">{ownedCount}</p>
                        <CheckCircle className="h-5 w-5 text-green-500/60" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Cards Section */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-card/50 p-6 rounded-3xl border border-border/50 backdrop-blur-sm">
              <h2 className="text-3xl font-black text-foreground uppercase tracking-tight italic">
                {decodedName}'s Cards
              </h2>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative group min-w-[250px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search set name..."
                    className="pl-10 h-12 bg-secondary/30 border-border/50 rounded-2xl font-bold"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={collectionFilter} onValueChange={(v: any) => setCollectionFilter(v)}>
                    <SelectTrigger className="h-12 w-[140px] bg-secondary/30 border-border/50 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                      <Filter className="h-4 w-4 mr-2 text-primary" />
                      <SelectValue placeholder="Collection" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50">
                      <SelectItem value="all" className="rounded-xl">All Cards</SelectItem>
                      <SelectItem value="owned" className="rounded-xl">Owned Only</SelectItem>
                      <SelectItem value="not-owned" className="rounded-xl">Not Owned</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="h-12 w-[140px] bg-secondary/30 border-border/50 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                      <Filter className="h-4 w-4 mr-2 text-primary" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50">
                      <SelectItem value="number" className="rounded-xl">Number</SelectItem>
                      <SelectItem value="owned" className="rounded-xl">Owned</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-2xl bg-secondary/30 border-border/50"
                    onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                  >
                    <Hash className={`h-4 w-4 transition-transform duration-500 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                  </Button>

                  <Button
                    variant="outline"
                    className={`h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${showGrayscale ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/30 border-border/50'}`}
                    onClick={() => setShowGrayscale(!showGrayscale)}
                  >
                    {showGrayscale ? "B&W: ON" : "B&W: OFF"}
                  </Button>
                </div>
              </div>
            </div>

            {cardsLoading && cards.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                {Array.from({ length: 21 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredCards.length > 0 ? (
              <div className="space-y-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                  {lazyCards.map((card) => {
                    const isOwned = ownedCardIds.has(card.id)
                    return (
                      <Card
                        key={card.id}
                        className={`group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-card border-border overflow-hidden rounded-2xl hover:border-primary/50 relative ${showGrayscale && !isOwned ? 'grayscale opacity-70' : ''}`}
                      >
                        {isOwned && (
                          <div className="absolute top-3 right-3 z-10 bg-primary text-white p-1.5 rounded-full shadow-lg">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        )}
                        <CardContent className="p-0">
                          <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                            {card.images?.large || card.images?.small ? (
                              <img
                                src={card.images.large || card.images.small}
                                alt={card.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                <span className="text-muted-foreground text-sm text-center px-2">No image</span>
                              </div>
                            )}
                          </div>
                          <div className="p-3 space-y-1">
                            <p className="font-bold text-foreground truncate text-sm">{card.name}</p>
                            <div className="text-xs text-muted-foreground">
                              {card.set?.name && <span>{card.set.name}</span>}
                              {card.number && <span> • #{card.number}</span>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <div id="profile-pokemon-load-trigger" className="h-20 flex items-center justify-center">
                  {lazyCards.length < filteredCards.length && (
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                  )}
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-card border border-border rounded-2xl">
                <AlertCircle className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="text-xl font-bold text-foreground">No cards found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No trading cards available for {decodedName} matching the current filters.
                  </p>
                </div>
                <Button variant="outline" onClick={() => router.push(`/profile/${profileId}`)}>
                  Back to Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
