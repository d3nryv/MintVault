"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, Layers, Loader2, Search, Filter, ArrowUpDown, CheckCircle, Circle } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { format } from "date-fns"
import { CardDetailModal } from "@/components/card-detail-modal"

/**
 * Structure of a Pokémon TCG expansion set object as returned by the pokemontcg API.
 */
interface TcgSet {
  id: string
  name: string
  series: string
  ptcgoCode?: string
  releaseDate: string
  images: {
    symbol: string
    logo: string
  }
  printedTotal: number
  total: number
}

/**
 * Grouped metadata container representing a TCG Series (e.g. Scarlet & Violet, Sword & Shield) and all its constituent expansion sets.
 */
interface SeriesData {
  name: string
  logo: string
  setCount: number
  releaseDate: string
  sets: TcgSet[]
}

/**
 * SetsSection component providing a hierarchical browser for Pokémon TCG expansion series and individual sets.
 * Manages infinite scrolling card pagination, ownership filtering, sorting, and grayscale missing-card visualizer.
 *
 * @returns React functional component rendering the expansion sets browser.
 */
export function SetsSection() {
  const [allSets, setAllSets] = useState<TcgSet[]>([])
  const [selectedSeries, setSelectedSeries] = useState<SeriesData | null>(null)
  const [selectedSet, setSelectedSet] = useState<TcgSet | null>(null)
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCards, setLoadingCards] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedCard, setSelectedCard] = useState<any | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  // State controls for filtering and sorting card displays within a set
  const [cardSearch, setCardSearch] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [collectionFilter, setCollectionFilter] = useState<"all" | "owned" | "not-owned">("all")
  const [showGrayscale, setShowGrayscale] = useState(false)

  useEffect(() => {
    fetchAllSets()
  }, [])

  const fetchAllSets = async () => {
    setLoading(true)
    try {
      const response = await fetch("https://api.pokemontcg.io/v2/sets")
      const result = await response.json()
      setAllSets(result.data)
      
      // Handle auto-loading set from query param
      // We will do this in a separate useEffect that depends on eras
    } catch (error) {
      console.error("Error fetching sets:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCards = async (setId: string, currentPage: number) => {
    if (loadingCards) return
    setLoadingCards(true)
    try {
      const pageSize = 40
      const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&page=${currentPage}&pageSize=${pageSize}&orderBy=number`)
      const result = await response.json()
      
      const newCards = result.data
      if (newCards.length < pageSize) {
        setHasMore(false)
      } else {
        setHasMore(true)
      }

      setCards(prev => {
        // Prevent duplicates
        const existingIds = new Set(prev.map(c => c.id))
        const filteredNewCards = newCards.filter((c: any) => !existingIds.has(c.id))
        return [...prev, ...filteredNewCards]
      })
    } catch (error) {
      console.error("Error fetching cards:", error)
    } finally {
      setLoadingCards(false)
    }
  }

  // Infinite scroll observer
  useEffect(() => {
    if (!selectedSet || !hasMore || loadingCards) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingCards && hasMore) {
          setPage(prev => {
            const nextPage = prev + 1
            fetchCards(selectedSet.id, nextPage)
            return nextPage
          })
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    )

    const target = document.querySelector("#load-more-trigger")
    if (target) observer.observe(target)

    return () => observer.disconnect()
  }, [selectedSet, hasMore, loadingCards])

  const seriesList = useMemo(() => {
    if (!allSets.length) return []

    const grouped = allSets.reduce((acc: Record<string, TcgSet[]>, set) => {
      if (!acc[set.series]) acc[set.series] = []
      acc[set.series].push(set)
      return acc
    }, {})

    return Object.entries(grouped).map(([name, seriesSets]) => {
      // Sort sets within each series from newest to oldest
      const sortedSeriesSets = [...seriesSets].sort((a, b) => 
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      )

      let logoSet = sortedSeriesSets.find(s => s.name.toLowerCase() === name.toLowerCase())
      if (name === "Base" || name === "Original") {
        const baseSet = sortedSeriesSets.find(s => s.name === "Base")
        if (baseSet) logoSet = baseSet
      }

      if (!logoSet) logoSet = sortedSeriesSets[0]

      return {
        name,
        logo: logoSet.images.logo,
        setCount: sortedSeriesSets.length,
        // Use the most recent set's release date to sort the series
        releaseDate: sortedSeriesSets[0].releaseDate,
        sets: sortedSeriesSets
      }
    }).sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
  }, [allSets])

  const groupedSeries = seriesList // Alias for auto-loading logic

  useEffect(() => {
    const setId = searchParams.get("set")
    if (setId && seriesList.length > 0 && !selectedSet) {
       for (const series of seriesList) {
         const set = series.sets.find(s => s.id === setId)
         if (set) {
           setSelectedSeries(series)
           setSelectedSet(set)
           fetchCards(set.id, 1)
           break;
         }
       }
    }
  }, [seriesList, searchParams, selectedSet])

  const handleSeriesClick = (series: SeriesData) => {
    setSelectedSeries(series)
    setSelectedSet(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSetClick = (set: TcgSet) => {
    setSelectedSet(set)
    setCards([])
    setPage(1)
    setHasMore(true)
    fetchCards(set.id, 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    if (searchParams.get("set")) {
      router.push('/collection?tab=sets', { scroll: false })
    }

    if (selectedSet) {
      setSelectedSet(null)
      setCards([])
      setPage(1)
      setHasMore(true)
    } else {
      setSelectedSeries(null)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getCardId = (set: TcgSet, card: any) => {
    return card.id
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {(selectedSeries || selectedSet) && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack}
                className="mr-2 hover:bg-accent/50"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            <h2 className="font-sans text-4xl font-bold text-foreground">
              {selectedSet ? selectedSet.name : (selectedSeries ? selectedSeries.name : "Expansion Series")}
            </h2>
          </div>
          <p className="text-muted-foreground text-lg ml-2">
            {selectedSet 
              ? `${selectedSet.series} • ${selectedSet.ptcgoCode || ''} • ${format(new Date(selectedSet.releaseDate), "yyyy")}`
              : (selectedSeries 
                ? `Browse all sets from the ${selectedSeries.name} series` 
                : "Explore the history of Pokémon TCG through its various series")}
          </p>
        </div>
        {selectedSet && (
          <div className="hidden md:block">
            <img src={selectedSet.images.logo} alt="" className="h-16 w-auto object-contain drop-shadow-lg" />
          </div>
        )}
      </div>
      
      {!selectedSeries ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {seriesList.map((series) => (
            <Card 
              key={series.name} 
              onClick={() => handleSeriesClick(series)}
              className="group cursor-pointer overflow-hidden border-none bg-secondary/30 hover:bg-secondary/50 transition-all duration-500 hover:scale-[1.02] shadow-sm hover:shadow-xl"
            >
              <div className="relative aspect-[16/9] overflow-hidden flex items-center justify-center p-6">
                <img 
                  src={series.logo} 
                  alt={series.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {series.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Layers className="h-4 w-4" />
                    <span>{series.setCount} Sets</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Released {format(new Date(series.releaseDate), "MMMM yyyy")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !selectedSet ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {selectedSeries.sets.map((set) => (
            <Card 
              key={set.id} 
              onClick={() => handleSetClick(set)}
              className="group cursor-pointer overflow-hidden border-none bg-card hover:bg-accent/20 transition-all duration-300 hover:-translate-y-2 shadow-md"
            >
              <div className="aspect-[4/3] flex items-center justify-center p-4">
                <img 
                  src={set.images.logo} 
                  alt={set.name}
                  className="max-h-full max-w-full object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <CardContent className="p-5">
                <h4 className="font-bold text-base mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {set.name}
                </h4>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>Cards</span>
                    <span className="font-mono text-foreground/80">{set.printedTotal} / {set.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Release</span>
                    <span>{format(new Date(set.releaseDate), "dd/MM/yyyy")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-4 bg-secondary/20 p-6 rounded-[2rem] border border-border/50">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search cards in this set..."
                className="pl-14 h-14 bg-background/50 border-border/50 rounded-2xl font-bold"
                value={cardSearch}
                onChange={(e) => setCardSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={collectionFilter} onValueChange={(v: any) => setCollectionFilter(v)}>
                <SelectTrigger className="w-[180px] h-14 bg-background/50 border-border/50 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                  <Filter className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="Collection" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50 shadow-2xl p-2 font-bold">
                  <SelectItem value="all" className="rounded-xl italic uppercase">All Cards</SelectItem>
                  <SelectItem value="owned" className="rounded-xl italic uppercase">Owned Only</SelectItem>
                  <SelectItem value="not-owned" className="rounded-xl italic uppercase">Not Owned</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
                <SelectTrigger className="w-[150px] h-14 bg-background/50 border-border/50 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50 shadow-2xl p-2 font-bold">
                  <SelectItem value="asc" className="rounded-xl italic uppercase">Number ↑</SelectItem>
                  <SelectItem value="desc" className="rounded-xl italic uppercase">Number ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-background/50 rounded-2xl border border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Missing in B&W</span>
              <button 
                onClick={() => setShowGrayscale(!showGrayscale)}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${showGrayscale ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 ${showGrayscale ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
            {cards
              .filter(card => {
                const matchesSearch = card.name.toLowerCase().includes(cardSearch.toLowerCase())
                const isOwned = user?.ownedEnglishCards?.includes(card.id)
                const matchesCollection = 
                  collectionFilter === "all" || 
                  (collectionFilter === "owned" && isOwned) || 
                  (collectionFilter === "not-owned" && !isOwned)
                return matchesSearch && matchesCollection
              })
              .sort((a, b) => {
                const numA = parseInt(a.number.replace(/\D/g, '')) || 0
                const numB = parseInt(b.number.replace(/\D/g, '')) || 0
                return sortOrder === "asc" ? numA - numB : numB - numA
              })
              .map((card) => {
                const isOwned = user?.ownedEnglishCards?.includes(card.id)
                const ownedCount = user?.ownedEnglishCards?.filter(id => id === card.id).length || 0
                
                return (
                  <div key={card.id} className="group relative cursor-pointer" onClick={() => setSelectedCard(card)}>
                    <div className={`relative aspect-[2.5/3.5] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${(!isOwned && showGrayscale) ? 'opacity-40 grayscale-[1] hover:opacity-100 hover:grayscale-0' : 'ring-2 ring-primary/20'}`}>
                      <img 
                        src={card.images.small} 
                        alt={card.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {isOwned && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-lg ring-2 ring-white/20">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}
                      {ownedCount > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white/20">
                          x{ownedCount}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 px-1 flex justify-between items-start">
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate text-foreground/80">{card.name}</p>
                        <p className="text-[10px] text-muted-foreground">#{card.number}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
          
          <div id="load-more-trigger" className="py-10 flex justify-center">
            {loadingCards && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground animate-pulse">Loading more cards...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedCard && (
        <CardDetailModal 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
    </section>
  )
}
