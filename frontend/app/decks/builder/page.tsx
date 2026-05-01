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
  ArrowLeft, ArrowUpDown, FileUp, X
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
  images: { small: string; large: string }
  set: { id: string; name: string; series: string; releaseDate: string }
  number: string
  text?: string[]
}

interface DeckItem {
  card: TCGCard
  count: number
}

const ENERGY_MAP: Record<string, string> = {
  '{G}': 'Grass', '{R}': 'Fire', '{W}': 'Water', '{L}': 'Lightning',
  '{P}': 'Psychic', '{F}': 'Fighting', '{D}': 'Darkness', '{M}': 'Metal',
  '{Y}': 'Fairy', '{C}': 'Colorless'
}

const normalize = (name: string) => name.split('(')[0].replace(/['’]/g, '').trim().toLowerCase()

export default function DeckBuilderPage() {
  const [deckName, setDeckName] = useState("New Deck")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<TCGCard[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [deck, setDeck] = useState<DeckItem[]>([])
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null)
  const [reprints, setReprints] = useState<TCGCard[]>([])
  const [isLoadingReprints, setIsLoadingReprints] = useState(false)
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
  
  const [setAbbreviations, setSetAbbreviations] = useState<Record<string, string>>({})
  const setPriority = useMemo(() => Object.keys(setAbbreviations), [setAbbreviations])

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importText, setImportText] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  
  const router = useRouter()

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/sets')
        const contentType = response.headers.get("content-type")
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response")
        }
        const data = await response.json()
        if (Array.isArray(data)) {
          const mapping: Record<string, string> = {}
          data.forEach((s: any) => {
            mapping[s.name] = s.abbreviation
          })
          setSetAbbreviations(mapping)
        }
      } catch (error) {
        console.error("Error fetching sets:", error)
        showNotification("Error loading set abbreviations.", "error")
      }
    }
    fetchSets()
  }, [])

  const totalCards = useMemo(() => deck.reduce((acc, item) => acc + item.count, 0), [deck])
  const pokemonCount = useMemo(() => deck.filter(i => i.card.supertype === 'Pokémon').reduce((acc, i) => acc + i.count, 0), [deck])
  const trainerCount = useMemo(() => deck.filter(i => i.card.supertype === 'Trainer').reduce((acc, i) => acc + i.count, 0), [deck])
  const energyCount = useMemo(() => deck.filter(i => i.card.supertype === 'Energy').reduce((acc, i) => acc + i.count, 0), [deck])

  const getSetCode = (setName: string) => {
    if (setAbbreviations[setName]) return setAbbreviations[setName]
    if (setName.includes("McDonald's")) return "MCD"
    
    // Gallery rule
    if (setName.toLowerCase().includes("gallery")) {
      const parts = setName.split(/\s+/).filter(p => p.toLowerCase() !== 'gallery')
      const prefix = parts.map(p => p[0]).join('').toUpperCase()
      return prefix + "G"
    }

    const parts = setName.split(/\s+/).filter(p => p.toLowerCase() !== '&' && p.toLowerCase() !== '—')
    if (parts.length >= 2) return (parts[0][0] + parts[1].substring(0, 2)).toUpperCase()
    return setName.substring(0, 3).toUpperCase()
  }

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.length < 3) {
        setSearchResults([])
        return
      }
      setIsSearching(true)
      try {
        let finalQuery = searchQuery.trim()
        if (finalQuery.includes(' ') && !finalQuery.startsWith('"')) {
          finalQuery = `"${finalQuery}"`
        }
        const response = await fetch(`http://127.0.0.1:3000/api/cards/search/${encodeURIComponent(finalQuery)}`)
        const data = await response.json()
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => {
            const indexA = setPriority.indexOf(a.set?.name)
            const indexB = setPriority.indexOf(b.set?.name)
            if (indexA !== -1 && indexB !== -1) return indexA - indexB
            if (indexA !== -1) return -1
            if (indexB !== -1) return 1
            const dateA = a.set?.releaseDate ? a.set.releaseDate.replace(/\//g, '-') : '0000-00-00'
            const dateB = b.set?.releaseDate ? b.set.releaseDate.replace(/\//g, '-') : '0000-00-00'
            return dateB.localeCompare(dateA)
          })
          setSearchResults(sorted)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsSearching(false)
      }
    }, 500)
    return () => clearTimeout(delayDebounce)
  }, [searchQuery, setPriority])

  const handleImport = async () => {
    if (!importText.trim()) return
    setIsImporting(true)
    const lines = importText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    const newDeck: DeckItem[] = []
    const missingCards: string[] = []

    for (const line of lines) {
      const parts = line.split(/\s+/).filter(p => p.length > 0)
      if (parts.length >= 4) {
        const count = parseInt(parts[0])
        if (isNaN(count)) continue

        const number = parts[parts.length - 1]
        const setCode = parts[parts.length - 2]
        let fullName = parts.slice(1, parts.length - 2).join(" ")
        
        Object.entries(ENERGY_MAP).forEach(([symbol, name]) => {
          fullName = fullName.replace(symbol, name)
        })

        const isEnergy = fullName.toLowerCase().includes("energy")
        const isBasicEnergy = isEnergy && fullName.toLowerCase().includes("basic")
        let searchTerm = `\"${fullName}\"`
        
        if (isBasicEnergy) {
          const type = fullName.toLowerCase().replace(/basic/g, '').replace(/energy/g, '').trim()
          searchTerm = `\"basic ${type} energy\"`
        }

        try {
          const apiUrl = `http://127.0.0.1:3000/api/cards/search/${encodeURIComponent(searchTerm)}`
          await new Promise(r => setTimeout(r, 50))
          const response = await fetch(apiUrl)
          if (!response.ok) {
            missingCards.push(fullName)
            continue
          }
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0) {
            let found = null
            const targetName = normalize(fullName)
            found = data.find(c => {
              const cSetCode = getSetCode(c.set.name)
              const cNumber = c.id.includes('-') ? c.id.split('-')[1] : c.number
              return normalize(c.name) === targetName && 
                     cSetCode.toLowerCase() === setCode.toLowerCase() && 
                     cNumber === number
            })

            if (!found) {
              if (isBasicEnergy) {
                found = data.find(c => c.set.name === 'Scarlet & Violet Energies') || data[0]
              } else if (isEnergy && !fullName.toLowerCase().includes("switch") && !fullName.toLowerCase().includes("retrieval")) {
                found = data[0]
              }
            }
            if (found) {
              setSelectedCard(found)
              newDeck.push({ card: found, count })
            } else {
              missingCards.push(fullName)
            }
          } else {
            missingCards.push(fullName)
          }
        } catch (error) {
          console.error(`Import error:`, error)
          missingCards.push(fullName)
          continue
        }
      }
    }

    if (newDeck.length > 0) {
      setDeck(newDeck)
      if (missingCards.length > 0) {
        showNotification(`Imported partially. Missing: ${missingCards.join(", ")}`, "error")
      } else {
        showNotification(`Imported ${newDeck.reduce((acc, i) => acc + i.count, 0)} cards!`)
      }
      setIsImportModalOpen(false)
      setImportText("")
    } else {
      showNotification(`Failed to find cards: ${missingCards.join(", ")}`, "error")
    }
    setIsImporting(false)
  }

  const fetchReprints = async (card: TCGCard) => {
    setIsLoadingReprints(true)
    setReprints([])
    try {
      const cleanName = card.name.split('(')[0].trim()
      const searchTerm = `\"${cleanName}\"`
      const response = await fetch(`http://127.0.0.1:3000/api/cards/search/${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      if (Array.isArray(data)) {
        const cardBaseName = normalize(card.name)
        const versions = data.filter(c => {
          if (c.id === card.id) return false
          const otherBaseName = normalize(c.name)
          if (card.supertype === 'Pokémon') {
            const getTexts = (cd: TCGCard) => {
              const attacks = cd.attacks?.map(a => a.text).join('|') || ''
              const abilities = cd.abilities?.map(a => a.text).join('|') || ''
              return (attacks + abilities).toLowerCase().replace(/\s/g, '')
            }
            return otherBaseName === cardBaseName && getTexts(c) === getTexts(card)
          } else if (card.supertype === 'Trainer') {
            return otherBaseName === cardBaseName
          }
          return false
        })
        setReprints(versions)
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

  const sortDeck = () => {
    const getTrainerPriority = (subtypes: string[]) => {
      if (subtypes.includes('Supporter')) return 1
      if (subtypes.includes('Item')) return 2
      if (subtypes.includes('Tool')) return 3
      if (subtypes.includes('Stadium')) return 4
      return 5
    }
    const getSupertypePriority = (supertype: string) => {
      if (supertype === 'Pokémon') return 1
      if (supertype === 'Trainer') return 2
      if (supertype === 'Energy') return 3
      return 4
    }
    const sortedDeck = [...deck].sort((a, b) => {
      const pA = getSupertypePriority(a.card.supertype)
      const pB = getSupertypePriority(b.card.supertype)
      if (pA !== pB) return pA - pB
      if (a.card.supertype === 'Trainer' && b.card.supertype === 'Trainer') {
        const subPA = getTrainerPriority(a.card.subtypes)
        const subPB = getTrainerPriority(b.card.subtypes)
        if (subPA !== subPB) return subPA - subPB
      }
      return a.card.name.localeCompare(b.card.name)
    })
    setDeck(sortedDeck)
    showNotification("Deck organized!")
  }

  const handleShare = () => {
    const formatLine = (item: DeckItem) => {
      let name = item.card.name
      if (item.card.supertype === 'Energy') {
        name = name.replace(/Basic\s+/i, '')
      }
      const setCode = getSetCode(item.card.set.name)
      const cardNumber = item.card.id.includes('-') ? item.card.id.split('-')[1] : item.card.number
      return `${item.count} ${name} ${setCode} ${cardNumber}`
    }
    const format = `Pokémon: ${pokemonCount}\n${deck.filter(i => i.card.supertype === 'Pokémon').map(formatLine).join('\n')}\n\nTrainer: ${trainerCount}\n${deck.filter(i => i.card.supertype === 'Trainer').map(formatLine).join('\n')}\n\nEnergy: ${energyCount}\n${deck.filter(i => i.card.supertype === 'Energy').map(formatLine).join('\n')}`
    navigator.clipboard.writeText(format); showNotification("Copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-background relative">
      <Header />
      
      {notification && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          <span className="text-base font-bold">{notification.message}</span>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b p-6">
              <div>
                <CardTitle className="text-2xl font-serif">Import Deck</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Paste your deck list below (TCG Live format)</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsImportModalOpen(false)} disabled={isImporting}><X className="h-6 w-6" /></Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <textarea 
                className={`w-full h-64 bg-secondary/20 rounded-xl p-4 font-mono text-sm border-2 border-border focus:border-primary focus:ring-0 outline-none transition-all resize-none ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="4 Dreepy TWM 128&#10;4 Drakloak TWM 129&#10;..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                disabled={isImporting}
              />
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setIsImportModalOpen(false)} disabled={isImporting}>Cancel</Button>
                <Button onClick={handleImport} disabled={isImporting || !importText.trim()} className="px-8 font-bold min-w-[120px]">
                  {isImporting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {isImporting ? "Importing..." : "Import Cards"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isImporting && (
        <div className="fixed inset-0 z-[110] flex items-center justify-end bg-background/20 backdrop-blur-sm p-8 pointer-events-none">
          <Card className="w-96 shadow-2xl animate-in slide-in-from-right-8 duration-500 border-primary/20 pointer-events-auto">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando mazo...
                </div>
                <p className="text-muted-foreground text-sm font-medium">Sincronizando con la base de datos oficial</p>
              </div>
              
              {selectedCard && (
                <div className="relative">
                  <img 
                    src={selectedCard.images.small} 
                    alt="" 
                    className="w-56 h-auto rounded-xl shadow-2xl border-4 border-background animate-in zoom-in-90 duration-300" 
                  />
                  <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full -z-10 animate-pulse" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <main className="pt-24 flex h-[calc(100vh-64px)] overflow-hidden">
        <div className="w-[420px] border-r border-border bg-card/20 p-8 overflow-y-auto">
          {selectedCard ? (
            <div className="space-y-8">
              <div className="rounded-2xl overflow-hidden shadow-xl border bg-background"><img src={selectedCard.images.large} className="w-full h-auto" /></div>
              <div className="space-y-6">
                <div className="flex gap-3">
                  <Button onClick={() => addToDeck(selectedCard)} className="flex-1 h-14 gap-3 font-bold text-xl shadow-lg shadow-primary/20"><Plus className="h-6 w-6" /> Add</Button>
                  <Button variant="outline" onClick={() => fetchReprints(selectedCard)} className="flex-1 h-14 gap-3 font-bold text-lg border-2" disabled={isLoadingReprints}>
                    {isLoadingReprints ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Layers className="h-6 w-6 text-primary" />}
                    Other versions
                  </Button>
                </div>

                {reprints.length > 0 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Functional Reprints</h4>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{reprints.length} found</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {reprints.map(r => (
                        <div key={r.id} className="relative group">
                          <img 
                            src={r.images.small} 
                            onClick={() => setSelectedCard(r)} 
                            className="cursor-pointer rounded-lg border-2 border-transparent hover:border-primary transition-all hover:scale-105 shadow-sm" 
                            title={`${r.set.name} - ${r.number}`} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h2 className="font-serif text-3xl font-bold">{selectedCard.name}</h2>
                  <p className="text-base text-muted-foreground">{selectedCard.set.name} • {selectedCard.number}</p>
                </div>
                <div className="text-sm bg-muted/60 p-6 rounded-2xl border border-border/60 space-y-4 shadow-inner">
                  {selectedCard.abilities?.map(a => (<div key={a.name}><span className="font-bold text-primary uppercase text-xs">{a.type}: {a.name}</span><p className="italic mt-2">{a.text}</p></div>))}
                  {selectedCard.attacks?.map(a => (<div key={a.name} className="border-t border-border/40 pt-4 first:border-0 first:pt-0"><div className="flex justify-between items-center mb-1"><span className="font-bold text-foreground text-base">{a.name}</span><span className="font-bold text-base">{a.damage}</span></div><p className="italic">{a.text}</p></div>))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40"><Info className="h-16 w-16 mb-4" /><p className="font-serif text-2xl">Select a card</p></div>
          )}
        </div>

        <div className="flex-1 flex flex-col bg-background" onDrop={(e) => { e.preventDefault(); const d = e.dataTransfer.getData("card"); if(d) addToDeck(JSON.parse(d)) }} onDragOver={(e) => e.preventDefault()}>
          <div className="p-8 border-b border-border flex items-center justify-between gap-6 bg-card/5">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" onClick={() => router.push("/gameplay")} className="h-12 w-12"><ArrowLeft className="h-6 w-6" /></Button>
              <div>
                <Input value={deckName} onChange={(e) => setDeckName(e.target.value)} className="font-serif text-4xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0" />
                <div className="flex gap-6 mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <span className={totalCards > 60 ? 'text-destructive font-black' : ''}>{totalCards} / 60 Cards</span>
                  <span>{pokemonCount} P • {trainerCount} T • {energyCount} E</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" onClick={sortDeck} title="Sort Deck" className="h-14 w-14"><ArrowUpDown className="h-6 w-6" /></Button>
              <Button variant="outline" size="icon" onClick={() => setIsImportModalOpen(true)} title="Import Deck" className="h-14 w-14"><FileUp className="h-6 w-6" /></Button>
              <Button onClick={() => showNotification("Deck saved!")} className="h-14 px-8 font-bold text-lg shadow-lg">Save</Button>
              <Button variant="outline" onClick={handleShare} className="h-14 px-8 font-bold text-lg">Share</Button>
            </div>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
              {deck.map(item => (
                <div key={item.card.id} className="relative group">
                  <img src={item.card.images.small} className="w-full h-auto cursor-pointer rounded-lg shadow-md transition-all group-hover:scale-105" onClick={() => setSelectedCard(item.card)} />
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 border-background shadow-lg z-20">{item.count}</div>
                  <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 px-1">
                    <Button size="icon" className="h-10 w-10 rounded-full shadow-2xl bg-emerald-500 hover:bg-emerald-600 border-2 border-background" onClick={(e) => { e.stopPropagation(); addToDeck(item.card); }}><Plus className="h-6 w-6 text-white" /></Button>
                    <Button size="icon" variant="destructive" className="h-10 w-10 rounded-full shadow-2xl border-2 border-background" onClick={(e) => { e.stopPropagation(); removeFromDeck(item.card.id); }}><Minus className="h-6 w-6 text-white" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
                  <div key={card.id} className="relative group cursor-grab active:cursor-grabbing" draggable onDragStart={(e) => e.dataTransfer.setData("card", JSON.stringify(card))} onClick={() => setSelectedCard(card)}>
                    <img src={card.images.small} className="w-full h-auto rounded-xl shadow-md hover:ring-4 ring-primary/30 transition-all" />
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
