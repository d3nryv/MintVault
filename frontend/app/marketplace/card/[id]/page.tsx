"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Camera,
  ShoppingCart,
  Star,
  Award,
  Medal,
  Crown,
  Sparkles,
  Pencil,
  ImageIcon,
  Plus,
  Layers,
  ShoppingBag,
  Heart,
  Globe,
  Filter as FilterIcon,
  Tag,
} from "lucide-react"
import { useMarketplace } from "@/context/marketplace-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"

// Reputation tiers based on delivery ratio
const getReputationTier = (deliveredRatio: number, totalSales: number) => {
  if (totalSales < 10) return { icon: Star, label: "New", color: "text-muted-foreground" }
  if (deliveredRatio >= 0.99) return { icon: Crown, label: "Elite", color: "text-amber-500" }
  if (deliveredRatio >= 0.97) return { icon: Sparkles, label: "Excellent", color: "text-purple-500" }
  if (deliveredRatio >= 0.95) return { icon: Award, label: "Great", color: "text-blue-500" }
  if (deliveredRatio >= 0.90) return { icon: Medal, label: "Good", color: "text-emerald-500" }
  return { icon: Star, label: "Standard", color: "text-muted-foreground" }
}

// Format sales count with abbreviation for 1000+
const formatSalesCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`
  return count.toString()
}

const getConditionInfo = (condition: string) => {
  const conditions: Record<string, { abbr: string; label: string; color: string; description: string }> = {
    M: { abbr: "M", label: "Mint", color: "bg-emerald-500 text-white", description: "Perfect condition, no visible flaws" },
    NM: { abbr: "NM", label: "Near Mint", color: "bg-green-500 text-white", description: "Almost perfect with 1-3 micro-scratches or slightly rounded corners" },
    LP: { abbr: "LP", label: "Lightly Played", color: "bg-lime-500 text-white", description: "Minor wear like softened edges or surface scratches, still clean appearance" },
    MP: { abbr: "MP", label: "Moderately Played", color: "bg-yellow-500 text-foreground", description: "Visible wear on corners and edges with loss of shine" },
    HP: { abbr: "HP", label: "Heavily Played", color: "bg-orange-500 text-white", description: "Significant damage and multiple defects but structurally playable" },
    PO: { abbr: "PO", label: "Poor", color: "bg-red-500 text-white", description: "Severely damaged card" },
  }
  return conditions[condition] || conditions.LP
}

// Country flags (simplified with emoji)
const countryFlags: Record<string, string> = {
  US: "🇺🇸",
  ES: "🇪🇸",
  JP: "🇯🇵",
  DE: "🇩🇪",
  FR: "🇫🇷",
  UK: "🇬🇧",
  IT: "🇮🇹",
  BR: "🇧🇷",
  MX: "🇲🇽",
  CA: "🇨🇦",
}

// Sample card data
const cardData = {
  id: "125-197",
  name: "Charizard ex",
  set: "Obsidian Flames",
  number: "125/197",
  rarity: "Double Rare",
  type: "Fire",
  image: null,
  priceStats: {
    current: 89.99,
    median: 85.50,
    min: 45.00,
    max: 185.00,
    trend: 5.2,
  },
}

// Sample price history data
const generatePriceHistory = (days: number) => {
  const data = []
  const basePrice = 85
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: basePrice + Math.random() * 20 - 5 + (days - i) * 0.1,
      sales: Math.floor(Math.random() * 50) + 10,
    })
  }
  return data
}

// Sample sellers data
const sellers = [
  {
    id: 1,
    username: "PokeMaster2024",
    country: "US",
    deliveredOrders: 487,
    totalSales: 492,
    condition: "NM",
    isFirstEdition: false,
    isReverse: false,
    isSigned: false,
    price: 82.50,
    quantity: 2,
    description: "Pack fresh, sleeved immediately after opening",
    hasPhoto: true,
    photoUrl: null,
  },
  {
    id: 2,
    username: "CardCollectorES",
    country: "ES",
    deliveredOrders: 1245,
    totalSales: 1250,
    condition: "M",
    isFirstEdition: false,
    isReverse: false,
    isSigned: false,
    price: 95.00,
    quantity: 1,
    description: "Mint condition, perfect centering, shipped in toploader",
    hasPhoto: true,
    photoUrl: null,
  },
  {
    id: 3,
    username: "TokyoCards",
    country: "JP",
    deliveredOrders: 3420,
    totalSales: 3450,
    condition: "NM",
    isFirstEdition: true,
    isReverse: false,
    isSigned: false,
    price: 145.00,
    quantity: 1,
    description: "First Edition! Excellent condition with slight whitening on back",
    hasPhoto: true,
    photoUrl: null,
  },
  {
    id: 4,
    username: "RetroGamer",
    country: "DE",
    deliveredOrders: 89,
    totalSales: 95,
    condition: "LP",
    isFirstEdition: false,
    isReverse: true,
    isSigned: false,
    price: 65.00,
    quantity: 3,
    description: "Reverse holo version, light play wear on edges",
    hasPhoto: true,
    photoUrl: null,
  },
  {
    id: 5,
    username: "SignedCards",
    country: "US",
    deliveredOrders: 156,
    totalSales: 160,
    condition: "NM",
    isFirstEdition: false,
    isReverse: false,
    isSigned: true,
    price: 250.00,
    quantity: 1,
    description: "Signed by Ken Sugimori at 2023 Worlds! COA included",
    hasPhoto: true,
    photoUrl: null,
  },
  {
    id: 6,
    username: "BudgetCards",
    country: "MX",
    deliveredOrders: 45,
    totalSales: 48,
    condition: "MP",
    isFirstEdition: false,
    isReverse: false,
    isSigned: false,
    price: 42.00,
    quantity: 5,
    description: "Played condition, good for binder or casual play",
    hasPhoto: true,
    photoUrl: null,
  },
  {
    id: 7,
    username: "NewSeller123",
    country: "FR",
    deliveredOrders: 5,
    totalSales: 5,
    condition: "NM",
    isFirstEdition: false,
    isReverse: false,
    isSigned: false,
    price: 88.00,
    quantity: 1,
    description: "Great card, fast shipping",
    hasPhoto: true,
    photoUrl: null,
  },
  {
    id: 8,
    username: "DamagedDeals",
    country: "UK",
    deliveredOrders: 234,
    totalSales: 240,
    condition: "HP",
    isFirstEdition: false,
    isReverse: false,
    isSigned: false,
    price: 28.00,
    quantity: 2,
    description: "Heavy play, creases on front, still displayable",
    hasPhoto: true,
    photoUrl: null,
  },
]

export default function CardDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [card, setCard] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("3m")
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const { language: globalLanguage } = useMarketplace()
  
  // Filtering states
  const [filterCondition, setFilterCondition] = useState("all")
  const [filterLanguage, setFilterLanguage] = useState("all")
  const [filterRegion, setFilterRegion] = useState("all")
  const [isReprintsOpen, setIsReprintsOpen] = useState(false)
  const [reprints, setReprints] = useState<any[]>([])
  const [isLoadingReprints, setIsLoadingReprints] = useState(false)

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const cardRes = await fetch(`http://localhost:3000/api/cards/${id}`)
      if (!cardRes.ok) throw new Error(`HTTP error! status: ${cardRes.status}`)
      const cardData = await cardRes.json()
      setCard(cardData)

      const salesRes = await fetch(`http://localhost:3000/api/sales`)
      if (!salesRes.ok) throw new Error(`HTTP error! status: ${salesRes.status}`)
      const allSales = await salesRes.json()
      const cardSales = allSales.filter((s: any) => s.cardId === id || (s.metadata && s.metadata.tcg_id === id))
      setListings(cardSales)
    } catch (error) {
      console.error("Error fetching card details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReprints = async () => {
    if (!card) return
    setIsLoadingReprints(true)
    setIsReprintsOpen(true)
    try {
      const res = await fetch(`http://localhost:3000/api/cards/advanced-search?name=${encodeURIComponent(card.name)}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      setReprints(data.filter((c: any) => c.id !== card.id))
    } catch (e) {
      console.error("Error fetching reprints", e)
    } finally {
      setIsLoadingReprints(false)
    }
  }

  const timeRanges: Record<string, { label: string; days: number }> = {
    "1d": { label: "1 Day", days: 1 },
    "1m": { label: "1 Month", days: 30 },
    "3m": { label: "3 Months", days: 90 },
    "6m": { label: "6 Months", days: 180 },
    "1y": { label: "1 Year", days: 365 },
  }

  const priceHistory = generatePriceHistory(timeRanges[timeRange].days)

  const filteredSellers = listings.filter(l => {
    if (filterCondition !== "all" && l.condition !== filterCondition) return false
    if (filterLanguage !== "all" && l.language !== filterLanguage) return false
    // region filter logic would go here if backend supported it or metadata included it
    return true
  })

  const sortedSellers = [...filteredSellers].sort((a, b) => a.price - b.price)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Card not found</h2>
        <Link href="/marketplace">
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link href="/marketplace">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Button>
          </Link>

          {/* Card Info Section */}
          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            {/* Card Image */}
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                <div className="aspect-[2.5/3.5] rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {card.images?.large ? (
                    <img src={card.images.large} alt={card.name} className="h-full w-full object-contain" />
                  ) : (
                    <ImageIcon className="h-20 w-20 text-muted-foreground" />
                  )}
                </div>
                <div className="mt-4 space-y-2 text-center">
                  <h1 className="font-serif text-2xl font-bold">{card.name}</h1>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{card.set?.name}</Badge>
                    <Badge variant="outline">{card.number}</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>{card.rarity || 'Common'}</span>
                    <span>•</span>
                    <span>{card.supertype} Type</span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => router.push(`/marketplace?tab=sell&cardId=${card.id}`)}>
                      <Tag className="h-4 w-4" />
                      Sell this card
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Heart className="h-4 w-4" />
                          Add to Wants
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add to Want List</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-muted-foreground">Language</label>
                              <Select defaultValue="EN">
                                <SelectTrigger>
                                  <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="EN">English</SelectItem>
                                  <SelectItem value="ES">Spanish</SelectItem>
                                  <SelectItem value="JP">Japanese</SelectItem>
                                  <SelectItem value="all">Any Language</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-muted-foreground">Condition (Min)</label>
                              <Select defaultValue="NM">
                                <SelectTrigger>
                                  <SelectValue placeholder="Condition" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="NM">Near Mint+</SelectItem>
                                  <SelectItem value="EX">Excellent+</SelectItem>
                                  <SelectItem value="LP">Light Played+</SelectItem>
                                  <SelectItem value="all">Any Condition</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-muted-foreground">Quantity</label>
                              <Input type="number" defaultValue="1" min="1" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-muted-foreground">Seller Location</label>
                              <Select defaultValue="all">
                                <SelectTrigger>
                                  <SelectValue placeholder="Location" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="EU">Europe</SelectItem>
                                  <SelectItem value="ES">Spain Only</SelectItem>
                                  <SelectItem value="all">Worldwide</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3 text-xs text-primary border border-primary/10">
                            <Globe className="h-4 w-4 shrink-0" />
                            <p>The Shopping Wizard will prioritize the cheapest options matching these criteria.</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button className="w-full font-bold uppercase tracking-widest h-12">
                            Add to Want List
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" className="col-span-2 gap-2" onClick={fetchReprints}>
                      <Layers className="h-4 w-4" />
                      Show Reprints
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Stats & Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Price Statistics</span>
                  <div className={`flex items-center gap-1 text-lg ${(card.priceStats?.trend || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {(card.priceStats?.trend || 0) >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    {(card.priceStats?.trend || 0) >= 0 ? "+" : ""}{(card.priceStats?.trend || 0)}%
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Price stats grid */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <p className="text-sm text-muted-foreground">Current Market</p>
                    <p className="text-xl font-bold">{card.tcgplayer?.updatedAt ? `${card.tcgplayer.prices?.holofoil?.market?.toFixed(2) || card.tcgplayer.prices?.normal?.market?.toFixed(2) || '0.00'}€` : 'N/A'}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <p className="text-sm text-muted-foreground">Listings</p>
                    <p className="text-xl font-bold">{listings.length}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
                    <p className="text-sm text-emerald-600">Low Price</p>
                    <p className="text-xl font-bold text-emerald-600">{listings.length > 0 ? `${Math.min(...listings.map(l => l.price)).toFixed(2)}€` : 'N/A'}</p>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 p-3 text-center">
                    <p className="text-sm text-amber-600">High Price</p>
                    <p className="text-xl font-bold text-amber-600">{listings.length > 0 ? `${Math.max(...listings.map(l => l.price)).toFixed(2)}€` : 'N/A'}</p>
                  </div>
                </div>

                {/* Time range tabs */}
                <Tabs value={timeRange} onValueChange={setTimeRange} className="mb-4">
                  <TabsList className="grid w-full grid-cols-5">
                    {Object.entries(timeRanges).map(([key, { label }]) => (
                      <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                {/* Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                        className="text-muted-foreground"
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sellers Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <span>Available Sellers ({sortedSellers.length})</span>
                <div className="flex flex-wrap items-center gap-2">
                   <Popover>
                     <PopoverTrigger asChild>
                       <Button variant="outline" size="sm" className="gap-2">
                         <FilterIcon className="h-4 w-4" />
                         Filters
                         {(filterCondition !== 'all' || filterLanguage !== 'all') && (
                           <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                             {(filterCondition !== 'all' ? 1 : 0) + (filterLanguage !== 'all' ? 1 : 0)}
                           </Badge>
                         )}
                       </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-80 p-4">
                       <div className="space-y-4">
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-muted-foreground">Condition</label>
                           <Select value={filterCondition} onValueChange={setFilterCondition}>
                             <SelectTrigger>
                               <SelectValue placeholder="Any Condition" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="all">Any Condition</SelectItem>
                               <SelectItem value="M">Mint (M)</SelectItem>
                               <SelectItem value="NM">Near Mint (NM)</SelectItem>
                               <SelectItem value="LP">Lightly Played (LP)</SelectItem>
                               <SelectItem value="MP">Moderately Played (MP)</SelectItem>
                               <SelectItem value="HP">Heavily Played (HP)</SelectItem>
                               <SelectItem value="PO">Poor (PO)</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-muted-foreground">Language</label>
                           <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                             <SelectTrigger>
                               <SelectValue placeholder="Any Language" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="all">Any Language</SelectItem>
                               <SelectItem value="EN">🇺🇸 English</SelectItem>
                               <SelectItem value="ES">🇪🇸 Spanish</SelectItem>
                               <SelectItem value="JP">🇯🇵 Japanese</SelectItem>
                               <SelectItem value="DE">🇩🇪 German</SelectItem>
                               <SelectItem value="FR">🇫🇷 French</SelectItem>
                               <SelectItem value="IT">🇮🇹 Italian</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                         <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => {setFilterCondition("all"); setFilterLanguage("all")}}>
                           Reset Filters
                         </Button>
                       </div>
                     </PopoverContent>
                   </Popover>
                  <span className="text-xs font-normal text-muted-foreground">
                    Sorted by price: lowest first
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {sortedSellers.map((listing) => (
                  <div key={listing.id} className="flex flex-col gap-4 p-4 transition-colors hover:bg-secondary/20 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {listing.sellerName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{listing.sellerName}</span>
                          <Badge variant="outline" className={getConditionInfo(listing.condition).color}>
                            {listing.condition}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{listing.language}</span>
                          <span>•</span>
                          <span>Professional Seller</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-xl font-bold">{listing.price.toFixed(2)}€</p>
                        <p className="text-xs text-muted-foreground">x{listing.amount} available</p>
                      </div>
                      <Button className="gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
                {sortedSellers.length === 0 && (
                  <div className="py-20 text-center text-muted-foreground">
                    No listings found for this card.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
