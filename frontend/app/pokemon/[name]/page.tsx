"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertCircle, Flame, X } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface Attack {
  name: string
  cost?: string[]
  convertedEnergyCost?: number
  damage?: string
  text?: string
}

interface Weakness {
  type: string
  value?: string
}

interface Resistance {
  type: string
  value?: string
}

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
    images?: {
      symbol?: string
      logo?: string
    }
  }
  number?: string
  rarity?: string
  artist?: string
  flavorText?: string
  abilities?: Array<{ name: string; text: string; type: string }>
  attacks?: Attack[]
  weaknesses?: Weakness[]
  resistances?: Resistance[]
  retreatCost?: string[]
  convertedRetreatCost?: number
  evolvesFrom?: string
  evolvesTo?: string[]
  nationalPokedexNumbers?: number[]
  regulationMark?: string
  releaseDate?: string
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

const tcgTypeColors: Record<string, string> = {
  Fire: "#EF4444",
  Water: "#3B82F6",
  Grass: "#22C55E",
  Lightning: "#EAB308",
  Psychic: "#EC4899",
  Fighting: "#EA580C",
  Darkness: "#475569",
  Metal: "#94A3B8",
  Dragon: "#6366F1",
  Colorless: "#9CA3AF",
  Fairy: "#F472B6",
}

function CardDetailModal({ card, onClose }: { card: CardInfo; onClose: () => void }) {
  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark")

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const primaryType = card.types?.[0]
  const typeAccent = primaryType ? (tcgTypeColors[primaryType] ?? "#6366F1") : "#6366F1"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="relative w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col md:flex-row"
        style={{ background: "var(--card, #1f232d)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close button - top right, contrasting color */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2 sm:p-3 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-offset-2"
          style={{
            background: typeAccent,
            color: "#fff",
            boxShadow: `0 4px 14px 0 ${typeAccent}40`
          }}
          aria-label="Cerrar modal"
          title="Cerrar"
        >
          <X className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
        </button>

        {/* Left: Card image - adjusted to fill more space */}
        <div
          className="flex items-center justify-center p-2 sm:p-4 md:w-2/5 lg:w-1/2 flex-shrink-0 bg-black/20"
          style={{
            background: `linear-gradient(135deg, ${typeAccent}44 0%, transparent 100%)`,
          }}
        >
          {card.images?.large || card.images?.small ? (
            <img
              src={card.images.large || card.images.small}
              alt={`Carta de ${card.name}`}
              className="w-full h-full max-h-[85vh] object-contain drop-shadow-2xl rounded-lg"
            />
          ) : (
            <div className="w-64 h-80 flex items-center justify-center bg-muted/30 rounded-2xl border border-muted">
              <AlertCircle className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Right: Card details */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 text-foreground custom-scrollbar">
          {/* Header */}
          <div className="pr-12 sm:pr-16">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 id="modal-title" className="text-4xl sm:text-5xl font-black">{card.name}</h2>
              {card.hp && (
                <span
                  className="text-lg sm:text-xl font-bold px-4 py-1 rounded-full shadow-sm"
                  style={{ background: typeAccent + "22", color: typeAccent, border: `1px solid ${typeAccent}50` }}
                >
                  {card.hp} HP
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-3 text-lg text-muted-foreground flex-wrap">
              {card.supertype && <span className="font-medium text-foreground/80">{card.supertype}</span>}
              {card.subtypes?.map((s) => (
                <span key={s} className="before:content-['•'] before:mr-2 before:text-muted-foreground/50">{s}</span>
              ))}
              {card.number && card.set?.name && (
                <span className="before:content-['•'] before:mr-2 before:text-muted-foreground/50">
                  #{card.number} — {card.set.name}
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-border/60" />

          {/* Types */}
          {card.types && card.types.length > 0 && (
            <InfoRow label="Type">
              <div className="flex gap-2 flex-wrap">
                {card.types.map((t) => (
                  <span
                    key={t}
                    className="px-4 py-1 rounded-full text-base font-bold text-white shadow-sm"
                    style={{ background: tcgTypeColors[t] ?? "#6366F1" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </InfoRow>
          )}

          {/* Flavor text */}
          {card.flavorText && (
            <p className="text-lg italic text-muted-foreground border-l-4 pl-4 py-1" style={{ borderColor: typeAccent }}>
              {card.flavorText}
            </p>
          )}

          {/* Abilities */}
          {card.abilities && card.abilities.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold uppercase tracking-widest text-muted-foreground">Abilities</h3>
              {card.abilities.map((ab, i) => (
                <div key={i} className="rounded-xl p-5 bg-muted/20 border border-border/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-sm px-2.5 py-1 rounded-md font-black uppercase tracking-wider shadow-sm"
                      style={{ background: typeAccent + "33", color: typeAccent }}
                    >
                      {ab.type}
                    </span>
                    <span className="font-bold text-xl">{ab.name}</span>
                  </div>
                  {ab.text && <p className="text-base leading-relaxed text-muted-foreground">{ab.text}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Attacks */}
          {card.attacks && card.attacks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold uppercase tracking-widest text-muted-foreground">Attacks</h3>
              {card.attacks.map((atk, i) => (
                <div key={i} className="rounded-xl p-5 bg-muted/20 border border-border/50 space-y-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      {atk.cost && atk.cost.length > 0 && (
                        <div className="flex gap-1">
                          {atk.cost.map((c, ci) => (
                            <span
                              key={ci}
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full inline-flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-sm"
                              style={{ background: tcgTypeColors[c] ?? "#6B7280" }}
                              title={c}
                            >
                              {c[0]}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="font-bold text-xl">{atk.name}</span>
                    </div>
                    {atk.damage && (
                      <span className="font-black text-3xl" style={{ color: typeAccent }}>
                        {atk.damage}
                      </span>
                    )}
                  </div>
                  {atk.text && <p className="text-base leading-relaxed text-muted-foreground">{atk.text}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-base bg-muted/10 p-5 rounded-xl border border-border/40">
            {card.weaknesses && card.weaknesses.length > 0 && (
              <InfoRow label="Weakness">
                {card.weaknesses.map((w) => (
                  <span key={w.type} className="font-bold text-foreground">
                    {w.type} {w.value}
                  </span>
                ))}
              </InfoRow>
            )}
            {card.resistances && card.resistances.length > 0 && (
              <InfoRow label="Resistance">
                {card.resistances.map((r) => (
                  <span key={r.type} className="font-bold text-foreground">
                    {r.type} {r.value}
                  </span>
                ))}
              </InfoRow>
            )}
            {card.retreatCost !== undefined && (
              <InfoRow label="Retreat Cost">
                <span className="font-bold text-foreground">{card.convertedRetreatCost ?? card.retreatCost?.length ?? 0}</span>
              </InfoRow>
            )}
            {card.rarity && (
              <InfoRow label="Rarity">
                <span className="font-bold text-foreground">{card.rarity}</span>
              </InfoRow>
            )}
            {card.evolvesFrom && (
              <InfoRow label="Evolves From">
                <span className="font-bold text-foreground">{card.evolvesFrom}</span>
              </InfoRow>
            )}
            {card.evolvesTo && card.evolvesTo.length > 0 && (
              <InfoRow label="Evolves To">
                <span className="font-bold text-foreground">{card.evolvesTo.join(", ")}</span>
              </InfoRow>
            )}
            {card.artist && (
              <InfoRow label="Illustrated By">
                <span className="font-bold text-foreground">{card.artist}</span>
              </InfoRow>
            )}
            {card.nationalPokedexNumbers && card.nationalPokedexNumbers.length > 0 && (
              <InfoRow label="Pokédex #">
                <span className="font-bold text-foreground">{card.nationalPokedexNumbers.join(", ")}</span>
              </InfoRow>
            )}
            {card.set?.series && (
              <InfoRow label="Series">
                <span className="font-bold text-foreground">{card.set.series}</span>
              </InfoRow>
            )}
            {card.regulationMark && (
              <InfoRow label="Regulation">
                <span className="font-bold text-foreground">{card.regulationMark}</span>
              </InfoRow>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-1">
      <span className="text-muted-foreground/80 font-medium min-w-[140px] text-sm uppercase tracking-wide">{label}</span>
      <div className="flex flex-wrap gap-1 items-center">{children}</div>
    </div>
  )
}

export default function PokemonPage() {
  const router = useRouter()
  const params = useParams()
  const pokemonName = params.name as string
  const decodedName = decodeURIComponent(pokemonName)

  const [cards, setCards] = useState<CardInfo[]>([])
  const [pokemon, setPokemon] = useState<PokemonData | null>(null)
  const [pokemonLoading, setPokemonLoading] = useState(true)
  const [cardsLoading, setCardsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<CardInfo | null>(null)

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
      const response = await fetch(`http://127.0.0.1:3000/api/cards/search/${encodeURIComponent(decodedName)}`)

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
    if (decodedName) {
      fetchPokemon()
      fetchCards()
    }
  }, [decodedName, fetchPokemon, fetchCards])

  const pokemonImageUrl =
    pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon?.sprites?.front_default

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-[1700px]">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/collection?tab=pokedex")}
            className="gap-2 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pokédex
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
          {pokemonLoading ? (
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

            {cardsLoading ? (
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
                    onClick={() => setSelectedCard(card)}
                    className="group cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-card border-border overflow-hidden rounded-2xl hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver detalles de ${card.name}, set ${card.set?.name || 'desconocido'}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedCard(card);
                      }
                    }}
                  >
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
                            <span className="text-muted-foreground text-sm text-center px-2">
                              No image
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Card info — text size increased for better readability */}
                      <div className="p-4 space-y-1.5">
                        <p className="font-bold text-foreground truncate text-lg">
                          {card.name}
                        </p>
                        <div className="text-base text-muted-foreground">
                          {card.set?.name && <span>{card.set.name}</span>}
                          {card.number && <span> • #{card.number}</span>}
                        </div>
                        {card.rarity && (
                          <p className="text-xs text-muted-foreground/70">{card.rarity}</p>
                        )}
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
                <Button variant="outline" onClick={() => router.push("/collection?tab=pokedex")} className="mt-4">
                  Go Back to Pokédex
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  )
}