"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, Layers, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { CardDetailModal } from "@/components/card-detail-modal"

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

interface Era {
  name: string
  logo: string
  setCount: number
  releaseDate: string
  sets: TcgSet[]
}

export function SetsSection() {
  const [allSets, setAllSets] = useState<TcgSet[]>([])
  const [selectedEra, setSelectedEra] = useState<Era | null>(null)
  const [selectedSet, setSelectedSet] = useState<TcgSet | null>(null)
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCards, setLoadingCards] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedCard, setSelectedCard] = useState<any | null>(null)

  useEffect(() => {
    fetchAllSets()
  }, [])

  const fetchAllSets = async () => {
    setLoading(true)
    try {
      const response = await fetch("https://api.pokemontcg.io/v2/sets")
      const result = await response.json()
      setAllSets(result.data)
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

  const eras = useMemo(() => {
    if (!allSets.length) return []

    const grouped = allSets.reduce((acc: Record<string, TcgSet[]>, set) => {
      if (!acc[set.series]) acc[set.series] = []
      acc[set.series].push(set)
      return acc
    }, {})

    return Object.entries(grouped).map(([name, eraSets]) => {
      // Ordenar sets dentro de cada era de más reciente a más antiguo
      const sortedEraSets = [...eraSets].sort((a, b) => 
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      )

      let logoSet = sortedEraSets.find(s => s.name.toLowerCase() === name.toLowerCase())
      if (name === "Base" || name === "Original") {
        const baseSet = sortedEraSets.find(s => s.name === "Base")
        if (baseSet) logoSet = baseSet
      }

      if (!logoSet) logoSet = sortedEraSets[0]

      return {
        name,
        logo: logoSet.images.logo,
        setCount: sortedEraSets.length,
        // Usamos la fecha del set más reciente para ordenar las eras entre sí
        releaseDate: sortedEraSets[0].releaseDate,
        sets: sortedEraSets
      }
    }).sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
  }, [allSets])

  const handleEraClick = (era: Era) => {
    setSelectedEra(era)
    setSelectedSet(null)
  }

  const handleSetClick = (set: TcgSet) => {
    setSelectedSet(set)
    setCards([])
    setPage(1)
    setHasMore(true)
    fetchCards(set.id, 1)
  }

  const handleBack = () => {
    if (selectedSet) {
      setSelectedSet(null)
      setCards([])
      setPage(1)
      setHasMore(true)
    } else {
      setSelectedEra(null)
    }
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
            {(selectedEra || selectedSet) && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack}
                className="mr-2 hover:bg-accent/50"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            <h2 className="font-serif text-4xl font-bold text-foreground">
              {selectedSet ? selectedSet.name : (selectedEra ? selectedEra.name : "Expansion Eras")}
            </h2>
          </div>
          <p className="text-muted-foreground text-lg ml-2">
            {selectedSet 
              ? `${selectedSet.series} • ${selectedSet.ptcgoCode || ''} • ${format(new Date(selectedSet.releaseDate), "yyyy")}`
              : (selectedEra 
                ? `Browse all sets from the ${selectedEra.name} era` 
                : "Explore the history of Pokémon TCG through its various eras")}
          </p>
        </div>
        {selectedSet && (
          <div className="hidden md:block">
            <img src={selectedSet.images.logo} alt="" className="h-16 w-auto object-contain drop-shadow-lg" />
          </div>
        )}
      </div>
      
      {!selectedEra ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {eras.map((era) => (
            <Card 
              key={era.name} 
              onClick={() => handleEraClick(era)}
              className="group cursor-pointer overflow-hidden border-none bg-secondary/30 hover:bg-secondary/50 transition-all duration-500 hover:scale-[1.02] shadow-sm hover:shadow-xl"
            >
              <div className="relative aspect-[16/9] overflow-hidden flex items-center justify-center p-6">
                <img 
                  src={era.logo} 
                  alt={era.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {era.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Layers className="h-4 w-4" />
                    <span>{era.setCount} Sets</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Released {format(new Date(era.releaseDate), "MMMM yyyy")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !selectedSet ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {selectedEra.sets.map((set) => (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
            {cards.map((card) => (
              <div key={card.id} className="group relative cursor-pointer" onClick={() => setSelectedCard(card)}>
                <div className="aspect-[2.5/3.5] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <img 
                    src={card.images.small} 
                    alt={card.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-2 px-1">
                  <p className="text-xs font-bold truncate text-foreground/80">{card.name}</p>
                  <p className="text-[10px] text-muted-foreground">#{card.number}</p>
                </div>
              </div>
            ))}
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
