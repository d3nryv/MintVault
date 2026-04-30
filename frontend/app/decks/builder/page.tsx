"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Search, Save, Share2, Trash2, Plus, Minus, 
  Info, Loader2, Layers, CheckCircle2, AlertCircle,
  ArrowLeft
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface TCGCard {
  id: string
  name: string
  supertype: string
  subtypes: string[]
  types?: string[]
  attacks?: Array<{ name: string; text: string; damage: string; cost: string[] }>
  abilities?: Array<{ name: string; text: string; type: string }>
  images: {
    small: string
    large: string
  }
  set: {
    id: string
    name: string
    series: string
  }
  number: string
  text?: string[]
}

interface DeckItem {
  card: TCGCard
  count: number
}

export default function DeckBuilderPage() {
  const [deckName, setDeckName] = useState("New Deck")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<TCGCard[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [deck, setDeck] = useState<DeckItem[]>([])
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null)
  const [reprints, setReprints] = useState<TCGCard[]>([])
  const [isLoadingReprints, setIsLoadingReprints] = useState(false)
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const router = useRouter()

  const totalCards = useMemo(() => deck.reduce((acc, item) => acc + item.count, 0), [deck])
  const pokemonCount = useMemo(() => deck.filter(i => i.card.supertype === 'Pokémon').reduce((acc, i) => acc + i.count, 0), [deck])
  const trainerCount = useMemo(() => deck.filter(i => i.card.supertype === 'Trainer').reduce((acc, i) => acc + i.count, 0), [deck])
  const energyCount = useMemo(() => deck.filter(i => i.card.supertype === 'Energy').reduce((acc, i) => acc + i.count, 0), [deck])

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const getCardTextContent = (card: TCGCard) => {
    let content = ""
    if (card.text) content += card.text.join(" ")
    if (card.attacks) content += card.attacks.map(a => `${a.name} ${a.text}`).join(" ")
    if (card.abilities) content += card.abilities.map(a => `${a.name} ${a.text}`).join(" ")
    return content.trim()
  }

  // Search logic
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.length < 3) {
        setSearchResults([])
        return
      }
      setIsSearching(true)
      try {
        const response = await fetch(`http://127.0.0.1:3000/api/cards/search/${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        setSearchResults(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsSearching(false)
      }
    }, 500)
    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  // Reprints logic
  const fetchReprints = async (card: TCGCard) => {
    setIsLoadingReprints(true)
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/cards/search/${encodeURIComponent(card.name)}`)
      const data = await response.json()
      if (Array.isArray(data)) {
        const sourceContent = getCardTextContent(card)
        const matches = data.filter(c => {
          if (c.id === card.id) return false
          if (c.name !== card.name) return false
          const targetContent = getCardTextContent(c)
          return sourceContent === targetContent
        })
        setReprints(matches)
        if (matches.length === 0) showNotification("No identical reprints found.", "error")
      }
    } catch (error) {
      console.error("Reprints error:", error)
    } finally {
      setIsLoadingReprints(false)
    }
  }

  const addToDeck = (card: TCGCard) => {
    if (totalCards >= 60) {
      showNotification("Deck is full (max 60 cards)", "error")
      return
    }
    const totalCopiesWithName = deck.filter(item => item.card.name === card.name).reduce((acc, item) => acc + item.count, 0)
    if (totalCopiesWithName >= 4 && card.supertype !== 'Energy') {
      showNotification(`Maximum 4 copies of ${card.name} allowed`, "error")
      return
    }
    setDeck(prev => {
      const existing = prev.find(item => item.card.id === card.id)
      if (existing) return prev.map(item => item.card.id === card.id ? { ...item, count: item.count + 1 } : item)
      return [...prev, { card, count: 1 }]
    })
  }

  const removeFromDeck = (cardId: string) => {
    setDeck(prev => prev.map(item => item.card.id === cardId ? { ...item, count: item.count - 1 } : item).filter(item => item.count > 0))
  }

  const handleDragStart = (e: React.DragEvent, card: TCGCard) => { e.dataTransfer.setData("card", JSON.stringify(card)) }
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const cardData = e.dataTransfer.getData("card"); if (cardData) addToDeck(JSON.parse(cardData)) }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault() }

  const generateSetCode = (setName: string) => {
    const parts = setName.split(/\s+/).filter(p => p.toLowerCase() !== '&')
    if (parts.length >= 2) return (parts[0][0] + parts[1].substring(0, 2)).toUpperCase()
    return setName.substring(0, 3).toUpperCase()
  }

  const handleShare = () => {
    const formatLine = (item: DeckItem) => `${item.count} ${item.card.name} ${generateSetCode(item.card.set.name)} ${item.card.id.includes('-') ? item.card.id.split('-')[1] : item.card.number}`
    const format = `Pokémon: ${pokemonCount}\n${deck.filter(i => i.card.supertype === 'Pokémon').map(formatLine).join('\n')}\n\nTrainer: ${trainerCount}\n${deck.filter(i => i.card.supertype === 'Trainer').map(formatLine).join('\n')}\n\nEnergy: ${energyCount}\n${deck.filter(i => i.card.supertype === 'Energy').map(formatLine).join('\n')}`
    navigator.clipboard.writeText(format); showNotification("Copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {notification && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          <span className="text-base font-bold">{notification.message}</span>
        </div>
      )}

      <main className="pt-24 flex h-[calc(100vh-64px)] overflow-hidden">
        
        {/* LEFT: Card Detail (Enlarged text) */}
        <div className="w-[420px] border-r border-border bg-card/20 p-8 overflow-y-auto">
          {selectedCard ? (
            <div className="space-y-8">
              <div className="rounded-2xl overflow-hidden shadow-xl border bg-background">
                <img src={selectedCard.images.large} alt={selectedCard.name} className="w-full h-auto" />
              </div>
              
              <div className="space-y-6">
                <Button onClick={() => addToDeck(selectedCard)} className="w-full h-14 gap-3 font-bold text-xl shadow-lg">
                  <Plus className="h-6 w-6" /> Add to Deck
                </Button>

                <div className="space-y-2">
                  <h2 className="font-serif text-3xl font-bold tracking-tight">{selectedCard.name}</h2>
                  <p className="text-base text-muted-foreground font-medium">{selectedCard.set.name} • {selectedCard.number}</p>
                </div>

                <div className="text-sm text-muted-foreground bg-muted/60 p-6 rounded-2xl border border-border/60 space-y-4 shadow-inner">
                  {selectedCard.abilities?.map(a => (
                    <div key={a.name}>
                      <span className="font-bold text-primary uppercase text-xs tracking-wider">{a.type}: {a.name}</span>
                      <p className="italic mt-2 text-sm leading-relaxed">{a.text}</p>
                    </div>
                  ))}
                  {selectedCard.attacks?.map(a => (
                    <div key={a.name} className="border-t border-border/40 pt-4 first:border-0 first:pt-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-foreground text-base">{a.name}</span>
                        <span className="font-bold text-base">{a.damage}</span>
                      </div>
                      <p className="italic text-sm leading-relaxed">{a.text}</p>
                    </div>
                  ))}
                  {selectedCard.text && selectedCard.text.map((t, i) => (
                    <p key={i} className="italic text-sm leading-relaxed pt-4 border-t border-border/40 first:border-0 first:pt-0">{t}</p>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full h-12 gap-2 font-bold" onClick={() => fetchReprints(selectedCard)}>
                  <Layers className="h-5 w-5" /> Show Reprints
                </Button>

                <div className="grid grid-cols-4 gap-3">
                  {reprints.map(r => (
                    <img key={r.id} src={r.images.small} alt="" className="rounded-xl cursor-pointer hover:ring-4 ring-primary/40 transition-all shadow-md" onClick={() => setSelectedCard(r)} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40">
              <Info className="h-16 w-16 mb-4" />
              <p className="font-serif text-2xl">Select a card</p>
            </div>
          )}
        </div>

        {/* CENTER: Deck Editor (Larger header) */}
        <div className="flex-1 flex flex-col bg-background" onDrop={handleDrop} onDragOver={handleDragOver}>
          <div className="p-8 border-b border-border flex items-center justify-between gap-6 bg-card/5">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" onClick={() => router.push("/gameplay")} className="h-12 w-12 hover:bg-secondary">
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div>
                <Input value={deckName} onChange={(e) => setDeckName(e.target.value)} className="font-serif text-4xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0" />
                <div className="flex gap-6 mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <span className={totalCards > 60 ? 'text-destructive font-black' : ''}>{totalCards} / 60 Cards</span>
                  <span>{pokemonCount} P • {trainerCount} T • {energyCount} E</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => showNotification("Deck saved!")} className="h-14 px-8 font-bold text-lg shadow-lg">Save</Button>
              <Button variant="outline" onClick={handleShare} className="h-14 px-8 font-bold text-lg">Share</Button>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
              {deck.map(item => (
                <div key={item.card.id} className="relative group">
                  <img src={item.card.images.small} alt="" className="w-full h-auto cursor-pointer rounded-lg shadow-md transition-all group-hover:scale-105" onClick={() => setSelectedCard(item.card)} />
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 border-background shadow-lg z-20">
                    {item.count}
                  </div>
                  {/* Buttons at the bottom, no blur */}
                  <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 px-1">
                    <Button size="icon" className="h-10 w-10 rounded-full shadow-2xl bg-emerald-500 hover:bg-emerald-600 border-2 border-background" onClick={(e) => { e.stopPropagation(); addToDeck(item.card); }}><Plus className="h-6 w-6 text-white" /></Button>
                    <Button size="icon" variant="destructive" className="h-10 w-10 rounded-full shadow-2xl border-2 border-background" onClick={(e) => { e.stopPropagation(); removeFromDeck(item.card.id); }}><Minus className="h-6 w-6 text-white" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Search Panel */}
        <div className="w-[420px] border-l border-border bg-card/20 flex flex-col">
          <div className="p-8 border-b border-border">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search database..." className="pl-12 h-12 rounded-xl bg-background text-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {isSearching ? <div className="flex justify-center py-12"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div> : (
              <div className="grid grid-cols-2 gap-4">
                {searchResults.map(card => (
                  <div key={card.id} className="relative group cursor-grab active:cursor-grabbing" draggable onDragStart={(e) => handleDragStart(e, card)} onClick={() => setSelectedCard(card)}>
                    <img src={card.images.small} alt="" className="w-full h-auto rounded-xl shadow-md hover:ring-4 ring-primary/30 transition-all" />
                    <Button size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" onClick={(e) => { e.stopPropagation(); addToDeck(card); }}><Plus className="h-5 w-5" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
