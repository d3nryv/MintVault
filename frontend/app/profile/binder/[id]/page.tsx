"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  ArrowLeft,
  Loader2,
  Layers,
  Inbox,
  Share2
} from "lucide-react"
import { Binder, BinderCard, BinderSize } from "@/lib/types/binder"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { binders as mockBinders } from "@/lib/mocks/binders"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock card search function
const searchCards = async (query: string) => {
  // Correct endpoint is /api/cards/search?name=...
  const response = await fetch(`http://127.0.0.1:3000/api/cards/search?name=${encodeURIComponent(query)}`)
  if (!response.ok) throw new Error('Search failed')
  return response.json()
}

// Public API set cards fetch function (same as in SetsSection)
const fetchSetCards = async (setId: string) => {
  const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&orderBy=number&pageSize=250`)
  if (!response.ok) throw new Error('Set fetch failed')
  const result = await response.json()
  return result.data
}

export default function BinderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const binderId = params.id as string

  const [binder, setBinder] = useState<Binder | null>(null)
  const [currentSpread, setCurrentSpread] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"pages" | "cover">("pages")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [setQuery, setSetQuery] = useState("")
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editSpineType, setEditSpineType] = useState<"color" | "gradient" | "rainbow">("color")
  const [editSpineColor, setEditSpineColor] = useState("#000000")
  const [editSpineColor2, setEditSpineColor2] = useState("#333333")
  const [editCoverType, setEditCoverType] = useState<"color" | "gradient" | "image" | "rainbow">("color")
  const [editCoverValue, setEditCoverValue] = useState("#000000")
  const [editCoverValue2, setEditCoverValue2] = useState("#333333")
  const [allSets, setAllSets] = useState<{id: string, name: string}[]>([])
  const [filteredSets, setFilteredSets] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await fetch("https://api.pokemontcg.io/v2/sets")
        const result = await response.json()
        const setsData = result.data.map((s: any) => ({ id: s.id, name: s.name }))
        setAllSets(setsData)
        setFilteredSets(setsData)
      } catch (e) {
        console.error("Error fetching sets:", e)
      }
    }
    fetchSets()
  }, [])

  useEffect(() => {
    if (setQuery) {
      const filtered = allSets.filter(s => 
        s.name.toLowerCase().includes(setQuery.toLowerCase()) || 
        s.id.toLowerCase().includes(setQuery.toLowerCase())
      )
      setFilteredSets(filtered.slice(0, 10))
    } else {
      setFilteredSets([])
    }
  }, [setQuery, allSets])

  useEffect(() => {
    const fetchBinder = async () => {
      setIsLoading(true)
      
      // Load from localStorage (priority for cross-page persistence)
      const savedBinders = JSON.parse(localStorage.getItem('tcg_temple_binders') || '[]')
      let foundBinder = savedBinders.find((b: any) => String(b.id) === String(binderId))
      
      // Fallback to shared mocks
      if (!foundBinder) {
        foundBinder = mockBinders.find(b => String(b.id) === String(binderId))
      }
      
      if (foundBinder) {
        setBinder({
          ...foundBinder,
          cards: foundBinder.cards?.length > 0 ? foundBinder.cards : Array(360).fill(null),
          ownedCards: foundBinder.ownedCards || {}
        })
        setEditName(foundBinder.name)
        setEditSpineColor(foundBinder.spineColor.includes('gradient') ? '#000000' : foundBinder.spineColor)
        setEditCoverType(foundBinder.coverType)
        setEditCoverValue(foundBinder.coverValue)
      } else {
        setBinder({
          id: binderId,
          name: "New Collection",
          size: "3x3",
          spineColor: "oklch(0.60 0.18 20)",
          spineTextColor: "#ffffff",
          coverType: "color",
          coverValue: "oklch(0.55 0.20 25)",
          cards: Array(360).fill(null)
        })
      }
      setIsLoading(false)
    }

    fetchBinder()
  }, [binderId])

  // Save changes to localStorage
  useEffect(() => {
    if (binder) {
      const savedBinders = JSON.parse(localStorage.getItem('tcg_temple_binders') || '[]')
      const index = savedBinders.findIndex((b: any) => String(b.id) === String(binder.id))
      if (index !== -1) {
        savedBinders[index] = binder
      } else {
        savedBinders.push(binder)
      }
      localStorage.setItem('tcg_temple_binders', JSON.stringify(savedBinders))
    }
  }, [binder])

  const getGridConfig = (size: BinderSize) => {
    switch (size) {
      case "2x2": return { cols: 2, rows: 2, perPage: 4 }
      case "3x3": return { cols: 3, rows: 3, perPage: 9 }
      case "4x3": return { cols: 4, rows: 3, perPage: 12 }
      case "4x4": return { cols: 4, rows: 4, perPage: 16 }
      default: return { cols: 3, rows: 3, perPage: 9 }
    }
  }

  const handleAddCard = (card: any) => {
    if (selectedSlot === null || !binder) return
    
    const newCards = [...binder.cards]
    newCards[selectedSlot] = {
      id: card.id,
      name: card.name,
      image: card.images.small,
      number: card.number,
      set: card.set.name
    }
    
    // Mark as owned by default
    const newOwned = { ...(binder.ownedCards || {}), [selectedSlot]: true }
    setBinder({ ...binder, cards: newCards, ownedCards: newOwned })
    setIsModalOpen(false)
    setSearchResults([])
    setSearchQuery("")
  }

  const handleDragStart = (index: number) => {
    setDraggedSlot(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedSlot === null || draggedSlot === targetIndex || !binder) return
    
    const newCards = [...binder.cards]
    const temp = newCards[draggedSlot]
    newCards[draggedSlot] = newCards[targetIndex]
    newCards[targetIndex] = temp
    
    // Also swap owned status
    const newOwned = { ...(binder.ownedCards || {}) }
    const tempOwned = !!newOwned[draggedSlot]
    newOwned[draggedSlot] = !!newOwned[targetIndex]
    newOwned[targetIndex] = tempOwned
    
    setBinder({ ...binder, cards: newCards, ownedCards: newOwned })
    setDraggedSlot(null)
  }

  const handleDeleteBinder = () => {
    if (!binder) return;
    if (!confirm('Are you sure you want to delete this album?')) return;
    // Remove from localStorage
    const savedBinders = JSON.parse(localStorage.getItem('tcg_temple_binders') || '[]');
    const updatedBinders = savedBinders.filter((b: any) => String(b.id) !== String(binder.id));
    localStorage.setItem('tcg_temple_binders', JSON.stringify(updatedBinders));
    // Navigate back to collection page profile tab
    router.push('/collection?tab=profile');
  }

  const handleUpdateStyle = () => {
    if (!binder) return
    
    const spineColor = editSpineType === "gradient" 
      ? `linear-gradient(to bottom, ${editSpineColor}, ${editSpineColor2})`
      : editSpineType === "rainbow" ? "linear-gradient(to bottom, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)" : editSpineColor

    const coverValue = editCoverType === "gradient"
      ? `linear-gradient(to bottom right, ${editCoverValue}, ${editCoverValue2})`
      : editCoverType === "rainbow" ? "linear-gradient(135deg, #ff0000 0%, #ffff00 25%, #00ff00 50%, #0000ff 75%, #ff00ff 100%)" : editCoverValue

    const updatedBinder = {
      ...binder,
      name: editName,
      spineColor,
      coverType: editCoverType,
      coverValue
    }
    
    setBinder(updatedBinder)
    setIsEditModalOpen(false)
  }

  const handleRemoveCard = (slotIndex: number) => {
    if (!binder) return
    const newCards = [...binder.cards]
    newCards[slotIndex] = null
    setBinder({ ...binder, cards: newCards })
  }

  const toggleOwned = (slotIndex: number) => {
    if (!binder) return
    const newOwned = { ...(binder.ownedCards || {}), [slotIndex]: !binder.ownedCards?.[slotIndex] }
    setBinder({ ...binder, ownedCards: newOwned })
  }

  const handleFillBySet = async () => {
    if (!setQuery || !binder) return
    setIsSearching(true)
    try {
      const cards = await fetchSetCards(setQuery)
      const newCards = [...binder.cards]
      const newOwned = { ...(binder.ownedCards || {}) }
      cards.forEach((card: any, index: number) => {
        if (index < newCards.length) {
          newCards[index] = {
            id: card.id,
            name: card.name,
            image: card.images.small,
            number: card.number,
            set: card.set.name
          }
          newOwned[index] = true // Mark as owned by default
        }
      })
      
      setBinder({ ...binder, cards: newCards, ownedCards: newOwned })
      setIsModalOpen(false)
    } catch (e) {
      console.error("Error filling set:", e)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery) return
    setIsSearching(true)
    try {
      const results = await searchCards(searchQuery)
      setSearchResults(results)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSearching(false)
    }
  }

  if (isLoading || !binder) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  const grid = getGridConfig(binder.size)
  const perSpread = grid.perPage * 2
  const totalSpreads = Math.ceil(binder.cards.length / perSpread)
  
  const leftPageStartIndex = (currentSpread - 1) * perSpread
  const rightPageStartIndex = leftPageStartIndex + grid.perPage
  
  const leftPageCards = binder.cards.slice(leftPageStartIndex, leftPageStartIndex + grid.perPage)
  const rightPageCards = binder.cards.slice(rightPageStartIndex, rightPageStartIndex + grid.perPage)

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-x-hidden">
      <Header />
      <main className="flex-1 pt-24 pb-20 px-4">
        <div className="max-w-[1750px] mx-auto">
          {/* Top Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6">
            <div className="flex items-center gap-6">
              <Button variant="ghost" onClick={() => router.back()} className="rounded-full h-12 px-6 hover:bg-secondary transition-all">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Profile
              </Button>
              <div className="border-l border-border/50 pl-6 flex items-center gap-4 group">
                <div>
                  <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-1">{binder.name}</h1>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    {binder.size} Binder • {viewMode === "cover" ? "Front Cover" : `Spread ${currentSpread} of ${totalSpreads}`}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsEditModalOpen(true)}
                  className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-secondary/50 hover:bg-primary hover:text-primary-foreground h-10 w-10"
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {viewMode === "pages" && (
              <div className="flex items-center gap-2 bg-secondary/20 p-2 rounded-2xl border border-border/50 shadow-inner">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={currentSpread === 1}
                  onClick={() => setCurrentSpread(1)}
                  className="h-10 w-10 rounded-xl"
                >
                  <ChevronsLeft className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={currentSpread === 1}
                  onClick={() => setCurrentSpread(currentSpread - 1)}
                  className="h-10 w-10 rounded-xl"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <div className="px-6 font-black text-lg tabular-nums flex items-center gap-2 min-w-[120px] justify-center">
                  <span className="text-primary">{currentSpread}</span> 
                  <span className="text-muted-foreground/30 text-sm font-bold">/</span> 
                  <span className="text-muted-foreground/50">{totalSpreads}</span>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={currentSpread === totalSpreads}
                  onClick={() => setCurrentSpread(currentSpread + 1)}
                  className="h-10 w-10 rounded-xl"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={currentSpread === totalSpreads}
                  onClick={() => setCurrentSpread(totalSpreads)}
                  className="h-10 w-10 rounded-xl"
                >
                  <ChevronsRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant={viewMode === "cover" ? "default" : "outline"} 
                onClick={() => setViewMode(viewMode === "cover" ? "pages" : "cover")}
                className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest gap-2 border-2 transition-all"
              >
                <Eye className="h-4 w-4" />
                {viewMode === "cover" ? "Show Pages" : "View Cover"}
              </Button>
              <Button className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteBinder}
                className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-destructive/20 hover:scale-105 transition-all"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Binder Visual Container */}
          <div className="flex justify-center items-start min-h-[700px] mb-20 perspective-1000">
            {viewMode === "pages" ? (
              <div className="flex w-full max-w-7xl h-fit bg-card/20 backdrop-blur-xl rounded-[3rem] p-4 border border-border/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] relative">
                {/* Left Page */}
                <div 
                  className="flex-1 grid gap-4 p-8 bg-card/40 rounded-[2.5rem] border border-border/20 shadow-inner"
                  style={{
                    gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
                  }}
                >
                  {leftPageCards.map((card, idx) => {
                    const globalIndex = leftPageStartIndex + idx
                    return (
                      <BinderSlot 
                        key={globalIndex} 
                        card={card} 
                        index={globalIndex} 
                        isOwned={binder?.ownedCards?.[globalIndex] ?? !!card}
                        onAdd={() => { setSelectedSlot(globalIndex); setIsModalOpen(true); }}
                        onRemove={() => handleRemoveCard(globalIndex)}
                        onToggleOwned={() => toggleOwned(globalIndex)}
                        onDragStart={() => handleDragStart(globalIndex)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(globalIndex)}
                        isDragging={draggedSlot === globalIndex}
                      />
                    )
                  })}
                </div>

                {/* Spine */}
                <div className="w-16 relative flex items-center justify-center">
                  <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-black/20 via-black/40 to-black/20 blur-sm shadow-2xl" />
                  <div className="absolute inset-y-8 w-[2px] bg-white/5" />
                  <div className="absolute inset-y-12 w-4 flex flex-col justify-between py-10">
                    {[1,2,3,4].map(i => <div key={i} className="w-full aspect-square rounded-full bg-black/40 border border-white/5 shadow-inner" />)}
                  </div>
                </div>

                {/* Right Page */}
                <div 
                  className="flex-1 grid gap-4 p-8 bg-card/40 rounded-[2.5rem] border border-border/20 shadow-inner"
                  style={{
                    gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
                  }}
                >
                  {rightPageCards.map((card, idx) => {
                    const globalIndex = rightPageStartIndex + idx
                    return (
                      <BinderSlot 
                        key={globalIndex} 
                        card={card} 
                        index={globalIndex} 
                        isOwned={binder?.ownedCards?.[globalIndex] ?? !!card}
                        onAdd={() => { setSelectedSlot(globalIndex); setIsModalOpen(true); }}
                        onRemove={() => handleRemoveCard(globalIndex)}
                        onToggleOwned={() => toggleOwned(globalIndex)}
                        onDragStart={() => handleDragStart(globalIndex)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(globalIndex)}
                        isDragging={draggedSlot === globalIndex}
                      />
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-2xl aspect-[3/4] rounded-[3rem] shadow-2xl overflow-hidden border-8 border-black/10 relative transition-all duration-700 animate-in fade-in zoom-in slide-in-from-bottom-10"
                style={{
                  background: binder.coverType === 'image' ? `url(${binder.coverValue}) center/cover no-repeat` : binder.coverValue,
                }}
              >
                {(binder.coverType === 'color' || binder.coverType === 'gradient' || binder.coverType === 'rainbow') && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-black/10 backdrop-blur-[2px]">
                    <span className="text-white/30 font-black text-[20rem] leading-none uppercase tracking-tighter italic">{binder.name[0]}</span>
                    <h2 className="text-white/80 font-black text-4xl uppercase tracking-[0.3em] mt-[-2rem]">{binder.name}</h2>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/40 to-transparent" />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Unified Action Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl bg-card/95 backdrop-blur-2xl border-border/50 rounded-[3rem] shadow-2xl p-0 overflow-hidden">
          <Tabs defaultValue="search" className="w-full">
            <div className="p-8 pb-0 flex items-center justify-between border-b border-border/50">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">Add to {binder.name}</DialogTitle>
              </DialogHeader>
              <TabsList className="bg-secondary/50 p-1 rounded-2xl border border-border/50 mb-6">
                <TabsTrigger value="search" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Single Card</TabsTrigger>
                <TabsTrigger value="set" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Fill by Set</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="search" className="p-0 m-0">
              <div className="p-8 border-b border-border/50 bg-secondary/10">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Search Pokémon name..." 
                      className="pl-12 h-16 bg-card border-2 border-border/50 focus-visible:border-primary/50 rounded-2xl font-bold text-xl transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={isSearching} className="h-16 rounded-2xl px-10 font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    {isSearching ? <Loader2 className="h-6 w-6 animate-spin" /> : "Search Database"}
                  </Button>
                </div>
              </div>
              
              <div className="p-8 max-h-[55vh] overflow-y-auto custom-scrollbar bg-card/30">
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                    {searchResults.map((card) => (
                      <div 
                        key={card.id} 
                        onClick={() => handleAddCard(card)}
                        className="group cursor-pointer space-y-4"
                      >
                        <div className="aspect-[2.5/3.5] rounded-2xl overflow-hidden border-2 border-border/50 shadow-lg group-hover:shadow-primary/30 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-primary/50 group-hover:scale-105 transition-all duration-500 bg-secondary/10">
                          <img src={card.images.small} alt={card.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center px-1">
                          <p className="text-[11px] font-black uppercase tracking-tighter truncate group-hover:text-primary transition-colors leading-none mb-1">{card.name}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">{card.set.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 flex flex-col items-center justify-center text-muted-foreground opacity-20">
                    <Inbox className="h-20 w-20 mb-6" />
                    <p className="font-black uppercase tracking-[0.4em] text-sm">No results to display</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="set" className="p-0 m-0">
              {/* Fill by set logic... identical to before but prettier */}
              <div className="p-12 space-y-10">
                <div className="space-y-6">
                  <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2rem] space-y-3">
                    <p className="text-sm font-bold leading-relaxed text-foreground/80">
                      Populate your entire album with cards from a specific expansion. Cards will be placed in numerical order starting from slot 1.
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">WARNING: This will replace any cards already in the binder.</p>
                  </div>
                                   <div className="space-y-4">
                    <div className="relative">
                      <Input 
                        placeholder="Search set by name (e.g. Twilight Masquerade, Scarlet & Violet)..." 
                        className="h-16 bg-secondary/30 border-2 border-border/50 rounded-2xl font-bold text-xl px-8 transition-all focus:bg-card"
                        value={setQuery}
                        onChange={(e) => setSetQuery(e.target.value)}
                      />
                      {filteredSets.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
                          {filteredSets.map(s => (
                            <button
                              key={s.id}
                              className="w-full text-left px-8 py-4 hover:bg-primary hover:text-primary-foreground font-bold transition-colors border-b border-border/10 last:border-0 flex justify-between items-center"
                              onClick={() => {
                                setSetQuery(s.id)
                                setFilteredSets([])
                              }}
                            >
                              <span>{s.name}</span>
                              <span className="text-[10px] opacity-50 uppercase tracking-widest">{s.id}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full h-16 rounded-2xl px-12 font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                      onClick={handleFillBySet}
                      disabled={!setQuery || isSearching}
                    >
                      {isSearching ? <Loader2 className="h-6 w-6 animate-spin" /> : `Process Set: ${setQuery || '...'}`}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Quick Select Popular Sets</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: "sv6", name: "Twilight Masquerade" },
                      { id: "sv1", name: "Scarlet & Violet" },
                      { id: "swsh12", name: "Silver Tempest" },
                      { id: "meee", name: "151 (Japanese)" },
                      { id: "sv3pt5", name: "151 (English)" }
                    ].map(s => (
                      <Badge 
                        key={s.id} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground uppercase px-5 py-3 rounded-2xl font-black text-[11px] tracking-widest transition-all hover:scale-110 border-2 border-border/50"
                        onClick={() => setSetQuery(s.id)}
                      >
                        {s.name} <span className="ml-2 opacity-40 font-bold">{s.id}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Style Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-2xl border-border/50 rounded-[2.5rem] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">Binder Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Album Name</Label>
              <Input 
                placeholder="e.g. My Secret Rares" 
                className="h-12 bg-secondary/50 border-border/50 rounded-2xl font-bold"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Spine Style</Label>
              <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl border border-border/50">
                {["color", "gradient", "rainbow"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setEditSpineType(type as any)}
                    className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${editSpineType === type ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-primary/10"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {editSpineType === "color" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Pick Color</Label>
                <Input 
                  type="color" 
                  className="h-12 w-full p-1 bg-secondary/50 border-border/50 rounded-2xl cursor-pointer"
                  value={editSpineColor}
                  onChange={(e) => setEditSpineColor(e.target.value)}
                />
              </div>
            )}

            {editSpineType === "gradient" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Gradient Colors</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    className="h-12 flex-1 p-1 bg-secondary/50 border-border/50 rounded-2xl cursor-pointer"
                    value={editSpineColor}
                    onChange={(e) => setEditSpineColor(e.target.value)}
                  />
                  <Input 
                    type="color" 
                    className="h-12 flex-1 p-1 bg-secondary/50 border-border/50 rounded-2xl cursor-pointer"
                    value={editSpineColor2}
                    onChange={(e) => setEditSpineColor2(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cover Style</Label>
              <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl border border-border/50">
                {["color", "gradient", "image", "rainbow"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setEditCoverType(type as any)}
                    className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${editCoverType === type ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-primary/10"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {editCoverType === "color" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Pick Color</Label>
                <Input 
                  type="color" 
                  className="h-12 w-full p-1 bg-secondary/50 border-border/50 rounded-2xl cursor-pointer"
                  value={editCoverValue}
                  onChange={(e) => setEditCoverValue(e.target.value)}
                />
              </div>
            )}

            {editCoverType === "gradient" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Gradient Colors</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    className="h-12 flex-1 p-1 bg-secondary/50 border-border/50 rounded-2xl cursor-pointer"
                    value={editCoverValue}
                    onChange={(e) => setEditCoverValue(e.target.value)}
                  />
                  <Input 
                    type="color" 
                    className="h-12 flex-1 p-1 bg-secondary/50 border-border/50 rounded-2xl cursor-pointer"
                    value={editCoverValue2}
                    onChange={(e) => setEditCoverValue2(e.target.value)}
                  />
                </div>
              </div>
            )}

            {editCoverType === "image" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Image URL</Label>
                <Input 
                  placeholder="https://..." 
                  className="h-12 bg-secondary/50 border-border/50 rounded-2xl font-bold"
                  value={editCoverValue}
                  onChange={(e) => setEditCoverValue(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={handleUpdateStyle}
              disabled={!editName}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}

function BinderSlot({ card, index, isOwned, onAdd, onRemove, onToggleOwned, onDragStart, onDragOver, onDrop, isDragging }: any) {
  return (
    <div 
      className={`relative group z-10 w-full aspect-[2.5/3.5] cursor-grab active:cursor-grabbing transition-opacity duration-300 ${isDragging ? "opacity-20" : "opacity-100"}`}
      draggable={!!card}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {card ? (
        <div className={`w-full h-full rounded-2xl overflow-hidden shadow-xl transition-all duration-700 group-hover:scale-105 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-border/20 relative bg-secondary/10 ${isOwned ? "" : "grayscale-[0.9] opacity-70"}`}>
          <img src={card.image} alt={card.name} className="w-full h-full object-cover transition-all duration-700" />
          
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-3 p-4 text-center backdrop-blur-[2px]">
            <p className="text-white font-black text-sm uppercase tracking-tighter leading-tight drop-shadow-lg">{card.name}</p>
            <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest bg-white/10 text-white border-white/20">{card.set}</Badge>
            
            <div className="flex gap-2 mt-4">
              <Button size="icon" variant="destructive" onClick={onRemove} className="h-10 w-10 rounded-xl shadow-lg hover:scale-110 transition-transform">
                <Trash2 className="h-5 w-5" />
              </Button>
              <Button size="icon" variant={isOwned ? "default" : "secondary"} onClick={onToggleOwned} className="h-10 w-10 rounded-xl shadow-lg hover:scale-110 transition-transform">
                <Eye className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-white/40 text-[9px] font-black uppercase mt-2 tracking-widest">{isOwned ? "Owned" : "Missing"}</p>
          </div>
          
          {/* Subtle "missing" indicator if not owned and not hovered */}
          {!isOwned && (
             <div className="absolute inset-0 bg-black/10 pointer-events-none group-hover:hidden" />
          )}
        </div>
      ) : (
        <button 
          onClick={onAdd}
          className="w-full h-full rounded-2xl border-4 border-dashed border-border/10 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="h-10 w-10 transition-all duration-500 group-hover:scale-125 group-hover:rotate-90 opacity-20 group-hover:opacity-100" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-10 group-hover:opacity-100 transition-all">Empty</span>
        </button>
      )}
    </div>
  )
}
