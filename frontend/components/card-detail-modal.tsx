"use client"

import { useEffect, useState } from "react"
import { AlertCircle, X, Plus, Minus, Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { syncWantsListWithSetUpdate } from "@/utils/wants-sync"
import { Badge } from "@/components/ui/badge"

export interface Attack {
  name: string
  cost?: string[]
  convertedEnergyCost?: number
  damage?: string
  text?: string
}

export interface Weakness {
  type: string
  value?: string
}

export interface Resistance {
  type: string
  value?: string
}

export interface CardInfo {
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
    ptcgoCode?: string
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
  legalities?: {
    standard?: string
    expanded?: string
    unlimited?: string
  }
  tcgplayer?: {
    url?: string
    updatedAt?: string
    prices?: {
      normal?: { market?: number }
      holofoil?: { market?: number }
      reverseHolofoil?: { market?: number }
    }
  }
  cardmarket?: {
    url?: string
    updatedAt?: string
    prices?: {
      averageSellPrice?: number
      trendPrice?: number
    }
  }
}

export const tcgTypeColors: Record<string, string> = {
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

export function CardDetailModal({ card, collectionTarget = 'sets', onClose }: { card: CardInfo; collectionTarget?: 'pokemon' | 'sets'; onClose: () => void }) {
  const { user, updateUser } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  
  const isPokedexContext = typeof window !== 'undefined' && 
    (window.location.pathname.includes('/pokemon/') || window.location.search.includes('tab=pokedex'))

  const handleToggleCollection = async (action: 'add' | 'remove') => {
    if (!user) return
    
    setIsUpdating(true)
    try {
      const field = collectionTarget === 'pokemon' ? 'ownedPokemon' : 'ownedEnglishCards'
      const dbField = collectionTarget === 'pokemon' ? 'owned_pokemon' : 'owned_english_cards'
      const currentValue = [...(user[field] || [])]
      
      const itemToModify = card.id
      let newValue: string[]
      let isOwnedNow: boolean
      
      if (action === 'add') {
        newValue = [...currentValue, itemToModify]
        isOwnedNow = true
      } else {
        const index = currentValue.lastIndexOf(itemToModify)
        if (index > -1) {
          currentValue.splice(index, 1)
        }
        newValue = currentValue
        isOwnedNow = newValue.includes(itemToModify)
      }

      const updatedWantList = syncWantsListWithSetUpdate(user.wantList || [], card, isOwnedNow)

      const updateData: any = { 
        [field]: newValue,
        wantList: updatedWantList
      }

      const apiBaseUrl = typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `http://${window.location.hostname}:3000`
        : `${window.location.protocol}//${window.location.hostname}/_/backend`)
    : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000');
      const response = await fetch(`${apiBaseUrl}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        updateUser({ [field]: newValue, wantList: updatedWantList })
      }
    } catch (error) {
      console.error('Failed to update collection', error)
    } finally {
      setIsUpdating(false)
    }
  }

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

  // Count specific card copies by ID based on collection target
  const targetField = collectionTarget === 'pokemon' ? 'ownedPokemon' : 'ownedEnglishCards'
  const ownedCount = user?.[targetField]?.filter((id: string) => id === card.id).length || 0

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="relative w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col md:flex-row bg-white dark:bg-[#1f232d]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close button - top right */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex gap-2">
          <button
            onClick={onClose}
            className="p-2 sm:p-3 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-offset-2"
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
        </div>

        {/* Left: Card image */}
        <div
          className="flex items-center justify-center p-4 md:w-2/5 lg:w-1/2 flex-shrink-0 bg-black/20 max-h-[35vh] md:max-h-none h-[35vh] md:h-auto"
          style={{
            background: `linear-gradient(135deg, ${typeAccent}44 0%, transparent 100%)`,
          }}
        >
          {card.images?.large || card.images?.small ? (
            <img
              src={card.images.large || card.images.small}
              alt={`Carta de ${card.name}`}
              className="w-full h-full max-h-[30vh] md:max-h-[85vh] object-contain drop-shadow-2xl rounded-lg"
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
                <span className="before:content-['•'] before:mr-2 before:text-muted-foreground/50 inline-flex items-center gap-2">
                  #{card.number} — {card.set.name}
                  {card.set?.images?.symbol && (
                    <img src={card.set.images.symbol} alt="" className="h-4 w-auto object-contain inline-block filter invert dark:invert-0" />
                  )}
                </span>
              )}
            </div>

            {/* Legality Badges */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {card.legalities?.standard === "Legal" && (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold uppercase tracking-widest text-[9px] px-2.5 py-0.5 rounded-full">Standard</Badge>
              )}
              {card.legalities?.expanded === "Legal" && (
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold uppercase tracking-widest text-[9px] px-2.5 py-0.5 rounded-full">Expanded</Badge>
              )}
              {card.legalities?.unlimited === "Legal" && (
                <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 font-bold uppercase tracking-widest text-[9px] px-2.5 py-0.5 rounded-full">Unlimited</Badge>
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

          {/* Real-time Pricing Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Market Price Guide</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/40 p-4 rounded-2xl border border-border/50">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">TCGPlayer Market</p>
                <p className="text-lg font-black text-emerald-500 mt-1">
                  {card.tcgplayer?.prices?.normal?.market 
                    ? `$${card.tcgplayer.prices.normal.market.toFixed(2)}` 
                    : (card.tcgplayer?.prices?.holofoil?.market 
                      ? `$${card.tcgplayer.prices.holofoil.market.toFixed(2)}` 
                      : (card.tcgplayer?.prices?.reverseHolofoil?.market
                        ? `$${card.tcgplayer.prices.reverseHolofoil.market.toFixed(2)}`
                        : "N/A"))}
                </p>
              </div>
              <div className="bg-secondary/40 p-4 rounded-2xl border border-border/50">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Cardmarket Trend</p>
                <p className="text-lg font-black text-blue-500 mt-1">
                  {card.cardmarket?.prices?.trendPrice 
                    ? `${card.cardmarket.prices.trendPrice.toFixed(2)}€` 
                    : (card.cardmarket?.prices?.averageSellPrice 
                      ? `${card.cardmarket.prices.averageSellPrice.toFixed(2)}€` 
                      : "N/A")}
                </p>
              </div>
            </div>
          </div>

          {/* Collection Management */}
          {user && (
            <div className="pt-6 border-t border-border/60">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-secondary/30 border border-border/50 shadow-inner">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Your Collection</h4>
                  <p className="text-2xl font-black italic uppercase tracking-tight">
                    {ownedCount} {ownedCount === 1 ? 'Copy' : 'Copies'}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleToggleCollection('remove')}
                    disabled={isUpdating || ownedCount === 0}
                    className="p-4 rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white"
                    title="Remove copy"
                  >
                    <Minus className="h-6 w-6" strokeWidth={3} />
                  </button>
                  
                  <div className="min-w-[4rem] text-center">
                    {isUpdating ? (
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    ) : (
                      <span className="text-4xl font-black tabular-nums" style={{ color: typeAccent }}>{ownedCount}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleCollection('add')}
                    disabled={isUpdating}
                    className="p-4 rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white"
                    title="Add copy"
                  >
                    <Plus className="h-6 w-6" strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          )}
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
