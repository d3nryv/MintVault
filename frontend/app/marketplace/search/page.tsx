"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, ImageIcon, ShoppingCart, Filter, ArrowLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useMarketplace } from "@/context/marketplace-context"

const mockCards = [
  { id: 1, name: "Charizard ex", set: "Obsidian Flames", setCode: "OBF", number: "125/197", price: 45.99, image: null },
  { id: 2, name: "Charizard ex", set: "Paldean Fates", setCode: "PAF", number: "054/091", price: 12.50, image: null },
  { id: 3, name: "Charizard ex SAR", set: "Paldean Fates", setCode: "PAF", number: "234/091", price: 125.00, image: null },
  { id: 4, name: "Charizard ex", set: "151", setCode: "MEW", number: "006/165", price: 28.00, image: null },
  { id: 5, name: "Charmander", set: "Obsidian Flames", setCode: "OBF", number: "026/197", price: 0.50, image: null },
  { id: 51, name: "Charizard", set: "Paldean Fates", setCode: "PAF", number: "51/091", price: 15.00, image: null },
]

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const initialSet = searchParams.get("set") || "all"

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedSet, setSelectedSet] = useState(initialSet)
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState("price_asc")
  const [allSets, setAllSets] = useState<any[]>([])
  const [setSearchTerm, setSetSearchTerm] = useState("")
  const router = useRouter()
  const { language: globalLanguage } = useMarketplace()

  useEffect(() => {
    fetchAllSets()
  }, [])

  const fetchAllSets = async () => {
    try {
      const res = await fetch("https://api.pokemontcg.io/v2/sets")
      const data = await res.json()
      setAllSets(data.data)
    } catch (e) {
      console.error("Error fetching sets", e)
    }
  }

  useEffect(() => {
    handleSearch()
  }, [initialQuery, initialSet, globalLanguage])

  const handleSearch = async () => {
    if (!searchQuery && selectedSet === "all") return;
    
    setIsLoading(true)
    try {
      let name = searchQuery
      let set = selectedSet !== 'all' ? selectedSet : ''
      let number = ''

      // Handle quoted strings for exact name matching
      if (searchQuery.startsWith('"') && searchQuery.includes('"', 1)) {
        const lastQuoteIndex = searchQuery.lastIndexOf('"')
        name = searchQuery.substring(1, lastQuoteIndex)
        const rest = searchQuery.substring(lastQuoteIndex + 1).trim()
        
        if (rest) {
          const parts = rest.split(/\s+/)
          if (parts.length > 0) {
            if (/^[a-zA-Z0-9]{2,5}$/.test(parts[0]) && !/^\d+$/.test(parts[0])) {
              set = parts[0]
              if (parts[1] && /^\d+$/.test(parts[1])) number = parts[1]
            } else if (/^\d+$/.test(parts[0])) {
              number = parts[0]
            }
          }
        }
        name = `"${name}"`
      } else {
        const match = searchQuery.match(/^(.+?)(?:\s+([a-zA-Z0-9]{2,5}))?(?:\s+(\d+))?$/)
        if (match) {
          name = match[1].trim()
          if (match[2] && !match[3] && !isNaN(match[2] as any)) {
            number = match[2]
          } else {
            if (match[2]) set = match[2].trim()
            if (match[3]) number = match[3].trim()
          }
        }
        
        if (name.includes(' ') && !name.startsWith('"')) {
          name = `"${name}"`
        }
      }

      const params = new URLSearchParams()
      if (name) params.append('name', name)
      if (set) params.append('set', set)
      if (number) params.append('number', number)
      if (globalLanguage && globalLanguage !== 'all') params.append('language', globalLanguage)

      let url = `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}'}`}/cards/advanced-search?${params.toString()}`
      const response = await fetch(url)
      if (!response.ok) {
          const text = await response.text()
          console.error("Search fetch failed:", response.status, text.slice(0, 100))
          throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      if (data.length === 1) {
        router.push(`/marketplace/card/${data[0].id}`)
        return
      }
      
      setResults(data)
    } catch (error) {
      console.error("Error searching cards:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === "price_asc") {
      if (!a.price) return 1
      if (!b.price) return -1
      return a.price - b.price
    }
    if (sortBy === "price_desc") {
      if (!a.price) return 1
      if (!b.price) return -1
      return b.price - a.price
    }
    if (sortBy === "newest") {
      const dateA = new Date(a.createdAt || a.metadata?.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || b.metadata?.createdAt || 0).getTime();
      return dateB - dateA;
    }
    return 0
  })

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Mint": return "bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
      case "Near Mint": return "bg-blue-500/20 text-blue-700 border-blue-500/30"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-4">
            <Link href="/marketplace">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-serif text-3xl font-bold">Search Results</h1>
          </div>

          <div className="mb-8 grid gap-4 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search cards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                        <Select value={selectedSet} onValueChange={setSelectedSet}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Sets" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2 border-b">
                              <div className="relative">
                                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input 
                                  placeholder="Search sets..." 
                                  value={setSearchTerm}
                                  onChange={(e) => setSetSearchTerm(e.target.value)}
                                  className="pl-8 h-8 text-xs"
                                  onKeyDown={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                              <SelectItem value="all">All Sets</SelectItem>
                              {allSets
                                .filter(set => set.name.toLowerCase().includes(setSearchTerm.toLowerCase()) || set.id.toLowerCase().includes(setSearchTerm.toLowerCase()))
                                .map(set => (
                                  <SelectItem key={set.id} value={set.id}>
                                    {set.name} ({set.id})
                                  </SelectItem>
                                ))
                              }
                            </div>
                          </SelectContent>
                        </Select>
                      <Button onClick={handleSearch}>Search</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">Sort by</span>
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest Listed</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? (
              <div className="col-span-full py-20 text-center">
                 <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                 <p className="text-muted-foreground">Searching real cards...</p>
              </div>
            ) : sortedResults.map((card) => (
              <Card key={card.id} className="group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-border/50">
                <div className="aspect-[3/4] relative bg-muted flex items-center justify-center overflow-hidden p-2">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   {card.images?.small ? (
                     <img src={card.images.small} alt={card.name} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110" />
                   ) : (
                     <ImageIcon className="h-20 w-20 text-muted-foreground/30" />
                   )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate flex-1">
                      {card.name}
                    </h3>
                    <span className="text-sm font-mono text-muted-foreground">{card.set?.name || 'Unknown Set'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Market Price</span>
                      <span className="text-xl font-black text-foreground">{card.price ? `${card.price.toFixed(2)}€` : 'N/A'}</span>
                    </div>
                    <Link href={`/marketplace/card/${card.id}`}>
                      <Button size="sm" className="gap-2 shadow-lg shadow-primary/20">
                        View Listings
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!isLoading && results.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-bold">No cards found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                <Button variant="link" onClick={() => {setSearchQuery(""); setSelectedSet("all"); handleSearch();}}>Clear all filters</Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
