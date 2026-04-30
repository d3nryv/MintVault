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

// --- Meta Decks (Static) ---
const metaDecks = [
  { name: "Charizard ex Control", tier: "S", winRate: "62%", popularity: "High" },
  { name: "Gardevoir ex", tier: "S", winRate: "58%", popularity: "High" },
  { name: "Lugia VSTAR", tier: "A", winRate: "54%", popularity: "Medium" },
  { name: "Miraidon ex", tier: "A", winRate: "52%", popularity: "Medium" },
  { name: "Lost Box", tier: "B", winRate: "48%", popularity: "Low" },
]

// --- Your Decks (Static) ---
const yourDecks = [
  { name: "My Charizard Deck", format: "Standard", cards: 60, lastEdited: "2 days ago" },
  { name: "Budget Gardevoir", format: "Standard", cards: 60, lastEdited: "1 week ago" },
  { name: "Fun Mew VMAX", format: "Expanded", cards: 60, lastEdited: "2 weeks ago" },
]

export default function GameplayPage() {
  const [activeTab, setActiveTab] = useState("meta")
  const { user } = useAuth()
  const router = useRouter()

  const [tournaments, setTournaments] = useState<any[]>([])
  const [selectedTournament, setSelectedTournament] = useState<any | null>(null)
  const [standings, setStandings] = useState<any[]>([])
  const [pairings, setPairings] = useState<any[]>([])
  
  const [isLoading, setIsLoading] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [page, setPage] = useState(1)

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
                  <div className="space-y-3">
                    {metaDecks.map((deck, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/50">
                        <div className="flex items-center gap-4">
                          <Badge className={getTierColor(deck.tier)}>Tier {deck.tier}</Badge>
                          <span className="font-bold">{deck.name}</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
                          <span>Win Rate: {deck.winRate}</span>
                          <span>Popularity: {deck.popularity}</span>
                          <Button variant="outline" size="sm" className="font-bold">View Deck</Button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                      {yourDecks.map((deck, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/20 transition-all">
                          <div className="space-y-1">
                            <h4 className="font-bold text-lg uppercase italic">{deck.name}</h4>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold italic">
                              <Badge variant="outline" className="font-bold text-[10px]">{deck.format}</Badge>
                              <span>{deck.cards} cards</span>
                              <span>Edited: {deck.lastEdited}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => router.push("/decks/builder")}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
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
