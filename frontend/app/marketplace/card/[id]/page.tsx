"use client"

import { useState } from "react"
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
} from "@/components/ui/dialog"
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
} from "lucide-react"
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
  const [timeRange, setTimeRange] = useState("3m")
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  const timeRanges: Record<string, { label: string; days: number }> = {
    "1d": { label: "1 Day", days: 1 },
    "1m": { label: "1 Month", days: 30 },
    "3m": { label: "3 Months", days: 90 },
    "6m": { label: "6 Months", days: 180 },
    "1y": { label: "1 Year", days: 365 },
  }

  const priceHistory = generatePriceHistory(timeRanges[timeRange].days)

  // Sort sellers by price ascending
  const sortedSellers = [...sellers].sort((a, b) => a.price - b.price)

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
                <div className="aspect-[2.5/3.5] rounded-lg bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
                  <ImageIcon className="h-20 w-20 text-muted-foreground" />
                </div>
                <div className="mt-4 space-y-2 text-center">
                  <h1 className="font-serif text-2xl font-bold">{cardData.name}</h1>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{cardData.set}</Badge>
                    <Badge variant="outline">{cardData.number}</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>{cardData.rarity}</span>
                    <span>•</span>
                    <span>{cardData.type} Type</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Stats & Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Price Statistics</span>
                  <div className={`flex items-center gap-1 text-lg ${cardData.priceStats.trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {cardData.priceStats.trend >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    {cardData.priceStats.trend >= 0 ? "+" : ""}{cardData.priceStats.trend}%
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Price stats grid */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className="text-xl font-bold">${cardData.priceStats.current.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <p className="text-sm text-muted-foreground">Median</p>
                    <p className="text-xl font-bold">${cardData.priceStats.median.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
                    <p className="text-sm text-emerald-600">All-Time Low</p>
                    <p className="text-xl font-bold text-emerald-600">${cardData.priceStats.min.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 p-3 text-center">
                    <p className="text-sm text-amber-600">All-Time High</p>
                    <p className="text-xl font-bold text-amber-600">${cardData.priceStats.max.toFixed(2)}</p>
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
              <CardTitle className="flex items-center justify-between">
                <span>Available Sellers ({sortedSellers.length})</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Sorted by price: lowest first
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {sortedSellers.map((seller) => {
                  const reputation = getReputationTier(
                    seller.deliveredOrders / seller.totalSales,
                    seller.totalSales
                  )
                  const ReputationIcon = reputation.icon
                  const conditionInfo = getConditionInfo(seller.condition)

                  return (
                    <div
                      key={seller.id}
                      className="flex flex-col gap-4 p-4 transition-colors hover:bg-secondary/30 sm:flex-row sm:items-center"
                    >
                      {/* Reputation */}
                      <div className="flex items-center gap-3 sm:w-48">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`flex items-center gap-1 ${reputation.color}`}>
                              <ReputationIcon className="h-5 w-5" />
                              <span className="w-10 text-sm font-medium tabular-nums">{formatSalesCount(seller.totalSales)}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{reputation.label} Seller</p>
                            <p className="text-xs text-muted-foreground">
                              {seller.deliveredOrders.toLocaleString()}/{seller.totalSales.toLocaleString()} orders delivered ({((seller.deliveredOrders / seller.totalSales) * 100).toFixed(1)}%)
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Flag */}
                        <span className="text-lg">{countryFlags[seller.country] || "🏳️"}</span>

                        {/* Username */}
                        <span className="font-medium">{seller.username}</span>
                      </div>

                      {/* Card attributes */}
                      <div className="flex items-center gap-2">
                        {seller.isFirstEdition && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className="bg-amber-500 text-white hover:bg-amber-600">1st</Badge>
                            </TooltipTrigger>
                            <TooltipContent>First Edition</TooltipContent>
                          </Tooltip>
                        )}
                        {seller.isReverse && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="border-purple-500 text-purple-600">R</Badge>
                            </TooltipTrigger>
                            <TooltipContent>Reverse Holo</TooltipContent>
                          </Tooltip>
                        )}
                        {seller.isSigned && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="border-blue-500 text-blue-600">
                                <Pencil className="mr-1 h-3 w-3" />
                                Signed
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Autographed Card</TooltipContent>
                          </Tooltip>
                        )}

                        {/* Condition */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className={`${conditionInfo.color} min-w-8 justify-center`}>{conditionInfo.abbr}</Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium">{conditionInfo.label}</p>
                            <p className="text-xs text-muted-foreground">{conditionInfo.description}</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Photo button */}
                        {seller.hasPhoto && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Camera className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Seller&apos;s Photo - {seller.username}</DialogTitle>
                              </DialogHeader>
                              <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
                                <div className="text-center">
                                  <Camera className="mx-auto h-16 w-16 text-muted-foreground" />
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    Seller&apos;s actual photo of the card
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Condition: {conditionInfo.label}
                              </p>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>

                      {/* Description */}
                      <p className="flex-1 text-sm text-muted-foreground">
                        {seller.description}
                      </p>

                      {/* Price & Cart */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-bold">${seller.price.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {seller.quantity} available
                          </p>
                        </div>
                        <Button className="gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          <span className="hidden sm:inline">Add to Cart</span>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
