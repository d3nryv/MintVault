"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Swords, FolderOpen, Plus, Edit, Trash2, Download, Calendar, MapPin, Users } from "lucide-react"
import { useAuth } from "@/context/auth-context"

const metaDecks = [
  { name: "Charizard ex Control", tier: "S", winRate: "62%", popularity: "High" },
  { name: "Gardevoir ex", tier: "S", winRate: "58%", popularity: "High" },
  { name: "Lugia VSTAR", tier: "A", winRate: "54%", popularity: "Medium" },
  { name: "Miraidon ex", tier: "A", winRate: "52%", popularity: "Medium" },
  { name: "Lost Box", tier: "B", winRate: "48%", popularity: "Low" },
]

const tournaments = {
  upcoming: [
    { name: "Regional Championship", date: "May 15, 2026", location: "Los Angeles, CA", participants: 512, format: "Standard" },
    { name: "League Cup", date: "May 8, 2026", location: "San Francisco, CA", participants: 32, format: "Standard" },
    { name: "Local Tournament", date: "May 3, 2026", location: "Berkeley, CA", participants: 16, format: "Expanded" },
  ],
  finished: [
    { name: "World Championship 2025", date: "Aug 16, 2025", location: "Yokohama, Japan", winner: "Player123", participants: 1024 },
    { name: "North America Internationals", date: "Jun 28, 2025", location: "Columbus, OH", winner: "ChampionX", participants: 800 },
  ],
}

const yourDecks = [
  { name: "My Charizard Deck", format: "Standard", cards: 60, lastEdited: "2 days ago" },
  { name: "Budget Gardevoir", format: "Standard", cards: 60, lastEdited: "1 week ago" },
  { name: "Fun Mew VMAX", format: "Expanded", cards: 60, lastEdited: "2 weeks ago" },
]

export default function GameplayPage() {
  const [activeTab, setActiveTab] = useState("meta")
  const [tournamentTab, setTournamentTab] = useState("upcoming")
  const { user } = useAuth()

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
            <p className="mt-2 text-muted-foreground">
              Explore meta decks, find tournaments, and build your decks
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`mb-8 grid w-full max-w-md ${user ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="meta" className="gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Meta Decks</span>
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="gap-2">
                <Swords className="h-4 w-4" />
                <span className="hidden sm:inline">Tournaments</span>
              </TabsTrigger>
              {user && (
                <TabsTrigger value="decks" className="gap-2">
                  <FolderOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Your Decks</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="meta">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Current Meta Decks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metaDecks.map((deck, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
                      >
                        <div className="flex items-center gap-4">
                          <Badge className={getTierColor(deck.tier)}>
                            Tier {deck.tier}
                          </Badge>
                          <span className="font-medium">{deck.name}</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>Win Rate: {deck.winRate}</span>
                          <span>Popularity: {deck.popularity}</span>
                          <Button variant="outline" size="sm">
                            View Deck
                          </Button>
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
                    <Swords className="h-5 w-5" />
                    Tournaments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={tournamentTab} onValueChange={setTournamentTab}>
                    <TabsList className="mb-6">
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      <TabsTrigger value="finished">Finished</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming">
                      <div className="space-y-4">
                        {tournaments.upcoming.map((tournament, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                          >
                            <div className="space-y-1">
                              <h4 className="font-medium">{tournament.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {tournament.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {tournament.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {tournament.participants} players
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{tournament.format}</Badge>
                              <Button size="sm">Register</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="finished">
                      <div className="space-y-4">
                        {tournaments.finished.map((tournament, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                          >
                            <div className="space-y-1">
                              <h4 className="font-medium">{tournament.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {tournament.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {tournament.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  Winner: {tournament.winner}
                                </span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              View Results
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {user ? (
              <TabsContent value="decks">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5" />
                      Your Decks
                    </CardTitle>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Deck
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {yourDecks.map((deck, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                        >
                          <div className="space-y-1">
                            <h4 className="font-medium">{deck.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <Badge variant="outline">{deck.format}</Badge>
                              <span>{deck.cards} cards</span>
                              <span>Last edited: {deck.lastEdited}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                  <h3 className="text-xl font-bold">Sign in to create your decks</h3>
                  <p className="text-muted-foreground mb-6">You must be logged in to save and manage your custom decks.</p>
                  <Button onClick={() => setActiveTab("meta")}>View Meta Decks</Button>
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
