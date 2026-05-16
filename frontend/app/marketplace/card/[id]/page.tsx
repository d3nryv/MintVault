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
  DialogDescription,
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
  X,
} from "lucide-react"
import { useMarketplace } from "@/context/marketplace-context"
import { useAuth } from "@/context/auth-context"
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
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts"
import { getShippingPrice } from "@/lib/shipping-rates"
import { getLanguageFlag } from "@/lib/language-flags"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp, History, Info, MapPin } from "lucide-react"

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
  PL: "🇵🇱",
  DO: "🇩🇴",
}

const CONDITION_VALUES: Record<string, number> = {
  "PO": 0,
  "HP": 1,
  "MP": 2,
  "LP": 3,
  "EX": 4,
  "NM": 5,
  "M": 6
};

export default function CardDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [card, setCard] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("3m")
  const { user } = useAuth()
  const { language: globalLanguage } = useMarketplace()
  const [isWantsDialogOpen, setIsWantsDialogOpen] = useState(false)
  const [selectedListId, setSelectedListId] = useState<string>("")
  const [wantsLists, setWantsLists] = useState<any[]>([])
  const [isAddingToWants, setIsAddingToWants] = useState(false)
  const [realPriceHistory, setRealPriceHistory] = useState<any[]>([])
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({})

  // Advanced Filtering states
  const [filterCondition, setFilterCondition] = useState("all")
  const [filterLanguage, setFilterLanguage] = useState("all")
  const [filterLocations, setFilterLocations] = useState<string[]>([])
  const [filterSellerType, setFilterSellerType] = useState<string[]>([])
  const [filterMaxPrice, setFilterMaxPrice] = useState<number | "">("")
  const [filterMinQty, setFilterMinQty] = useState(1)
  const [filterExtras, setFilterExtras] = useState({
    reverse: "all",
    signed: "all",
    firstEdition: "all",
    altered: "all"
  })

  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    location: true,
    sellerType: true,
    language: true,
    condition: true,
    extra: true,
    price: true,
    qty: true
  })
  const [isReprintsOpen, setIsReprintsOpen] = useState(false)
  const [reprints, setReprints] = useState<any[]>([])
  const [isLoadingReprints, setIsLoadingReprints] = useState(false)

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  useEffect(() => {
    if (user?.wantList) {
      setWantsLists(user.wantList.map((l: any) => typeof l === 'string' ? JSON.parse(l) : l))
    }
  }, [user])

  const handleAddToWantsList = async () => {
    if (!selectedListId || !user || !card) return

    setIsAddingToWants(true)
    try {
      const cardId = card.id || card.metadata?.tcg_id || id;
      const updatedLists = wantsLists.map(list => {
        if (list.id === selectedListId) {
          if (list.items.some((item: any) => item.id === cardId)) {
            return list
          }
          return {
            ...list,
            items: [
              ...list.items,
              {
                id: cardId,
                name: card.name,
                set: card.metadata?.set?.name || card.set?.name || card.set || 'Unknown Set',
                number: card.metadata?.number || card.number || 'N/A',
                count: 1,
                condition: "Near Mint",
                priority: "Medium",
                owned: false
              }
            ]
          }
        }
        return list
      })

      const res = await fetch(`http://127.0.0.1:3000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wantList: updatedLists.map(l => JSON.stringify(l)) })
      })

      if (!res.ok) throw new Error("Failed to sync wants list")

      setWantsLists(updatedLists)
      updateUser({ wantList: updatedLists.map(l => JSON.stringify(l)) })
      alert("Added to Wants List!")
      setIsWantsDialogOpen(false)
    } catch (e) {
      console.error("Error adding to wants list", e)
      alert("Error adding to list. Please try again.")
    } finally {
      setIsAddingToWants(false)
    }
  }

  const { updateUser } = useAuth()

  const handleAddToCart = (listing: any) => {
    if (!user) {
      alert("Please login to add items to your cart")
      return
    }

    const qty = selectedQuantities[listing.id] || 1
    const cartItem = {
      id: listing.id,
      tcgId: listing.tcgId || card.id,
      name: card.name,
      image: card.metadata?.images?.small || card.images?.small,
      price: listing.price,
      quantity: qty,
      sellerName: listing.sellerName,
      sellerId: listing.sellerId,
      sellerCountry: listing.country || "ES",
      condition: listing.condition,
      language: listing.language
    }

    const currentCart = user.cart ? user.cart.map(item => typeof item === 'string' ? JSON.parse(item) : item) : []
    
    // Check if item from same listing already in cart
    const existingItemIndex = currentCart.findIndex((item: any) => item.id === listing.id)
    
    let updatedCart
    if (existingItemIndex > -1) {
      updatedCart = [...currentCart]
      updatedCart[existingItemIndex].quantity += qty
    } else {
      updatedCart = [...currentCart, cartItem]
    }

    updateUser({ cart: updatedCart.map(item => JSON.stringify(item)) })
    alert(`Added ${qty} copies to your cart!`)
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [cardRes, salesRes, historyRes] = await Promise.all([
        fetch(`http://localhost:3000/api/cards/${id}`),
        fetch(`http://localhost:3000/api/sales`),
        fetch(`http://localhost:3000/api/transactions/card/${id}/history`)
      ]);

      if (!cardRes.ok) throw new Error(`HTTP error! status: ${cardRes.status}`)
      const cardData = await cardRes.json()
      setCard(cardData)

      if (salesRes.ok) {
        const allSales = await salesRes.json()
        const cardSales = allSales.filter((s: any) => s.tcgId === id || s.cardId === id || (s.metadata && s.metadata.tcg_id === id))
        setListings(cardSales)
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setRealPriceHistory(historyData)
      }
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

  const filteredPriceHistory = realPriceHistory.filter(h => {
    const date = new Date(h.date);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    return diffDays <= timeRanges[timeRange].days;
  });

  const filteredSellers = listings.filter(l => {
    // Condition
    if (filterCondition !== "all" && CONDITION_VALUES[l.condition] < CONDITION_VALUES[filterCondition]) return false
    
    // Language
    if (filterLanguage !== "all" && l.language !== filterLanguage) return false
    
    // Location
    if (filterLocations.length > 0 && !filterLocations.includes(l.country || "ES")) return false
    
    // Price
    if (filterMaxPrice !== "" && l.price > Number(filterMaxPrice)) return false
    
    // Qty
    if (l.amount < filterMinQty) return false
    
    // Extras
    if (filterExtras.reverse !== "all") {
      const wants = filterExtras.reverse === "Yes"
      if (l.isReverse !== wants) return false
    }
    if (filterExtras.signed !== "all") {
      const wants = filterExtras.signed === "Yes"
      if (l.isSigned !== wants) return false
    }
    if (filterExtras.firstEdition !== "all") {
      const wants = filterExtras.firstEdition === "Yes"
      if (l.isFirstEdition !== wants) return false
    }
    if (filterExtras.altered !== "all") {
      const wants = filterExtras.altered === "Yes"
      if (l.isAltered !== wants) return false
    }

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
                  {card.metadata?.images?.large ? (
                    <img src={card.metadata.images.large} alt={card.name} className="h-full w-full object-contain" />
                  ) : card.images?.large ? (
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
                    <Button variant="outline" className="gap-2" onClick={() => router.push(`/marketplace?tab=sell&cardId=${card.id || card.metadata?.tcg_id}`)}>
                      <Tag className="h-4 w-4" />
                      Sell this card
                    </Button>
                    <Dialog open={isWantsDialogOpen} onOpenChange={setIsWantsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Heart className="h-4 w-4" />
                          Add to Wants
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add to Want List</DialogTitle>
                          <DialogDescription>Select which list you want to add {card.name} to.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Target List</label>
                            <Select value={selectedListId} onValueChange={setSelectedListId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a list..." />
                              </SelectTrigger>
                              <SelectContent>
                                {wantsLists.map(list => (
                                  <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsWantsDialogOpen(false)}>Cancel</Button>
                          <Button
                            className="font-bold uppercase tracking-widest"
                            onClick={handleAddToWantsList}
                            disabled={!selectedListId || isAddingToWants}
                          >
                            {isAddingToWants ? "Adding..." : "Add to Want List"}
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
                <div className="relative h-72 mt-4 bg-secondary/20 rounded-xl p-4 border border-border/50">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredPriceHistory.length > 0 ? filteredPriceHistory : [{date: 'N/A', price: 0}]}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}
                        minTickGap={30}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}
                        tickFormatter={(val) => `${val}€`}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        itemStyle={{ color: 'hsl(var(--accent))' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  {realPriceHistory.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px] rounded-xl">
                      <div className="text-center">
                        <History className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-20" />
                        <p className="text-sm font-medium text-muted-foreground">No sales data available yet</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-serif">
                <ShoppingBag className="h-6 w-6 text-accent" />
                Marketplace Listings
                <Badge variant="secondary" className="ml-2 bg-accent/10 text-accent border-none">
                  {sortedSellers.length} available
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar Filters */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="rounded-xl border border-border bg-card p-4 sticky top-24">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                        <FilterIcon className="h-4 w-4" />
                        Filters
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs text-muted-foreground hover:text-accent"
                        onClick={() => {
                          setFilterCondition("all");
                          setFilterLanguage("all");
                          setFilterLocations([]);
                          setFilterSellerType([]);
                          setFilterMaxPrice("");
                          setFilterMinQty(1);
                        }}
                      >
                        Reset
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {/* Location Filter */}
                      <div className="space-y-3">
                        <button 
                          onClick={() => setExpandedFilters(prev => ({...prev, location: !prev.location}))}
                          className="flex items-center justify-between w-full text-sm font-semibold group"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            Location
                          </span>
                          {expandedFilters.location ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {expandedFilters.location && (
                          <div className="grid grid-cols-2 gap-2 pl-6">
                            {["ES", "US", "JP", "DE", "FR", "UK", "IT", "CA"].map(loc => (
                              <div key={loc} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`loc-${loc}`} 
                                  checked={filterLocations.includes(loc)}
                                  onCheckedChange={(checked) => {
                                    setFilterLocations(prev => checked ? [...prev, loc] : prev.filter(l => l !== loc))
                                  }}
                                />
                                <label htmlFor={`loc-${loc}`} className="text-sm cursor-pointer flex items-center gap-1">
                                  {countryFlags[loc]} {loc}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Separator className="opacity-50" />

                      {/* Condition Filter */}
                      <div className="space-y-3">
                        <button 
                          onClick={() => setExpandedFilters(prev => ({...prev, condition: !prev.condition}))}
                          className="flex items-center justify-between w-full text-sm font-semibold"
                        >
                          <span className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-muted-foreground" />
                            Min. Condition
                          </span>
                          {expandedFilters.condition ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {expandedFilters.condition && (
                          <div className="pl-6">
                            <Select value={filterCondition} onValueChange={setFilterCondition}>
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Any Condition</SelectItem>
                                <SelectItem value="M">Mint (M)</SelectItem>
                                <SelectItem value="NM">Near Mint (NM)+</SelectItem>
                                <SelectItem value="LP">Lightly Played (LP)+</SelectItem>
                                <SelectItem value="MP">Moderately Played (MP)+</SelectItem>
                                <SelectItem value="HP">Heavily Played (HP)+</SelectItem>
                                <SelectItem value="PO">Poor (PO)+</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <Separator className="opacity-50" />

                      {/* Language Filter */}
                      <div className="space-y-3">
                        <button 
                          onClick={() => setExpandedFilters(prev => ({...prev, language: !prev.language}))}
                          className="flex items-center justify-between w-full text-sm font-semibold"
                        >
                          <span className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            Language
                          </span>
                          {expandedFilters.language ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {expandedFilters.language && (
                          <div className="pl-6">
                            <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Any Language</SelectItem>
                                <SelectItem value="EN">🇺🇸 English</SelectItem>
                                <SelectItem value="ES">🇪🇸 Spanish</SelectItem>
                                <SelectItem value="JP">🇯🇵 Japanese</SelectItem>
                                <SelectItem value="DE">🇩🇪 German</SelectItem>
                                <SelectItem value="FR">🇫🇷 French</SelectItem>
                                <SelectItem value="IT">🇮🇹 Italian</SelectItem>
                                <SelectItem value="DO">🇩🇴 Spanish (Latam)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <Separator className="opacity-50" />

                      {/* Extra Options */}
                      <div className="space-y-3">
                        <button 
                          onClick={() => setExpandedFilters(prev => ({...prev, extra: !prev.extra}))}
                          className="flex items-center justify-between w-full text-sm font-semibold"
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-muted-foreground" />
                            Extras
                          </span>
                          {expandedFilters.extra ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {expandedFilters.extra && (
                          <div className="space-y-3 pl-6">
                            {["Reverse", "Signed", "First Edition", "Altered"].map(extra => (
                              <div key={extra} className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground">{extra}</label>
                                <Select 
                                  value={filterExtras[extra.toLowerCase().replace(" ", "") as keyof typeof filterExtras]} 
                                  onValueChange={(val) => setFilterExtras(prev => ({...prev, [extra.toLowerCase().replace(" ", "")]: val}))}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">Any</SelectItem>
                                    <SelectItem value="Yes">Yes</SelectItem>
                                    <SelectItem value="No">No</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Separator className="opacity-50" />

                      {/* Price Filter */}
                      <div className="space-y-3">
                        <button 
                          onClick={() => setExpandedFilters(prev => ({...prev, price: !prev.price}))}
                          className="flex items-center justify-between w-full text-sm font-semibold"
                        >
                          <span className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            Max Price
                          </span>
                        </button>
                        <div className="pl-6 space-y-2">
                          <Input 
                            type="number" 
                            value={filterMaxPrice} 
                            onChange={(e) => setFilterMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                            className="h-9 text-sm"
                            placeholder="No limit"
                          />
                          <p className="text-[10px] text-muted-foreground italic">
                            {filterMaxPrice === "" ? "Showing all prices" : `Showing listings up to ${filterMaxPrice}€`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Content: Listings */}
                <div className="lg:col-span-3">
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 p-5 border-b border-border bg-secondary/30 text-[10px] font-black uppercase tracking-wider text-muted-foreground items-center">
                      <div className="col-span-2">Seller</div>
                      <div className="col-span-1 text-center">Lang</div>
                      <div className="col-span-1 text-center">Adds</div>
                      <div className="col-span-1 text-center">Cond</div>
                      <div className="col-span-3">Description</div>
                      <div className="col-span-2 text-right">Price / Shipping</div>
                      <div className="col-span-1 text-center">Qty</div>
                      <div className="col-span-1"></div>
                    </div>

                    <div className="divide-y divide-border">
                      {sortedSellers.map((listing) => {
                        const cond = getConditionInfo(listing.condition);
                        const cartItemForListing = user?.cart?.map((item: any) => typeof item === 'string' ? JSON.parse(item) : item).find((item: any) => item.id === listing.id);
                        const inCartQty = cartItemForListing ? cartItemForListing.quantity : 0;
                        const availableStock = listing.amount - inCartQty;
                        const isOutOfStock = availableStock <= 0;
                        const selectedQty = selectedQuantities[listing.id] || 1;

                        return (
                          <div key={listing.id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-3 hover:bg-secondary/10 transition-colors items-center text-xs ${isOutOfStock ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                            {/* Seller Info */}
                            <div className="col-span-2 flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5 overflow-hidden">
                                <span className="font-mono text-[10px] bg-secondary px-1 rounded shrink-0">{listing.country || "ES"}</span>
                                <Link href={`/profile/${listing.sellerId}`} className="font-bold hover:text-accent truncate">
                                  {listing.sellerName}
                                </Link>
                              </div>
                              <p className="text-[10px] text-accent font-medium mt-0.5">
                                {listing.sellerSuccessRate || 100}% success
                              </p>
                            </div>

                            {/* Language Flag */}
                            <div className="col-span-1 flex justify-center text-lg">
                              {getLanguageFlag(listing.language)}
                            </div>

                            {/* Extras */}
                            <div className="col-span-1 flex flex-wrap justify-center gap-1">
                                {(listing.isReverse || listing.extras?.reverseHolo) && <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/30 text-[8px] px-1 py-0">REV</Badge>}
                                {(listing.isFirstEdition || listing.extras?.firstEdition) && <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30 text-[8px] px-1 py-0">1ST</Badge>}
                                {(listing.isSigned || listing.extras?.signed) && <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30 text-[8px] px-1 py-0">SIG</Badge>}
                                {(listing.isAltered || listing.extras?.altered) && <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/30 text-[8px] px-1 py-0">ALT</Badge>}
                            </div>

                            {/* Condition */}
                            <div className="col-span-1 flex justify-center">
                                <Badge className={`${cond.color} border-none font-bold text-[10px] px-1.5 py-0 rounded-full`}>
                                  {cond.abbr}
                                </Badge>
                            </div>

                            {/* Description (Center) */}
                            <div className="col-span-3 min-w-0">
                              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight italic">
                                {listing.observations || "---"}
                              </p>
                            </div>

                            {/* Price & Shipping */}
                            <div className="col-span-2 flex flex-col items-end">
                                <p className="text-sm font-black tracking-tight">{listing.price.toFixed(2)}€</p>
                                <p className="text-[10px] text-muted-foreground">
                                  +{getShippingPrice(listing.country || "ES").regular.toFixed(2)}€ shipping
                                </p>
                            </div>
                            
                            {/* Quantity & Stock */}
                            <div className="col-span-1 flex flex-col items-center">
                                <Select 
                                  value={selectedQty.toString()} 
                                  onValueChange={(val) => setSelectedQuantities(prev => ({...prev, [listing.id]: Number(val)}))}
                                  disabled={isOutOfStock}
                                >
                                  <SelectTrigger className="w-12 h-7 text-[10px] p-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[...Array(Math.min(availableStock, 10))].map((_, i) => (
                                      <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className={`text-[9px] font-bold mt-0.5 ${isOutOfStock ? 'text-red-500' : 'text-muted-foreground'}`}>
                                  {isOutOfStock ? 'Out of Stock' : `${availableStock} left`}
                                </p>
                            </div>

                            {/* Cart Action */}
                            <div className="col-span-1 flex justify-end">
                                <Button 
                                  size="icon" 
                                  className={`h-8 w-8 rounded-full shadow-sm ${isOutOfStock ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-accent hover:bg-accent/90 text-accent-foreground'}`}
                                  onClick={() => !isOutOfStock && handleAddToCart(listing)}
                                  disabled={isOutOfStock}
                                >
                                  {isOutOfStock ? <X className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                          </div>
                        );
                      })}

                      {sortedSellers.length === 0 && (
                        <div className="py-24 text-center bg-secondary/5">
                          <div className="max-w-xs mx-auto">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                            <h3 className="font-bold text-lg mb-1">No listings found</h3>
                            <p className="text-sm text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
                            <Button 
                              variant="link" 
                              className="mt-2 text-accent font-bold"
                              onClick={() => {
                                setFilterCondition("all");
                                setFilterLanguage("all");
                                setFilterLocations([]);
                                setFilterSellerType([]);
                                setFilterMaxPrice(100);
                              }}
                            >
                              Clear all filters
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reprints Dialog */}
        <Dialog open={isReprintsOpen} onOpenChange={setIsReprintsOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Other versions of {card.name}</DialogTitle>
              <DialogDescription>Find the same card in different sets and rarities.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 py-4">
              {isLoadingReprints ? (
                <div className="col-span-full py-10 text-center">
                  <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full mx-auto" />
                </div>
              ) : reprints.map((reprint) => (
                <Link key={reprint.id} href={`/marketplace/card/${reprint.id}`} onClick={() => setIsReprintsOpen(false)}>
                  <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="p-3">
                      <div className="aspect-[3/4] mb-3 bg-muted rounded flex items-center justify-center overflow-hidden">
                        {reprint.images?.small ? (
                          <img src={reprint.images.small} alt={reprint.name} className="h-full w-full object-contain transition-transform group-hover:scale-105" />
                        ) : (
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-medium text-sm truncate">{reprint.set?.name || reprint.set}</p>
                      <p className="text-xs text-muted-foreground">{reprint.number} • {reprint.rarity || 'Common'}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {!isLoadingReprints && reprints.length === 0 && (
                <div className="col-span-full py-10 text-center text-muted-foreground">
                  No other versions found.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
