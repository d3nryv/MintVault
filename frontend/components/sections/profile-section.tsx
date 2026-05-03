"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Calendar, Globe, Layers, Search, Filter, ChevronRight, Share2, MoreHorizontal, ChevronDown, Plus, X, Loader2, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Binder, BinderSize } from "@/lib/types/binder"
import { binders } from "@/lib/mocks/binders"

interface CollectedSet {
  id: string
  name: string
  owned: number
  total: number
  image: string
  symbol: string
  era: string
  lang: string
}

interface CollectedPokemon {
  name: string
  owned: number
  total: number
  sprite: string
}


export function ProfileSection() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [bindersList, setBindersList] = useState<any[]>([])
  const [userSets, setUserSets] = useState<CollectedSet[]>([])
  const [userPokemons, setUserPokemons] = useState<CollectedPokemon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (!user) return
    fetchCollectionData()
  }, [user?.id, user?.ownedEnglishCards, user?.ownedPokemon])

  const fetchCollectionData = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      // 1. Fetch Binders from DB
      const bindersRes = await fetch(`http://127.0.0.1:3000/api/albums`)
      if (bindersRes.ok) {
        const allBinders = await bindersRes.json()
        setBindersList(allBinders.filter((b: any) => b.ownerId === user.id))
      }

      // 2. Process Sets from ownedEnglishCards
      const ownedEnglishCards = (user.ownedEnglishCards || []).filter(id => !!id)
      if (ownedEnglishCards.length) {
        const setIds = Array.from(new Set(ownedEnglishCards.map(id => id.split('-')[0])))
        
        const idsQuery = setIds.slice(0, 20).join(' OR id:')
        const res = await fetch(`https://api.pokemontcg.io/v2/sets?q=id:${idsQuery}`)
        const data = await res.json()
        const setsData = data.data || []
 
        const processedSets: CollectedSet[] = setsData
          .filter(Boolean)
          .map((s: any) => ({
            id: s.id,
            name: s.name,
            owned: ownedEnglishCards.filter(id => id.startsWith(s.id + '-')).length || 0,
            total: s.total,
            image: s.images.logo,
            symbol: s.images.symbol,
            era: s.series.toLowerCase(),
            lang: 'en'
          }))
        
        setUserSets(processedSets)
      }

      // 3. Process Pokemons from ownedPokemon
      const pokemonCardIds = Array.from(new Set((user.ownedPokemon || []).filter(id => id && id.includes('-'))))
      if (pokemonCardIds.length) {
        try {
          const idsQuery = pokemonCardIds.slice(0, 150).map(id => `id:${id}`).join(' OR ')
          const cardsRes = await fetch(`https://api.pokemontcg.io/v2/cards?q=${idsQuery}`)
          const cardsData = await cardsRes.json()
          const cards = cardsData.data || []

          const speciesMap = new Map<number, { count: number, ids: Set<string> }>()
          for (const card of cards) {
            if (card.nationalPokedexNumbers?.[0]) {
              const dexNum = card.nationalPokedexNumbers[0]
              if (!speciesMap.has(dexNum)) {
                speciesMap.set(dexNum, { count: 0, ids: new Set() })
              }
              const species = speciesMap.get(dexNum)!
              if (!species.ids.has(card.id)) {
                species.ids.add(card.id)
                species.count++
              }
            }
          }

          const pokemonData = await Promise.all(
            Array.from(speciesMap.entries()).map(async ([dexNum, data]) => {
              try {
                const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${dexNum}`)
                if (!pokeRes.ok) throw new Error('Pokemon not found')
                const pokeData = await pokeRes.json()
                const sprite = pokeData.sprites.other?.['official-artwork']?.front_default || pokeData.sprites.front_default
                const speciesName = pokeData.name

                const tcgRes = await fetch(`https://api.pokemontcg.io/v2/cards?q=nationalPokedexNumbers:${dexNum}&pageSize=1`)
                const tcgData = await tcgRes.json()
                const total = tcgData.totalCount

                return {
                  name: speciesName,
                  owned: data.count,
                  total,
                  sprite
                }
              } catch { return null }
            })
          )
          setUserPokemons(pokemonData.filter(Boolean) as CollectedPokemon[])
        } catch (err) {
          console.error("Error fetching pokemon card data:", err)
        }
      } else {
        setUserPokemons([])
      }
    } catch (error) {
      console.error("Error fetching collection profile data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // Create binder state
  const [newBinderName, setNewBinderName] = useState("")
  const [newBinderSize, setNewBinderSize] = useState<BinderSize>("3x3")
  const [newBinderSpineColor, setNewBinderSpineColor] = useState("#000000")
  const [newBinderSpineColor2, setNewBinderSpineColor2] = useState("#333333")
  const [newBinderSpineType, setNewBinderSpineType] = useState<"color" | "gradient" | "rainbow">("color")
  const [newBinderCoverType, setNewBinderCoverType] = useState<"color" | "gradient" | "image" | "rainbow">("color")
  const [newBinderCoverValue2, setNewBinderCoverValue2] = useState("#333333")
  const [newBinderCoverValue, setNewBinderCoverValue] = useState("#000000")

  const [hoveredBinder, setHoveredBinder] = useState<number | string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [eraFilter, setEraFilter] = useState("all-eras")
  const [langFilter, setLangFilter] = useState("all")
  const [expandedLang, setExpandedLang] = useState<string | null>(null)

  const handleCreateBinder = async () => {
    if (!newBinderName || !newBinderSize || !user) return

    const spineColor = newBinderSpineType === "gradient" 
      ? `linear-gradient(to bottom, ${newBinderSpineColor}, ${newBinderSpineColor2})`
      : newBinderSpineType === "rainbow" ? "linear-gradient(180deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 56%, #4b0082 70%, #8b00ff 84%, #ff0000 100%)" : newBinderSpineColor

    const coverValue = newBinderCoverType === "gradient"
      ? `linear-gradient(to bottom right, ${newBinderCoverValue}, ${newBinderCoverValue2})`
      : newBinderCoverType === "rainbow" ? "linear-gradient(135deg, #ff0000 0%, #ffff00 25%, #00ff00 50%, #0000ff 75%, #ff00ff 100%)" : newBinderCoverValue

    const newBinderData = {
      ownerId: user.id,
      name: newBinderName,
      height: parseInt(newBinderSize.split('x')[0], 10),
      width: parseInt(newBinderSize.split('x')[1], 10),
      coverUrl: newBinderCoverType === 'image' ? newBinderCoverValue : null,
    }

    try {
      const response = await fetch(`http://127.0.0.1:3000/api/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBinderData)
      })

      if (response.ok) {
        const createdBinder = await response.json()
        setBindersList(prev => [createdBinder, ...prev])
        setIsCreateModalOpen(false)
        router.push(`/profile/binder/${createdBinder.id}`)
      }
    } catch (error) {
      console.error("Error creating binder:", error)
    }

    // Reset state
    setNewBinderName("")
    setNewBinderSize("3x3")
    setNewBinderSpineColor("#000000")
    setNewBinderSpineColor2("#333333")
    setNewBinderSpineType("color")
    setNewBinderCoverType("color")
    setNewBinderCoverValue("#000000")
    setNewBinderCoverValue2("#333333")
  }

  const [showcaseCards, setShowcaseCards] = useState<any[]>([])
  
  useEffect(() => {
    if (user?.showcase?.length) {
      fetchShowcaseCards()
    } else {
      setShowcaseCards([])
    }
  }, [user?.showcase])

  const fetchShowcaseCards = async () => {
    if (!user?.showcase) return
    try {
      const cards = await Promise.all(
        user.showcase.map(async (id) => {
          try {
            const res = await fetch(`https://api.pokemontcg.io/v2/cards/${id}`)
            const data = await res.json()
            return data.data
          } catch { return null }
        })
      )
      setShowcaseCards(cards.filter(Boolean))
    } catch (error) {
      console.error("Error fetching showcase cards:", error)
    }
  }

  const totalCards = Array.from(new Set((user?.ownedEnglishCards || []).filter(id => !!id))).length + 
                     Array.from(new Set((user?.ownedPokemon || []).filter(id => id && id.includes('-')))).length

  const filteredSets = userSets.filter(set => {
    const matchesSearch = set.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesEra = eraFilter === "all-eras" || set.era === eraFilter
    const matchesLang = langFilter === "all" || set.lang === langFilter
    return matchesSearch && matchesEra && matchesLang
  })

  const [isShowcaseModalOpen, setIsShowcaseModalOpen] = useState(false)
  const [showcaseSearch, setShowcaseSearch] = useState("")
  const [ownedCardsData, setOwnedCardsData] = useState<any[]>([])
  const [isLoadingOwned, setIsLoadingOwned] = useState(false)
  const [visibleSetsCount, setVisibleSetsCount] = useState(8)

  useEffect(() => {
    if (isShowcaseModalOpen) {
      fetchOwnedCards()
    }
  }, [isShowcaseModalOpen])

  const fetchOwnedCards = async () => {
    if (!user?.ownedEnglishCards?.length) {
      setOwnedCardsData([])
      return
    }
    setIsLoadingOwned(true)
    try {
      const uniqueIds = Array.from(new Set([
        ...(user.ownedEnglishCards || []),
        ...(user.ownedPokemon || []).filter(id => id && id.includes('-'))
      ].filter(id => !!id)))
      if (uniqueIds.length === 0) {
        setOwnedCardsData([])
        return
      }
      const ids = uniqueIds.slice(0, 100).join(' OR id:')
      const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=id:${ids}`)
      const data = await res.json()
      setOwnedCardsData(data.data || [])
    } catch (error) {
      console.error("Error fetching owned cards:", error)
    } finally {
      setIsLoadingOwned(false)
    }
  }

  const handleAddToShowcase = async (cardId: string) => {
    if (!user) return
    const newShowcase = [...(user.showcase || []), cardId].slice(0, 5)
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showcase: newShowcase })
      })
      if (response.ok) {
        updateUser({ showcase: newShowcase })
        setIsShowcaseModalOpen(false)
      }
    } catch (error) {
      console.error("Error updating showcase:", error)
    }
  }

  return (
    <section className="py-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Your Collection Profile</h2>
          <p className="text-muted-foreground mt-1">Manage your cards and track your progress</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Collection
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="mb-8 bg-card shadow-sm border-border/50 overflow-hidden rounded-3xl">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <Avatar className="h-28 w-28 border-4 border-primary/20 shadow-2xl ring-4 ring-primary/5">
              <AvatarImage src={user?.profilePicUrl || "/placeholder-avatar.jpg"} alt={user?.username || "Profile"} />
              <AvatarFallback className="text-4xl bg-muted text-muted-foreground font-black">
                {user?.username?.substring(0, 2).toUpperCase() || "TC"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <h3 className="text-4xl font-black text-foreground tracking-tight font-sans italic">
                  {user?.username || "Trainer Collector"}
                </h3>
                <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-1 uppercase tracking-widest text-[10px]">Elite Trainer</Badge>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-muted-foreground/80 font-sans uppercase tracking-[0.1em]">
                <span className="flex items-center gap-2 bg-secondary/80 px-4 py-1.5 rounded-full border border-border/50 shadow-sm">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Collector since 2026
                </span>
                <span className="flex items-center gap-2 bg-secondary/80 px-4 py-1.5 rounded-full border border-border/50 shadow-sm">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Global Collector
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1 shrink-0 self-stretch justify-center border-t md:border-t-0 md:border-l border-border/50 pt-8 md:pt-0 md:pl-12 lg:pl-16">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.25em] mb-1">Total Collection</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-foreground tabular-nums tracking-tighter">{totalCards}</span>
                <span className="text-sm font-black text-primary uppercase tracking-widest">cards</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Showcase - Full Width */}
        <Card className="bg-card shadow-sm border-border/50 lg:col-span-2 overflow-hidden rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4">
            <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Showcase</CardTitle>
            <Dialog open={isShowcaseModalOpen} onOpenChange={setIsShowcaseModalOpen}>
              <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-2xl border-border/50 rounded-[2.5rem] shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">Select from Collection</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="Search your cards..."
                      className="pl-14 h-14 bg-secondary/50 border-border/50 rounded-2xl font-bold"
                      value={showcaseSearch}
                      onChange={(e) => setShowcaseSearch(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto p-2 custom-scrollbar">
                    {isLoadingOwned ? (
                      <div className="col-span-full flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : ownedCardsData.length > 0 ? (
                      ownedCardsData
                        .filter(c => c.name.toLowerCase().includes(showcaseSearch.toLowerCase()))
                        .map(card => (
                          <div 
                            key={card.id} 
                            className="aspect-[2.5/3.5] bg-muted rounded-xl overflow-hidden cursor-pointer hover:ring-4 hover:ring-primary/50 transition-all"
                            onClick={() => handleAddToShowcase(card.id)}
                          >
                            <img src={card.images.small} alt={card.name} className="w-full h-full object-cover" />
                          </div>
                        ))
                    ) : (
                      <p className="col-span-full text-center py-12 text-muted-foreground font-bold">No cards in collection</p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-5 gap-6">
              {[0, 1, 2, 3, 4].map((i) => {
                const card = showcaseCards[i]
                return card ? (
                  <div key={card.id} className="group cursor-pointer relative">
                    <div className="relative aspect-[2.5/3.5] bg-muted rounded-3xl mb-3 overflow-hidden shadow-md group-hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] transition-all duration-700 group-hover:-translate-y-4 group-hover:ring-8 group-hover:ring-primary/10">
                      <img src={card.images.large || card.images.small} alt={card.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                        <div className="min-w-0">
                          <p className="text-xs text-white font-black leading-tight truncate uppercase tracking-tighter">{card.name}</p>
                          <p className="text-[9px] text-white/60 font-black truncate uppercase tracking-widest">{card.set.name}</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        const newShowcase = (user?.showcase || []).filter(id => id !== card.id)
                        updateUser({ showcase: newShowcase })
                        // Update in DB too
                        fetch(`http://127.0.0.1:3000/api/users/${user?.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ showcase: newShowcase })
                        })
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    key={i} 
                    className="aspect-[2.5/3.5] bg-secondary/20 border-4 border-dashed border-border/30 rounded-3xl flex items-center justify-center cursor-pointer hover:bg-secondary/40 hover:border-primary/30 transition-all group"
                    onClick={() => setIsShowcaseModalOpen(true)}
                  >
                    <Plus className="h-10 w-10 text-muted-foreground/30 group-hover:text-primary group-hover:scale-125 transition-all" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pokemon Collection - Left */}
        <Card className="bg-card shadow-sm border-border/50 overflow-hidden rounded-3xl h-full flex flex-col max-h-[500px]">
          <CardHeader className="p-8 pb-4 shrink-0">
            <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              Pokemon Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-4 flex-1 overflow-hidden flex flex-col">
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {userPokemons.length > 0 ? userPokemons.map((pk) => (
                <div key={pk.name} className="space-y-4 p-5 rounded-3xl bg-secondary/20 border border-border/5 hover:bg-secondary/40 transition-all duration-300">
                  <div className="flex items-center gap-5">
                    <div className="bg-background w-16 h-16 flex items-center justify-center rounded-2xl shadow-lg border border-border/30 p-2">
                      <img src={pk.sprite} alt={pk.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-2 items-baseline px-1">
                        <span className="text-sm font-black text-foreground uppercase tracking-wider">{pk.name}</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{pk.owned} / {pk.total} cards</span>
                      </div>
                      <Progress value={(pk.owned / pk.total) * 100} className="h-2.5 bg-secondary shadow-inner" />
                    </div>
                    <ChevronRight 
                      className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                      onClick={() => router.push(`/pokemon/${encodeURIComponent(pk.name)}`)}
                    />
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm font-bold">You are not collecting any specific Pokemon species yet.</p>
                  <Button 
                    variant="link" 
                    className="text-primary font-black uppercase tracking-widest text-[10px]"
                    onClick={() => router.push('/collection?tab=pokedex')}
                  >
                    Browse Pokédex
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Binders - Right */}
        <Card className="bg-card shadow-sm border-border/50 overflow-hidden rounded-3xl h-fit">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
              <Layers className="h-6 w-6 text-primary" />
              Binders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="flex gap-3 h-80 overflow-x-auto pb-6 scrollbar-hide group/binders">
              {bindersList.map((binder) => (
                <div
                  key={binder.id}
                  onClick={() => router.push(`/profile/binder/${binder.id}`)}
                  className="relative flex h-full transition-all duration-700 ease-in-out cursor-pointer overflow-hidden rounded-[2rem] shadow-xl border border-border/10 w-12 md:w-14 hover:w-56 group shrink-0"
                >
                  <div
                    className="w-12 md:w-14 h-full flex items-center justify-center shrink-0 z-10 shadow-[5px_0_20px_rgba(0,0,0,0.2)]"
                    style={{ background: binder.spineColor }}
                  >
                    <span
                      className="whitespace-nowrap font-black text-[10px] md:text-xs uppercase tracking-[0.3em] [writing-mode:vertical-rl] rotate-180"
                      style={{ color: binder.metadata?.spineTextColor || binder.spineTextColor || "#ffffff" }}
                    >
                      {binder.name}
                    </span>
                  </div>
                  <div
                    className="h-full flex-1 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-x-10 group-hover:translate-x-0"
                    style={{
                      background: (binder.metadata?.coverType || binder.coverType) === 'image' 
                        ? `url(${binder.metadata?.coverValue || binder.coverValue || binder.cover_url}) center/cover no-repeat` 
                        : (binder.metadata?.coverValue || binder.coverValue),
                    }}
                  >
                    {((binder.metadata?.coverType || binder.coverType) === 'color' || (binder.metadata?.coverType || binder.coverType) === 'gradient' || (binder.metadata?.coverType || binder.coverType) === 'rainbow') && (
                      <div className="w-full h-full flex items-end p-8 bg-black/10 backdrop-blur-[2px]">
                        <span className="text-white/30 font-black text-8xl uppercase tracking-tighter italic">{binder.name[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <button className="w-14 h-full border-4 border-dashed border-border/50 rounded-[2rem] flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group shrink-0">
                    <span className="text-3xl font-black group-hover:scale-125 transition-transform duration-500">+</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-card/95 backdrop-blur-2xl border-border/50 rounded-[2.5rem] shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">Create New Album</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Album Name</Label>
                      <Input 
                        placeholder="e.g. My Secret Rares" 
                        className="h-12 bg-secondary/50 border-border/50 rounded-2xl font-bold"
                        value={newBinderName}
                        onChange={(e) => setNewBinderName(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Size</Label>
                        <Select value={newBinderSize} onValueChange={(v: BinderSize) => setNewBinderSize(v)}>
                          <SelectTrigger className="h-12 bg-secondary/50 border-border/50 rounded-2xl font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-border/50">
                            <SelectItem value="2x2" className="rounded-xl">2x2 Slots</SelectItem>
                            <SelectItem value="3x3" className="rounded-xl">3x3 Slots</SelectItem>
                            <SelectItem value="4x3" className="rounded-xl">4x3 Slots</SelectItem>
                            <SelectItem value="4x4" className="rounded-xl">4x4 Slots</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Spine Style</Label>
                        <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl border border-border/50">
                          {["color", "gradient", "rainbow"].map((type) => (
                            <button
                              key={type}
                              onClick={() => setNewBinderSpineType(type as any)}
                              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${newBinderSpineType === type ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-primary/10"}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {newBinderSpineType === "color" && (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Pick Color</Label>
                          <Input 
                            type="color" 
                            className="h-12 w-full p-1 bg-secondary/50 border-border/50 rounded-2xl cursor-pointer"
                            value={newBinderSpineColor}
                            onChange={(e) => setNewBinderSpineColor(e.target.value)}
                          />
                        </div>
                      )}

                      {newBinderSpineType === "gradient" && (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Gradient Colors</Label>
                          <div className="flex gap-2">
                            <Input 
                              type="color" 
                              className="h-12 flex-1 p-1 bg-secondary/50 border-border/50 rounded-2xl cursor-pointer"
                              value={newBinderSpineColor}
                              onChange={(e) => setNewBinderSpineColor(e.target.value)}
                            />
                            <Input 
                              type="color" 
                              className="h-12 flex-1 p-1 bg-secondary/50 border-border/50 rounded-2xl cursor-pointer"
                              value={newBinderSpineColor2}
                              onChange={(e) => setNewBinderSpineColor2(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cover Style</Label>
                      <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl border border-border/50">
                        {["color", "gradient", "image", "rainbow"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setNewBinderCoverType(type as any)}
                            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${newBinderCoverType === type ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-primary/10"}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {newBinderCoverType === "color" && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Pick Color</Label>
                        <Input 
                          type="color" 
                          className="h-12 w-full p-1 bg-secondary/50 border-border/50 rounded-2xl cursor-pointer"
                          value={newBinderCoverValue}
                          onChange={(e) => setNewBinderCoverValue(e.target.value)}
                        />
                      </div>
                    )}

                    {newBinderCoverType === "gradient" && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Gradient Colors</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="color" 
                            className="h-12 flex-1 p-1 bg-secondary/50 border-border/50 rounded-2xl cursor-pointer"
                            value={newBinderCoverValue}
                            onChange={(e) => setNewBinderCoverValue(e.target.value)}
                          />
                          <Input 
                            type="color" 
                            className="h-12 flex-1 p-1 bg-secondary/50 border-border/50 rounded-2xl cursor-pointer"
                            value={newBinderCoverValue2}
                            onChange={(e) => setNewBinderCoverValue2(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {newBinderCoverType === "image" && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Image URL</Label>
                        <Input 
                          placeholder="https://..." 
                          className="h-12 bg-secondary/50 border-border/50 rounded-2xl font-bold"
                          value={newBinderCoverValue}
                          onChange={(e) => setNewBinderCoverValue(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button 
                      className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      onClick={handleCreateBinder}
                      disabled={!newBinderName}
                    >
                      Create Album
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Your Sets - Full Grid */}
        <Card className="bg-card shadow-sm border-border/50 lg:col-span-2 overflow-hidden rounded-[3rem]">
          <CardHeader className="p-10 pb-8 flex flex-col space-y-8">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-black uppercase tracking-tight italic">Your Collected Sets</CardTitle>
            </div>

            <div className="flex flex-col md:flex-row gap-5">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Find a specific set..."
                  className="pl-14 h-14 bg-secondary/50 border-border/50 focus-visible:ring-primary/20 rounded-2xl font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={eraFilter} onValueChange={setEraFilter}>
                  <SelectTrigger className="w-[180px] h-14 bg-secondary/50 border-border/50 rounded-2xl font-black uppercase text-[10px] tracking-widest focus:ring-primary/20">
                    <Filter className="h-4 w-4 mr-2 text-primary" />
                    <SelectValue placeholder="ERA" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 shadow-2xl p-2 font-bold">
                    <SelectItem value="all-eras" className="rounded-xl">All Eras</SelectItem>
                    <SelectItem value="sv" className="rounded-xl">Scarlet & Violet</SelectItem>
                    <SelectItem value="swsh" className="rounded-xl">Sword & Shield</SelectItem>
                    <SelectItem value="sun-moon" className="rounded-xl">Sun & Moon</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={langFilter} onValueChange={setLangFilter}>
                  <SelectTrigger className="w-[150px] h-14 bg-secondary/50 border-border/50 rounded-2xl font-black uppercase text-[10px] tracking-widest focus:ring-primary/20">
                    <Globe className="h-4 w-4 mr-2 text-primary" />
                    <SelectValue placeholder="LANG" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 shadow-2xl p-2 font-bold">
                    <SelectItem value="all" className="rounded-xl">All Langs</SelectItem>
                    <SelectItem value="en" className="rounded-xl">English</SelectItem>
                    <SelectItem value="jp" className="rounded-xl">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-8 pb-4">
              {isLoading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-sm">Analyzing your collection...</p>
                </div>
              ) : filteredSets.length > 0 ? (
                filteredSets.slice(0, visibleSetsCount).map((set) => (
                  <div
                    key={set.id}
                    onClick={() => router.push(`/collection?tab=sets&set=${set.id}`)}
                    className="group relative h-72 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-700 border border-border/10 ring-1 ring-white/5"
                  >
                    {/* Background Decoration */}
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-background/50 flex items-center justify-center p-16 overflow-hidden">
                      <img
                        src={set.image}
                        alt={set.name}
                        className="w-full h-full object-contain opacity-10 filter grayscale-100 transition-all duration-1000 group-hover:scale-150 group-hover:opacity-50 group-hover:grayscale-0"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-[85%] bg-gradient-to-t from-black/100 via-black/60 to-transparent" />
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-8 space-y-6">
                      <div className="flex justify-between items-end">
                        <div className="min-w-0 space-y-1">
                          <img src={set.symbol} alt={set.name} className="h-10 object-contain mb-4 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:translate-x-2" />
                          <h4 className="text-white font-black text-2xl leading-tight truncate drop-shadow-2xl tracking-tight italic uppercase">{set.name}</h4>
                          <div className="flex items-center gap-3 mt-3">
                            <Badge variant="outline" className="text-[9px] font-black text-white/40 border-white/5 bg-white/5 uppercase tracking-[0.25em] py-0.5 px-3 rounded-full">{set.era}</Badge>
                            <Badge variant="outline" className="text-[9px] font-black text-primary/60 border-primary/10 bg-primary/5 uppercase tracking-[0.25em] py-0.5 px-3 rounded-full">{set.lang}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-black text-3xl leading-none tracking-tighter drop-shadow-xl">
                            {set.owned}<span className="text-white/30 text-xs font-bold ml-1 tracking-normal italic"> / {set.total}</span>
                          </p>
                          <p className="text-[10px] font-black text-primary leading-none mt-3 uppercase tracking-[0.3em] drop-shadow-md">Master Set</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Mastery Progress</span>
                          <span className="text-xs font-black text-white tabular-nums drop-shadow-sm">{Math.round((set.owned / set.total) * 100)}%</span>
                        </div>
                        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1 backdrop-blur-sm">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_25px_rgba(var(--primary-rgb),1)] relative overflow-hidden"
                            style={{ width: `${(set.owned / set.total) * 100}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border/30">
                  <Layers className="h-16 w-16 mx-auto mb-6 text-muted-foreground/20" />
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-sm mb-4">No collected sets found</p>
                  <Button 
                    variant="outline" 
                    className="font-black uppercase tracking-widest text-[10px] rounded-full px-8"
                    onClick={() => router.push('/collection?tab=sets')}
                  >
                    Explore Sets
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-16 flex justify-center">
              {filteredSets.length > visibleSetsCount && (
                <Button 
                  variant="outline" 
                  onClick={() => setVisibleSetsCount(prev => prev + 8)}
                  className="text-muted-foreground hover:text-primary gap-4 text-xs font-black uppercase tracking-[0.4em] group px-16 h-16 border-border/50 hover:border-primary/50 rounded-full bg-card/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all hover:scale-105 active:scale-95"
                >
                  Load More Sets
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
