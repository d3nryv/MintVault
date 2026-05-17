"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Swords, FolderOpen, Plus, Edit, Trash2, Download, Calendar, MapPin, Users, Loader2, ChevronLeft, ChevronRight, ArrowLeft, BarChart3, Swords as SwordsIcon, Layers, Monitor } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

const BASE_URL = "https://play.limitlesstcg.com/api"

// We'll use a dynamic state for meta decks now.
export interface MetaDeck {
  id: string;
  name: string;
  tier: string;
  winRate: string;
  popularity: string;
  imageUrl?: string;
  archetypeUrl?: string;
  decklistUrl?: string;
  exportList?: string;
  cards?: {
    pokemon: string[];
    trainer: string[];
    energy: string[];
  };
}

// --- Your Decks (Static) ---
// const yourDecks = [
//   { name: "My Charizard Deck", format: "Standard", cards: 60, lastEdited: "2 days ago" },
//   { name: "Budget Gardevoir", format: "Standard", cards: 60, lastEdited: "1 week ago" },
//   { name: "Fun Mew VMAX", format: "Expanded", cards: 60, lastEdited: "2 weeks ago" },
// ]

export default function GameplayPage() {
  const [activeTab, setActiveTab] = useState("meta")
  const { user } = useAuth()
  const router = useRouter()

  const [metaDecks, setMetaDecks] = useState<MetaDeck[]>([])
  const [selectedDeck, setSelectedDeck] = useState<MetaDeck | null>(null)
  const [isScraping, setIsScraping] = useState(false)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)
  const [scrapeProgress, setScrapeProgress] = useState("")

  const [tournaments, setTournaments] = useState<any[]>([])
  const [selectedTournament, setSelectedTournament] = useState<any | null>(null)
  const [standings, setStandings] = useState<any[]>([])
  const [pairings, setPairings] = useState<any[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [userDecks, setUserDecks] = useState<any[]>([])
  const [isLoadingDecks, setIsLoadingDecks] = useState(false)
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3500)
  }

  const fetchHtml = async (url: string) => {
    try {
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      if (!res.ok) {
        console.warn(`Proxy failed (Status: ${res.status})`);
        return null;
      }

      const htmlText = await res.text();
      const parser = new DOMParser();
      return parser.parseFromString(htmlText, "text/html");
    } catch (e) {
      console.warn(`Network error with proxy:`, e);
      return null;
    }
  }

  // --- Limitless Scraper Logic ---
  const scrapeLimitless = async () => {
    setIsScraping(true)
    setScrapeProgress("Fetching top decks...")
    try {
      const docDecks = await fetchHtml("https://limitlesstcg.com/decks")
      if (!docDecks) {
        console.error('Failed to fetch deck list')
        setScrapeProgress('Error fetching decks')
        setIsScraping(false)
        return
      }

      const rows = Array.from(docDecks.querySelectorAll("table.data-table.striped tbody tr")).slice(0, 25)
      const scrapedDecks: MetaDeck[] = []

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const imgNode = row.querySelector("td:nth-child(2) img")
        const nameNode = row.querySelector("td:nth-child(3) a")
        const shareNode = row.querySelector("td:nth-child(5)")
        const pointsNode = row.querySelector("td:nth-child(4)")

        if (!nameNode) continue

        const name = nameNode.textContent?.trim() || "Unknown"
        const archetypeUrl = nameNode.getAttribute("href") || ""
        const popularity = shareNode?.textContent?.trim() || ""
        const winRate = pointsNode?.textContent?.trim() + " pts" || ""
        const imageUrl = imgNode?.getAttribute("src") || ""

        scrapedDecks.push({
          id: `deck-${i}`,
          name,
          tier: "", // Tier removed
          winRate,
          popularity,
          imageUrl,
          archetypeUrl: archetypeUrl ? `https://limitlesstcg.com${archetypeUrl}` : undefined
        })
      }

      setMetaDecks(scrapedDecks)
      setScrapeProgress("")
    } catch (error) {
      console.error("Scraping error:", error)
      setScrapeProgress("Error fetching meta decks")
      setTimeout(() => setScrapeProgress(""), 3000)
    } finally {
      setIsScraping(false)
    }
  }

  const fetchDeckDetails = async (deck: MetaDeck) => {
    if (!deck.archetypeUrl) return

    setIsFetchingDetails(true)
    setSelectedDeck(deck)

    try {
      // 1. Go to Archetype page to find latest list
      const docArchetype = await fetchHtml(deck.archetypeUrl)
      if (!docArchetype) throw new Error("Could not load archetype page")

      const listLink = docArchetype.querySelector('a[href^="/decks/list/"]')
      const listPath = listLink?.getAttribute("href")

      if (!listPath) throw new Error("No deck list found for this archetype")

      const decklistUrl = `https://limitlesstcg.com${listPath}`

      // 2. Go to List page and extract cards
      const docList = await fetchHtml(decklistUrl)
      if (!docList) throw new Error("Could not load deck list page")

      const columns = Array.from(docList.querySelectorAll('.decklist-column'))

      const pokemon: string[] = []
      const trainer: string[] = []
      const energy: string[] = []

      columns.forEach(column => {
        const header = column.querySelector('.decklist-column-heading')?.textContent?.toLowerCase() || ""
        const cards = Array.from(column.querySelectorAll('.decklist-card'))

        let targetArray: string[] = []
        if (header.includes("pokemon") || header.includes("pokémon")) targetArray = pokemon
        else if (header.includes("trainer")) targetArray = trainer
        else if (header.includes("energy")) targetArray = energy
        else return // Skip unknown sections

        cards.forEach(card => {
          const count = card.querySelector('.card-count')?.textContent?.trim() || ""
          const cardName = card.querySelector('.card-name')?.textContent?.trim() || ""
          const set = card.getAttribute('data-set') || ""
          const number = card.getAttribute('data-number') || ""
          // Check for basic energy in multiple ways
          const isBasicEnergy = card.hasAttribute('data-basic-energy') || card.getAttribute('data-basic-energy') !== null

          let line = ""
          if (isBasicEnergy) {
            line = set && number ? `${count} ${cardName} ${set} ${number}` : `${count} ${cardName}`
          } else {
            line = `${count} ${cardName} ${set} ${number}`
          }
          targetArray.push(line)
        })
      })

      const pokemonTotal = pokemon.reduce((acc, l) => acc + parseInt(l.split(' ')[0] || "0"), 0)
      const trainerTotal = trainer.reduce((acc, l) => acc + parseInt(l.split(' ')[0] || "0"), 0)
      const energyTotal = energy.reduce((acc, l) => acc + parseInt(l.split(' ')[0] || "0"), 0)

      const exportList = [
        `Pokémon: ${pokemonTotal}`,
        ...pokemon,
        "",
        `Trainer: ${trainerTotal}`,
        ...trainer,
        "",
        `Energy: ${energyTotal}`,
        ...energy
      ].join('\n')

      setSelectedDeck(prev => prev ? {
        ...prev,
        decklistUrl,
        exportList,
        cards: { pokemon, trainer, energy }
      } : null)

    } catch (error) {
      console.error("Error fetching deck details:", error)
    } finally {
      setIsFetchingDetails(false)
    }
  }

  const getSetCode = (card: any) => {
    if (card.set.ptcgoCode) return card.set.ptcgoCode
    const setName = card.set.name
    if (setName.includes("McDonald's")) return "MCD"
    const parts = setName.split(/\s+/).filter((p: string) => p.toLowerCase() !== '&' && p.toLowerCase() !== '—')
    if (parts.length >= 2) return (parts[0][0] + parts[1].substring(0, 2)).toUpperCase()
    return setName.substring(0, 3).toUpperCase()
  }

  const handleImportToBuilder = (exportList: string) => {
    if (!exportList) return
    const encodedList = encodeURIComponent(exportList)
    router.push(`/decks/builder?import=${encodedList}`)
  }

  const fetchUserDecks = async () => {
    if (!user) return
    setIsLoadingDecks(true)
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/decks/owner/${user.id}`)
      const data = await response.json()
      if (Array.isArray(data)) {
        setUserDecks(data)
      }
    } catch (error) {
      console.error("Error fetching user decks:", error)
    } finally {
      setIsLoadingDecks(false)
    }
  }

  useEffect(() => {
    if (metaDecks.length === 0) {
      scrapeLimitless()
    }
  }, [])

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm("Are you sure you want to delete this deck?")) return

    try {
      const response = await fetch(`http://127.0.0.1:3000/api/decks/${deckId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh the deck list
        fetchUserDecks()
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Failed to delete deck: ${response.status} ${errorData.error || ""}`)
      }
    } catch (error) {
      console.error("Error deleting deck:", error)
    }
  }

  useEffect(() => {
    if (activeTab === "decks" && user) {
      fetchUserDecks()
    }
  }, [activeTab, user])


  const fetchTournaments = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/tournaments?game=PTCG&limit=10&page=${page}`)
      const data = await res.json()
      setTournaments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching tournaments:", err)
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchTournaments()
  }, [fetchTournaments])

  const handleViewDetails = async (id: string) => {
    setDetailsLoading(true)
    try {
      const detailsRes = await fetch(`${BASE_URL}/tournaments/${id}/details`)
      const details = await detailsRes.json()
      setSelectedTournament(details)

      const standingsRes = await fetch(`${BASE_URL}/tournaments/${id}/standings`)
      const standingsData = await standingsRes.json()
      setStandings(Array.isArray(standingsData) ? standingsData : [])

      const pairingsRes = await fetch(`${BASE_URL}/tournaments/${id}/pairings`)
      const pairingsData = await pairingsRes.json()
      setPairings(Array.isArray(pairingsData) ? pairingsData : [])

    } catch (err) {
      console.error("Error fetching details:", err)
    } finally {
      setDetailsLoading(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "S": return "bg-amber-500/20 text-amber-700 border-amber-500/30"
      case "A": return "bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
      case "B": return "bg-sky-500/20 text-sky-700 border-sky-500/30"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {notification && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <span className="text-base font-bold">{notification.message}</span>
        </div>
      )}

      <main className="pt-20">
        <div className="mx-auto max-w-[1700px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">
              Gameplay
            </h1>
            <p className="mt-2 text-muted-foreground font-medium italic">
              Explore meta decks, find tournaments, and master the circuit
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`mb-8 grid w-full max-w-md ${user ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="meta" className="gap-2 font-bold">
                <Trophy className="h-4 w-4" /> Meta Decks
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="gap-2 font-bold">
                <Swords className="h-4 w-4" /> Tournaments
              </TabsTrigger>
              {user && (
                <TabsTrigger value="decks" className="gap-2 font-bold">
                  <FolderOpen className="h-4 w-4" /> Your Decks
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="meta">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" /> Current Meta Decks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted-foreground">Top 10 decks pulled live from Limitless TCG</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={scrapeLimitless}
                      disabled={isScraping}
                    >
                      {isScraping ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Refresh Data
                    </Button>
                  </div>

                  {isScraping ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4 opacity-70">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="font-bold italic text-sm">{scrapeProgress}</p>
                    </div>
                  ) : selectedDeck ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDeck(null)} className="font-bold">
                          <ArrowLeft className="h-4 w-4 mr-2" /> Back to list
                        </Button>
                        <h3 className="text-2xl font-bold italic uppercase tracking-tight">Latest played deck of this archetype</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-1 space-y-6">
                          <div className="p-6 bg-secondary/10 rounded-3xl border border-border/50 flex flex-col items-center gap-4 text-center">
                            {selectedDeck.imageUrl && (
                              <img
                                src={selectedDeck.imageUrl}
                                alt=""
                                className="w-20 h-20 object-contain"
                              />
                            )}
                            <h2 className="text-2xl font-black italic uppercase text-primary leading-tight">{selectedDeck.name}</h2>
                            <div className="flex flex-wrap justify-center gap-2">
                              <Badge variant="outline" className="font-bold italic text-[10px]">{selectedDeck.winRate}</Badge>
                              <Badge variant="outline" className="font-bold italic text-[10px]">{selectedDeck.popularity} Usage</Badge>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3">
                            <Button
                              className="w-full h-14 text-lg font-black italic uppercase shadow-lg shadow-primary/20 gap-3"
                              onClick={() => handleImportToBuilder(selectedDeck.exportList || "")}
                              disabled={isFetchingDetails}
                            >
                              <Plus className="h-6 w-6" /> Import into deck creator
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full h-14 text-lg font-black italic uppercase gap-3 border-2"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedDeck.exportList || "")
                                showNotification("Decklist copied to clipboard!")
                              }}
                              disabled={isFetchingDetails}
                            >
                              <Download className="h-6 w-6" /> Export deck
                            </Button>
                            {selectedDeck.decklistUrl && (
                              <Button
                                variant="ghost"
                                className="w-full h-12 text-sm font-bold opacity-60 hover:opacity-100"
                                onClick={() => window.open(selectedDeck.decklistUrl, '_blank')}
                              >
                                View on Limitless TCG
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <Card className="border-border/60 bg-secondary/5 h-full min-h-[600px]">
                            <CardContent className="p-6">
                              {isFetchingDetails ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4 py-24">
                                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                  <p className="font-black italic uppercase tracking-widest text-muted-foreground animate-pulse">Syncing decklist...</p>
                                </div>
                              ) : selectedDeck.cards ? (
                                <div className="space-y-8 font-mono text-xs">
                                  {(() => {
                                    const pTotal = selectedDeck.cards?.pokemon.reduce((acc, l) => acc + parseInt(l.split(' ')[0] || "0"), 0) || 0;
                                    const tTotal = selectedDeck.cards?.trainer.reduce((acc, l) => acc + parseInt(l.split(' ')[0] || "0"), 0) || 0;
                                    const eTotal = selectedDeck.cards?.energy.reduce((acc, l) => acc + parseInt(l.split(' ')[0] || "0"), 0) || 0;

                                    return (
                                      <>
                                        <div>
                                          <h4 className="font-black text-primary uppercase tracking-tighter text-base mb-4 border-b border-primary/20 pb-1">Pokémon ({pTotal})</h4>
                                          <div className="grid grid-cols-1 gap-1">
                                            {selectedDeck.cards?.pokemon.map((line, idx) => (
                                              <div key={idx} className="flex gap-3 hover:bg-primary/5 px-2 py-1 rounded transition-colors group items-center">
                                                <span className="font-black text-primary min-w-[24px]">{line.split(' ')[0]}</span>
                                                <span className="font-medium text-foreground/80 group-hover:text-foreground">{line.split(' ').slice(1).join(' ')}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="font-black text-primary uppercase tracking-tighter text-base mb-4 border-b border-primary/20 pb-1">Trainer ({tTotal})</h4>
                                          <div className="grid grid-cols-1 gap-1">
                                            {selectedDeck.cards?.trainer.map((line, idx) => (
                                              <div key={idx} className="flex gap-3 hover:bg-primary/5 px-2 py-1 rounded transition-colors group items-center">
                                                <span className="font-black text-primary min-w-[24px]">{line.split(' ')[0]}</span>
                                                <span className="font-medium text-foreground/80 group-hover:text-foreground">{line.split(' ').slice(1).join(' ')}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="font-black text-primary uppercase tracking-tighter text-base mb-4 border-b border-primary/20 pb-1">Energy ({eTotal})</h4>
                                          <div className="grid grid-cols-1 gap-1">
                                            {selectedDeck.cards?.energy.map((line, idx) => (
                                              <div key={idx} className="flex gap-3 hover:bg-primary/5 px-2 py-1 rounded transition-colors group items-center">
                                                <span className="font-black text-primary min-w-[24px]">{line.split(' ')[0]}</span>
                                                <span className="font-medium text-foreground/80 group-hover:text-foreground">{line.split(' ').slice(1).join(' ')}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground italic font-medium">
                                  No cards loaded.
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {metaDecks.map((deck) => (
                        <div
                          key={deck.id}
                          className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-xl cursor-pointer p-4"
                          onClick={() => fetchDeckDetails(deck)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center p-2 shrink-0">
                              {deck.imageUrl && (
                                <img
                                  src={deck.imageUrl}
                                  alt=""
                                  className="w-full h-full object-contain transition-transform group-hover:scale-110 duration-500"
                                />
                              )}
                            </div>
                            <h4 className="flex-1 font-black italic uppercase text-base leading-tight group-hover:text-primary transition-colors truncate">
                              {deck.name}
                            </h4>
                          </div>
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-4 px-1">
                            <span>Points: <span className="text-foreground">{deck.winRate}</span></span>
                            <span>Share: <span className="text-foreground">{deck.popularity}</span></span>
                          </div>
                        </div>
                      ))}
                      {metaDecks.length === 0 && !isScraping && (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                          Failed to load meta decks.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tournaments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {selectedTournament ? (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTournament(null)} className="mr-2 font-bold">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                      </Button>
                    ) : (
                      <Swords className="h-5 w-5" />
                    )}
                    {selectedTournament ? selectedTournament.name : "Live Tournaments"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {detailsLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center opacity-50">
                      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                      <p className="font-bold italic">Synchronizing data...</p>
                    </div>
                  ) : selectedTournament ? (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-3 space-y-4">
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-primary border-primary/20 font-bold">{selectedTournament.format}</Badge>
                            {selectedTournament.isOnline && <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 font-bold">Online Event</Badge>}
                          </div>
                          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground font-bold italic">
                            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(selectedTournament.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {selectedTournament.players} Players</span>
                            <span className="flex items-center gap-2"><Monitor className="h-4 w-4" /> {selectedTournament.platform}</span>
                          </div>
                        </div>
                        <div className="p-4 bg-secondary/20 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center">
                          {selectedTournament.organizer.logo && <img src={selectedTournament.organizer.logo} alt="" className="h-12 w-12 object-contain mb-2" />}
                          <span className="text-[10px] font-bold uppercase text-primary tracking-widest mb-1">Organizer</span>
                          <span className="font-bold text-xs leading-tight">{selectedTournament.organizer.name}</span>
                        </div>
                      </div>

                      <Tabs defaultValue="standings" className="w-full">
                        <TabsList className="mb-6 bg-secondary/30 p-1">
                          <TabsTrigger value="standings" className="gap-2 font-bold"><BarChart3 className="h-4 w-4" /> Standings</TabsTrigger>
                          <TabsTrigger value="pairings" className="gap-2 font-bold"><SwordsIcon className="h-4 w-4" /> Pairings</TabsTrigger>
                          <TabsTrigger value="info" className="gap-2 font-bold"><Layers className="h-4 w-4" /> Phases</TabsTrigger>
                        </TabsList>

                        <TabsContent value="standings">
                          <div className="rounded-lg border border-border overflow-hidden">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-secondary/40 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                  <th className="px-6 py-4">#</th>
                                  <th className="px-6 py-4">Player</th>
                                  <th className="px-6 py-4 text-center">Record</th>
                                  <th className="px-6 py-4 text-right">Archetype</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {standings.map((s, i) => (
                                  <tr key={i} className="hover:bg-secondary/10 transition-colors">
                                    <td className="px-6 py-4 font-black">{s.placing}</td>
                                    <td className="px-6 py-4">
                                      <div className="font-black italic uppercase text-primary">{s.name}</div>
                                      <div className="text-[10px] text-muted-foreground font-bold">@{s.player}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      <Badge variant="secondary" className="font-mono font-bold">{s.record.wins}-{s.record.losses}-{s.record.ties}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      {s.deck ? (
                                        <span className="font-bold text-xs italic uppercase text-foreground/80">{s.deck.name}</span>
                                      ) : "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </TabsContent>

                        <TabsContent value="pairings">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pairings.slice(0, 50).map((p, i) => (
                              <div key={i} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between hover:border-primary/30 transition-all">
                                <span className="text-[10px] font-black text-muted-foreground">T-{p.table}</span>
                                <div className="flex-1 px-4 flex justify-between items-center gap-2 overflow-hidden">
                                  <span className={`font-bold truncate text-xs italic uppercase ${p.winner === p.player1 ? 'text-primary' : ''}`}>{p.player1}</span>
                                  <span className="text-[10px] opacity-20 font-black">VS</span>
                                  <span className={`font-bold truncate text-xs italic uppercase ${p.winner === p.player2 ? 'text-primary' : ''}`}>{p.player2 || 'BYE'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="info">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {selectedTournament.phases.map((phase: any, i: number) => (
                              <Card key={i} className="border-border/60 bg-secondary/10 shadow-none">
                                <CardHeader className="p-4">
                                  <CardTitle className="text-sm font-bold uppercase italic">Phase {phase.phase}</CardTitle>
                                  <CardDescription className="text-[10px] font-black text-primary">{phase.type}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 text-xs space-y-2 font-bold italic">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Rounds:</span>
                                    <span>{phase.rounds}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Mode:</span>
                                    <span className="uppercase">{phase.mode}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center opacity-50">
                          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                          <p className="font-bold italic">Fetching Live Events...</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3">
                            {tournaments.map((tournament, index) => (
                              <div key={index} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/40 cursor-pointer transition-all hover:bg-secondary/10" onClick={() => handleViewDetails(tournament.id)}>
                                <div className="space-y-1">
                                  <h4 className="font-bold text-lg leading-tight uppercase italic">{tournament.name}</h4>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold italic">
                                    <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(tournament.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {tournament.players}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="font-bold border-primary/20 text-primary">{tournament.format}</Badge>
                                  <Button size="sm" className="font-bold">Details</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center pt-6 border-t">
                            <Button variant="ghost" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1} className="font-bold"><ChevronLeft className="h-4 w-4 mr-2" /> Previous</Button>
                            <span className="text-xs font-bold text-muted-foreground">Page {page}</span>
                            <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)} className="font-bold">Next <ChevronRight className="h-4 w-4 ml-2" /></Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {user ? (
              <TabsContent value="decks">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5" /> Your Decks
                    </CardTitle>
                    <Button className="gap-2 font-bold" onClick={() => router.push("/decks/builder")}>
                      <Plus className="h-4 w-4" /> New Deck
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoadingDecks ? (
                        <div className="py-12 flex justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : userDecks.length > 0 ? (
                        userDecks.map((deck, index) => (
                          <div key={deck.id || index} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/20 transition-all">
                            <div className="space-y-1">
                              <h4 className="font-bold text-lg uppercase italic">{deck.name}</h4>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold italic">
                                <Badge variant="outline" className="font-bold text-[10px]">Standard</Badge>
                                <span>{deck.cards?.reduce((acc: number, i: any) => acc + i.count, 0) || 0} cards</span>
                                <span>Created: {new Date(deck.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => router.push(`/decks/builder?id=${deck.id}`)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => {
                                const ENERGY_SYMBOLS: Record<string, string> = {
                                  'Grass': '{G}', 'Fire': '{R}', 'Water': '{W}', 'Lightning': '{L}',
                                  'Psychic': '{P}', 'Fighting': '{F}', 'Darkness': '{D}', 'Metal': '{M}',
                                  'Dark': '{D}'
                                }

                                const formatLine = (item: any) => {
                                  let name = item.card.name
                                  let setCode = getSetCode(item.card)
                                  let cardNumber = item.card.id.includes('-') ? item.card.id.split('-')[1] : item.card.number

                                  if (item.card.supertype === 'Energy' && item.card.subtypes.includes('Basic')) {
                                    const type = name.replace(/Basic\s+|Energy\s+/gi, '').trim()
                                    const symbol = ENERGY_SYMBOLS[type] || type
                                    name = `Basic ${symbol} Energy`
                                    setCode = 'SVE'
                                  }

                                  return `${item.count} ${name} ${setCode} ${cardNumber}`
                                }
                                const p = deck.cards.filter((i: any) => i.card.supertype === 'Pokémon')
                                const t = deck.cards.filter((i: any) => i.card.supertype === 'Trainer')
                                const e = deck.cards.filter((i: any) => i.card.supertype === 'Energy')

                                const pCount = p.reduce((acc: number, i: any) => acc + i.count, 0)
                                const tCount = t.reduce((acc: number, i: any) => acc + i.count, 0)
                                const eCount = e.reduce((acc: number, i: any) => acc + i.count, 0)

                                const exportText = `Pokémon: ${pCount}\n${p.map(formatLine).join('\n')}\n\nTrainer: ${tCount}\n${t.map(formatLine).join('\n')}\n\nEnergy: ${eCount}\n${e.map(formatLine).join('\n')}`
                                navigator.clipboard.writeText(exportText)
                                showNotification("Decklist copied to clipboard!")
                              }}><Download className="h-4 w-4" /></Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteDeck(deck.id)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-muted-foreground italic">
                          You have no saved decks. Create a new one!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ) : (
              <TabsContent value="decks">
                <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold italic uppercase">Sign in to create your decks</h3>
                  <p className="text-muted-foreground mb-6 font-medium italic">Your collections and strategies, saved in one place.</p>
                  <Button onClick={() => setActiveTab("meta")} className="font-bold">View Meta Decks</Button>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
