"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  ShoppingBag,
  Tag,
  Heart,
  ShoppingCart,
  Search,
  Filter,
  Plus,
  Trash2,
  Minus,
  X,
  ImageIcon,
  TrendingUp,
  TrendingDown,
  Flame,
  Star,
  Sparkles,
  BarChart3,
  Package,
  FolderPlus,
  FileText,
  Layers,
  Library,
  ChevronRight,
  Check,
  Edit3,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const buyListings = [
  { id: 1, name: "Charizard ex", set: "Obsidian Flames", number: "125/197", condition: "Near Mint", language: "English", price: 45.99, seller: "CardMaster" },
  { id: 2, name: "Pikachu VMAX", set: "Vivid Voltage", number: "044/185", condition: "Mint", language: "Japanese", price: 32.50, seller: "PKMNTrader" },
  { id: 3, name: "Mewtwo V", set: "Pokemon GO", number: "030/078", condition: "Lightly Played", language: "English", price: 12.99, seller: "CollectorJoe" },
  { id: 4, name: "Gardevoir ex", set: "Paldea Evolved", number: "086/193", condition: "Near Mint", language: "English", price: 28.00, seller: "CardMaster" },
  { id: 5, name: "Umbreon VMAX", set: "Evolving Skies", number: "095/203", condition: "Mint", language: "English", price: 125.00, seller: "RareFinds" },
]

// Sample user decks (would come from gameplay section)
const userDecks = [
  { id: 1, name: "Charizard Control", cards: [
    { id: 101, name: "Charizard ex", set: "Obsidian Flames", number: "125/197" },
    { id: 102, name: "Charmander", set: "Obsidian Flames", number: "026/197" },
    { id: 103, name: "Charmeleon", set: "Obsidian Flames", number: "027/197" },
    { id: 104, name: "Rare Candy", set: "Scarlet & Violet", number: "191/198" },
    { id: 105, name: "Professor's Research", set: "Scarlet & Violet", number: "189/198" },
  ]},
  { id: 2, name: "Lugia VSTAR", cards: [
    { id: 201, name: "Lugia VSTAR", set: "Silver Tempest", number: "139/195" },
    { id: 202, name: "Lugia V", set: "Silver Tempest", number: "138/195" },
    { id: 203, name: "Archeops", set: "Silver Tempest", number: "147/195" },
  ]},
  { id: 3, name: "Miraidon Aggro", cards: [
    { id: 301, name: "Miraidon ex", set: "Scarlet & Violet", number: "081/198" },
    { id: 302, name: "Raikou V", set: "Brilliant Stars", number: "048/172" },
    { id: 303, name: "Electric Generator", set: "Scarlet & Violet", number: "170/198" },
  ]},
]

// Sample user collections with missing cards
const userCollections = [
  { id: 1, name: "Obsidian Flames", total: 197, owned: 145, missing: [
    { id: 1001, name: "Charizard ex SAR", number: "223/197" },
    { id: 1002, name: "Tyranitar ex", number: "134/197" },
    { id: 1003, name: "Dragonite ex", number: "131/197" },
    { id: 1004, name: "Vespiquen ex", number: "088/197" },
  ]},
  { id: 2, name: "Paldea Evolved", total: 193, owned: 89, missing: [
    { id: 2001, name: "Iono SAR", number: "269/193" },
    { id: 2002, name: "Mew ex", number: "232/193" },
    { id: 2003, name: "Armarouge ex", number: "041/193" },
  ]},
  { id: 3, name: "Evolving Skies", total: 203, owned: 178, missing: [
    { id: 3001, name: "Umbreon VMAX Alt", number: "215/203" },
    { id: 3002, name: "Rayquaza VMAX Alt", number: "218/203" },
    { id: 3003, name: "Sylveon VMAX Alt", number: "212/203" },
  ]},
]

// WantsLists - personalized lists
type WantsListType = "empty" | "deck" | "collection"
type WantsListItem = {
  id: number
  name: string
  set: string
  number: string
  condition: string
  priority: "High" | "Medium" | "Low"
  owned: boolean
}
type WantsList = {
  id: number
  name: string
  type: WantsListType
  sourceId?: number
  sourceName?: string
  items: WantsListItem[]
  createdAt: string
}

const initialWantsLists: WantsList[] = [
  {
    id: 1,
    name: "Priority Cards",
    type: "empty",
    items: [
      { id: 1, name: "Mew VMAX", set: "Fusion Strike", number: "114/264", condition: "Near Mint+", priority: "High", owned: false },
      { id: 2, name: "Rayquaza VMAX", set: "Evolving Skies", number: "111/203", condition: "Any", priority: "Medium", owned: false },
    ],
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Charizard Control Deck",
    type: "deck",
    sourceId: 1,
    sourceName: "Charizard Control",
    items: [
      { id: 101, name: "Charizard ex", set: "Obsidian Flames", number: "125/197", condition: "Near Mint", priority: "High", owned: false },
      { id: 102, name: "Charmander", set: "Obsidian Flames", number: "026/197", condition: "Any", priority: "Low", owned: true },
      { id: 103, name: "Charmeleon", set: "Obsidian Flames", number: "027/197", condition: "Any", priority: "Low", owned: true },
      { id: 104, name: "Rare Candy", set: "Scarlet & Violet", number: "191/198", condition: "Any", priority: "Medium", owned: false },
      { id: 105, name: "Professor's Research", set: "Scarlet & Violet", number: "189/198", condition: "Any", priority: "Low", owned: true },
    ],
    createdAt: "2024-02-10",
  },
  {
    id: 3,
    name: "Complete Evolving Skies",
    type: "collection",
    sourceId: 3,
    sourceName: "Evolving Skies",
    items: [
      { id: 3001, name: "Umbreon VMAX Alt", set: "Evolving Skies", number: "215/203", condition: "Near Mint", priority: "High", owned: false },
      { id: 3002, name: "Rayquaza VMAX Alt", set: "Evolving Skies", number: "218/203", condition: "Near Mint", priority: "High", owned: false },
      { id: 3003, name: "Sylveon VMAX Alt", set: "Evolving Skies", number: "212/203", condition: "Near Mint", priority: "Medium", owned: false },
    ],
    createdAt: "2024-03-01",
  },
]

const cartItems = [
  { id: 1, name: "Charizard ex", set: "Obsidian Flames", condition: "Near Mint", price: 45.99, quantity: 1, seller: "CardMaster" },
  { id: 2, name: "Pikachu VMAX", set: "Vivid Voltage", condition: "Mint", price: 32.50, quantity: 2, seller: "PKMNTrader" },
]

const yourListings = [
  { id: 1, name: "Blastoise ex", set: "Paldea Evolved", condition: "Near Mint", price: 18.50, views: 45, status: "Active" },
  { id: 2, name: "Venusaur ex", set: "Paldea Evolved", condition: "Lightly Played", price: 12.00, views: 23, status: "Active" },
  { id: 3, name: "Eevee VMAX", set: "Evolving Skies", condition: "Mint", price: 8.99, views: 67, status: "Sold" },
]

const mostPurchasedSets = [
  { id: 1, name: "Surging Sparks", series: "Scarlet & Violet", sales: 12450, image: null },
  { id: 2, name: "Prismatic Evolutions", series: "Scarlet & Violet", sales: 10230, image: null },
  { id: 3, name: "Twilight Masquerade", series: "Scarlet & Violet", sales: 8920, image: null },
  { id: 4, name: "Obsidian Flames", series: "Scarlet & Violet", sales: 7650, image: null },
]

const mostPurchasedCards = [
  { id: 1, name: "Charizard ex", set: "Obsidian Flames", number: "125/197", sales: 3420, price: 89.99 },
  { id: 2, name: "Pikachu ex", set: "Surging Sparks", number: "057/191", sales: 2890, price: 45.00 },
  { id: 3, name: "Umbreon VMAX", set: "Evolving Skies", number: "215/203", sales: 2340, price: 285.00 },
  { id: 4, name: "Mew ex", set: "Paldea Evolved", number: "232/193", sales: 2100, price: 52.00 },
]

const mostPurchasedProducts = [
  { id: 1, name: "Surging Sparks Booster Box", type: "Booster Box", sales: 5600, price: 144.99 },
  { id: 2, name: "Prismatic Evolutions ETB", type: "Elite Trainer Box", sales: 4320, price: 59.99 },
  { id: 3, name: "UPC Charizard", type: "Premium Collection", sales: 2100, price: 399.99 },
]

const risingPriceCards = [
  { id: 1, name: "Moonbreon", set: "Evolving Skies", number: "215/203", price: 325.00, change: 18.5 },
  { id: 2, name: "Pikachu VMAX", set: "Vivid Voltage", number: "188/185", price: 420.00, change: 12.3 },
  { id: 3, name: "Charizard VSTAR", set: "Brilliant Stars", number: "174/172", price: 185.00, change: 9.8 },
]

const fallingPriceCards = [
  { id: 1, name: "Gardevoir ex", set: "Paldea Evolved", number: "086/193", price: 22.00, change: -15.2 },
  { id: 2, name: "Miraidon ex", set: "Scarlet & Violet", number: "081/198", price: 18.50, change: -12.8 },
  { id: 3, name: "Koraidon ex", set: "Scarlet & Violet", number: "125/198", price: 15.00, change: -10.5 },
]

const allTimeHighCards = [
  { id: 1, name: "Illustrator Pikachu", set: "Promo", price: 5900000.00, note: "World Record" },
  { id: 2, name: "1st Ed Charizard", set: "Base Set", price: 420000.00, note: "PSA 10" },
  { id: 3, name: "Pikachu Trophy", set: "World Championship", price: 300000.00, note: "Gold" },
]

const allTimeLowCards = [
  { id: 1, name: "Iono", set: "Paldea Evolved", number: "185/193", price: 8.50, prevHigh: 45.00 },
  { id: 2, name: "Professor's Research", set: "Scarlet & Violet", number: "189/198", price: 2.00, prevHigh: 12.00 },
  { id: 3, name: "Boss's Orders", set: "Rebel Clash", number: "154/192", price: 3.50, prevHigh: 18.00 },
]

const marketNews = [
  { id: 1, title: "Prismatic Evolutions demand exceeds supply", time: "2 hours ago", category: "Hot" },
  { id: 2, title: "Japanese 151 prices stabilizing after reprint", time: "5 hours ago", category: "Trend" },
  { id: 3, title: "New set Journey Together officially announced", time: "1 day ago", category: "News" },
  { id: 4, title: "Vintage market sees 15% increase in Q1", time: "2 days ago", category: "Analysis" },
]

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState("buy")
  const [searchQuery, setSearchQuery] = useState("")
  const [wantsLists, setWantsLists] = useState<WantsList[]>(initialWantsLists)
  const [selectedList, setSelectedList] = useState<WantsList | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [newListType, setNewListType] = useState<WantsListType>("empty")
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null)

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Mint": return "bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
      case "Near Mint": return "bg-sky-500/20 text-sky-700 border-sky-500/30"
      case "Lightly Played": return "bg-amber-500/20 text-amber-700 border-amber-500/30"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-500/20 text-red-700 border-red-500/30"
      case "Medium": return "bg-amber-500/20 text-amber-700 border-amber-500/30"
      case "Low": return "bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const getListTypeIcon = (type: WantsListType) => {
    switch (type) {
      case "deck": return <Layers className="h-4 w-4" />
      case "collection": return <Library className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getListTypeLabel = (type: WantsListType) => {
    switch (type) {
      case "deck": return "Deck"
      case "collection": return "Collection"
      default: return "Custom"
    }
  }

  const handleCreateList = () => {
    if (!newListName.trim()) return

    let items: WantsListItem[] = []
    let sourceName: string | undefined

    if (newListType === "deck" && selectedSourceId) {
      const deck = userDecks.find(d => d.id === selectedSourceId)
      if (deck) {
        sourceName = deck.name
        items = deck.cards.map(card => ({
          id: card.id,
          name: card.name,
          set: card.set,
          number: card.number,
          condition: "Any",
          priority: "Medium" as const,
          owned: false,
        }))
      }
    } else if (newListType === "collection" && selectedSourceId) {
      const collection = userCollections.find(c => c.id === selectedSourceId)
      if (collection) {
        sourceName = collection.name
        items = collection.missing.map(card => ({
          id: card.id,
          name: card.name,
          set: collection.name,
          number: card.number,
          condition: "Near Mint",
          priority: "Medium" as const,
          owned: false,
        }))
      }
    }

    const newList: WantsList = {
      id: Date.now(),
      name: newListName,
      type: newListType,
      sourceId: selectedSourceId || undefined,
      sourceName,
      items,
      createdAt: new Date().toISOString().split('T')[0],
    }

    setWantsLists([...wantsLists, newList])
    setNewListName("")
    setNewListType("empty")
    setSelectedSourceId(null)
    setIsCreateDialogOpen(false)
  }

  const handleDeleteList = (listId: number) => {
    setWantsLists(wantsLists.filter(list => list.id !== listId))
    if (selectedList?.id === listId) {
      setSelectedList(null)
    }
  }

  const handleToggleOwned = (listId: number, itemId: number) => {
    setWantsLists(wantsLists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map(item =>
            item.id === itemId ? { ...item, owned: !item.owned } : item
          ),
        }
      }
      return list
    }))
    // Update selected list if it's the one being modified
    if (selectedList?.id === listId) {
      setSelectedList(prev => prev ? {
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? { ...item, owned: !item.owned } : item
        ),
      } : null)
    }
  }

  const handleRemoveFromList = (listId: number, itemId: number) => {
    setWantsLists(wantsLists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.filter(item => item.id !== itemId),
        }
      }
      return list
    }))
    if (selectedList?.id === listId) {
      setSelectedList(prev => prev ? {
        ...prev,
        items: prev.items.filter(item => item.id !== itemId),
      } : null)
    }
  }

  const getMissingCount = (list: WantsList) => list.items.filter(item => !item.owned).length
  const getOwnedCount = (list: WantsList) => list.items.filter(item => item.owned).length

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="mx-auto max-w-[1700px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">
              Marketplace
            </h1>
            <p className="mt-2 text-muted-foreground">
              Buy, sell, and trade Pokémon cards with collectors worldwide
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 grid w-full max-w-lg grid-cols-4">
              <TabsTrigger value="buy" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Buy</span>
              </TabsTrigger>
              <TabsTrigger value="sell" className="gap-2">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Sell</span>
              </TabsTrigger>
              <TabsTrigger value="wants" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Wants</span>
              </TabsTrigger>
              <TabsTrigger value="cart" className="gap-2 relative">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartItems.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-accent-foreground">
                    {cartItems.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Buy Tab */}
            <TabsContent value="buy" className="space-y-8">
              {/* Search and Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Search Marketplace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search cards, sets, products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Select>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Set" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sets</SelectItem>
                          <SelectItem value="obsidian">Obsidian Flames</SelectItem>
                          <SelectItem value="paldea">Paldea Evolved</SelectItem>
                          <SelectItem value="evolving">Evolving Skies</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Conditions</SelectItem>
                          <SelectItem value="mint">Mint</SelectItem>
                          <SelectItem value="nm">Near Mint</SelectItem>
                          <SelectItem value="lp">Lightly Played</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Languages</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="jp">Japanese</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Most Purchased Sets */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold">
                    <Flame className="h-6 w-6 text-orange-500" />
                    Most Purchased Sets
                  </h2>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {mostPurchasedSets.map((set, index) => (
                    <Card key={set.id} className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                      <CardContent className="p-4">
                        <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-gradient-to-br from-muted to-secondary">
                          <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium group-hover:text-accent">{set.name}</h3>
                            <p className="text-sm text-muted-foreground">{set.series}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">#{index + 1}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {set.sales.toLocaleString()} sold
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Most Purchased Cards */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold">
                    <Star className="h-6 w-6 text-yellow-500" />
                    Most Purchased Cards
                  </h2>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {mostPurchasedCards.map((card, index) => (
                    <Link key={card.id} href={`/marketplace/card/${card.id}`}>
                      <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                        <CardContent className="p-4">
                          <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-muted to-secondary">
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                          </div>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium group-hover:text-accent">{card.name}</h3>
                              <p className="text-sm text-muted-foreground">{card.set}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs">#{index + 1}</Badge>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="font-semibold">${card.price.toFixed(2)}</span>
                            <span className="text-sm text-muted-foreground">{card.sales.toLocaleString()} sold</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Most Purchased Products */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold">
                    <Package className="h-6 w-6 text-blue-500" />
                    Most Purchased Products
                  </h2>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {mostPurchasedProducts.map((product, index) => (
                    <Card key={product.id} className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                      <CardContent className="p-4">
                        <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-gradient-to-br from-muted to-secondary">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium group-hover:text-accent">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.type}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">#{index + 1}</Badge>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-semibold">${product.price.toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground">{product.sales.toLocaleString()} sold</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Price Movement Section */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Rising Prices */}
                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                    <h2 className="font-serif text-2xl font-semibold">Rising Prices</h2>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border">
                        {risingPriceCards.map((card) => (
                          <Link key={card.id} href={`/marketplace/card/${card.id}`}>
                            <div className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50 cursor-pointer">
                              <div className="flex h-14 w-10 items-center justify-center rounded bg-muted">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{card.name}</h4>
                                <p className="text-sm text-muted-foreground">{card.set}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">${card.price.toFixed(2)}</p>
                                <p className="flex items-center justify-end gap-1 text-sm text-emerald-600">
                                  <TrendingUp className="h-3 w-3" />
                                  +{card.change}%
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Falling Prices */}
                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingDown className="h-6 w-6 text-red-500" />
                    <h2 className="font-serif text-2xl font-semibold">Falling Prices</h2>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border">
                        {fallingPriceCards.map((card) => (
                          <Link key={card.id} href={`/marketplace/card/${card.id}`}>
                            <div className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50 cursor-pointer">
                              <div className="flex h-14 w-10 items-center justify-center rounded bg-muted">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{card.name}</h4>
                                <p className="text-sm text-muted-foreground">{card.set}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">${card.price.toFixed(2)}</p>
                                <p className="flex items-center justify-end gap-1 text-sm text-red-600">
                                  <TrendingDown className="h-3 w-3" />
                                  {card.change}%
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </div>

              {/* All-Time Price Records */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* All-Time High */}
                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-amber-500" />
                    <h2 className="font-serif text-2xl font-semibold">All-Time High Prices</h2>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border">
                        {allTimeHighCards.map((card) => (
                          <div key={card.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50">
                            <div className="flex h-14 w-10 items-center justify-center rounded bg-gradient-to-br from-amber-100 to-amber-200">
                              <Star className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{card.name}</h4>
                              <p className="text-sm text-muted-foreground">{card.set}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${card.price.toLocaleString()}</p>
                              <Badge variant="outline" className="text-xs">{card.note}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* All-Time Low */}
                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-blue-500" />
                    <h2 className="font-serif text-2xl font-semibold">All-Time Low Prices</h2>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border">
                        {allTimeLowCards.map((card) => (
                          <div key={card.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50">
                            <div className="flex h-14 w-10 items-center justify-center rounded bg-muted">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{card.name}</h4>
                              <p className="text-sm text-muted-foreground">{card.set}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-emerald-600">${card.price.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground line-through">${card.prevHigh.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </div>

              {/* Market News & Trends */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold">
                    <BarChart3 className="h-6 w-6 text-foreground" />
                    Market News & Trends
                  </h2>
                  <Button variant="ghost" size="sm">View All News</Button>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {marketNews.map((news) => (
                        <div key={news.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50 cursor-pointer">
                          <Badge 
                            variant="outline" 
                            className={
                              news.category === "Hot" ? "border-orange-500 text-orange-600" :
                              news.category === "Trend" ? "border-blue-500 text-blue-600" :
                              news.category === "News" ? "border-emerald-500 text-emerald-600" :
                              "border-muted-foreground text-muted-foreground"
                            }
                          >
                            {news.category}
                          </Badge>
                          <div className="flex-1">
                            <h4 className="font-medium">{news.title}</h4>
                          </div>
                          <span className="text-sm text-muted-foreground">{news.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Recent Listings */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold">
                    <ShoppingBag className="h-6 w-6" />
                    Recent Listings
                  </h2>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {buyListings.map((listing) => (
                        <div
                          key={listing.id}
                          className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
                        >
                          <div className="flex h-16 w-12 items-center justify-center rounded bg-muted">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{listing.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {listing.number}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <span>{listing.set}</span>
                              <Badge className={getConditionColor(listing.condition)}>
                                {listing.condition}
                              </Badge>
                              <span>{listing.language}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Seller: {listing.seller}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                            <span className="text-lg font-bold">${listing.price.toFixed(2)}</span>
                            <Button size="sm" className="gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              <span className="hidden sm:inline">Add to Cart</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>

            {/* Sell Tab */}
            <TabsContent value="sell">
              <div className="space-y-6">
                {/* Create Listing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Create New Listing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Card Name</label>
                        <Input placeholder="e.g., Charizard ex" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Set</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select set" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="obsidian">Obsidian Flames</SelectItem>
                            <SelectItem value="paldea">Paldea Evolved</SelectItem>
                            <SelectItem value="evolving">Evolving Skies</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Condition</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mint">Mint</SelectItem>
                            <SelectItem value="nm">Near Mint</SelectItem>
                            <SelectItem value="lp">Lightly Played</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Price ($)</label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button className="gap-2">
                        <Tag className="h-4 w-4" />
                        Create Listing
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Your Listings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Your Listings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {yourListings.map((listing) => (
                        <div
                          key={listing.id}
                          className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
                        >
                          <div className="flex h-16 w-12 items-center justify-center rounded bg-muted">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <h4 className="font-medium">{listing.name}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{listing.set}</span>
                              <Badge className={getConditionColor(listing.condition)}>
                                {listing.condition}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {listing.views} views
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={listing.status === "Sold" ? "secondary" : "default"}>
                              {listing.status}
                            </Badge>
                            <span className="text-lg font-bold">${listing.price.toFixed(2)}</span>
                            {listing.status !== "Sold" && (
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Wants List Tab */}
            <TabsContent value="wants">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Lists Sidebar */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Heart className="h-5 w-5" />
                        Your Lists
                      </CardTitle>
                      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gap-2">
                            <FolderPlus className="h-4 w-4" />
                            New List
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Wants List</DialogTitle>
                            <DialogDescription>
                              Choose how you want to create your list. You can start empty, import from a deck, or complete a collection.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">List Name</label>
                              <Input
                                placeholder="e.g., Tournament Deck, Missing Cards..."
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">List Type</label>
                              <div className="grid grid-cols-3 gap-2">
                                <Button
                                  variant={newListType === "empty" ? "default" : "outline"}
                                  className="flex flex-col gap-1 h-auto py-3"
                                  onClick={() => {
                                    setNewListType("empty")
                                    setSelectedSourceId(null)
                                  }}
                                >
                                  <FileText className="h-5 w-5" />
                                  <span className="text-xs">Empty</span>
                                </Button>
                                <Button
                                  variant={newListType === "deck" ? "default" : "outline"}
                                  className="flex flex-col gap-1 h-auto py-3"
                                  onClick={() => {
                                    setNewListType("deck")
                                    setSelectedSourceId(null)
                                  }}
                                >
                                  <Layers className="h-5 w-5" />
                                  <span className="text-xs">From Deck</span>
                                </Button>
                                <Button
                                  variant={newListType === "collection" ? "default" : "outline"}
                                  className="flex flex-col gap-1 h-auto py-3"
                                  onClick={() => {
                                    setNewListType("collection")
                                    setSelectedSourceId(null)
                                  }}
                                >
                                  <Library className="h-5 w-5" />
                                  <span className="text-xs">Collection</span>
                                </Button>
                              </div>
                            </div>

                            {newListType === "deck" && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Select Deck</label>
                                <Select onValueChange={(val) => setSelectedSourceId(Number(val))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a deck..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {userDecks.map(deck => (
                                      <SelectItem key={deck.id} value={deck.id.toString()}>
                                        {deck.name} ({deck.cards.length} cards)
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                  All cards from this deck will be added to your wants list
                                </p>
                              </div>
                            )}

                            {newListType === "collection" && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Select Collection</label>
                                <Select onValueChange={(val) => setSelectedSourceId(Number(val))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a collection..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {userCollections.map(col => (
                                      <SelectItem key={col.id} value={col.id.toString()}>
                                        {col.name} ({col.missing.length} missing)
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                  Only missing cards from this collection will be added
                                </p>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCreateList}
                              disabled={!newListName.trim() || (newListType !== "empty" && !selectedSourceId)}
                            >
                              Create List
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent className="p-0">
                      {wantsLists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                          <Heart className="mb-3 h-10 w-10 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Create your first wants list to start tracking cards
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {wantsLists.map((list) => (
                            <div
                              key={list.id}
                              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-secondary/50 ${
                                selectedList?.id === list.id ? "bg-secondary" : ""
                              }`}
                              onClick={() => setSelectedList(list)}
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                {getListTypeIcon(list.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{list.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="text-[10px] px-1.5">
                                    {getListTypeLabel(list.type)}
                                  </Badge>
                                  {list.sourceName && (
                                    <span className="truncate">{list.sourceName}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <p className="text-sm font-medium">{getMissingCount(list)}</p>
                                  <p className="text-[10px] text-muted-foreground">needed</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* List Details */}
                <div className="lg:col-span-2">
                  {selectedList ? (
                    <Card>
                      <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {getListTypeIcon(selectedList.type)}
                            <CardTitle>{selectedList.name}</CardTitle>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                            <Badge variant="outline">{getListTypeLabel(selectedList.type)}</Badge>
                            {selectedList.sourceName && (
                              <span>Source: {selectedList.sourceName}</span>
                            )}
                            <span>{selectedList.items.length} cards</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedList.type === "empty" && (
                            <Button variant="outline" size="sm" className="gap-2">
                              <Plus className="h-4 w-4" />
                              Add Card
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Edit3 className="h-4 w-4" />
                                Rename List
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Search All in Marketplace
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 text-destructive"
                                onClick={() => handleDeleteList(selectedList.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete List
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Progress bar for collection type */}
                        {selectedList.type === "collection" && (
                          <div className="mb-6 p-4 rounded-lg bg-secondary/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Collection Progress</span>
                              <span className="text-sm text-muted-foreground">
                                {getOwnedCount(selectedList)} / {selectedList.items.length} cards obtained
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-accent transition-all"
                                style={{ width: `${(getOwnedCount(selectedList) / selectedList.items.length) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Filter tabs */}
                        <div className="mb-4 flex items-center gap-2">
                          <Button variant="secondary" size="sm">All ({selectedList.items.length})</Button>
                          <Button variant="ghost" size="sm">Needed ({getMissingCount(selectedList)})</Button>
                          <Button variant="ghost" size="sm">Owned ({getOwnedCount(selectedList)})</Button>
                        </div>

                        {/* Cards list */}
                        {selectedList.items.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-medium">No cards in this list</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Add cards to start tracking what you need
                            </p>
                            <Button className="mt-4 gap-2">
                              <Plus className="h-4 w-4" />
                              Add Card
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {selectedList.items.map((item) => (
                              <div
                                key={item.id}
                                className={`flex items-center gap-4 rounded-lg border p-3 transition-colors ${
                                  item.owned
                                    ? "border-emerald-500/30 bg-emerald-500/5"
                                    : "border-border bg-card hover:bg-secondary/50"
                                }`}
                              >
                                <button
                                  onClick={() => handleToggleOwned(selectedList.id, item.id)}
                                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                                    item.owned
                                      ? "border-emerald-500 bg-emerald-500 text-white"
                                      : "border-muted-foreground/30 hover:border-muted-foreground"
                                  }`}
                                >
                                  {item.owned && <Check className="h-4 w-4" />}
                                </button>
                                <div className="flex h-12 w-9 items-center justify-center rounded bg-muted">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className={`font-medium text-sm ${item.owned ? "line-through text-muted-foreground" : ""}`}>
                                      {item.name}
                                    </h4>
                                    <Badge variant="outline" className="text-[10px]">
                                      {item.number}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{item.set}</span>
                                    <span>|</span>
                                    <span>{item.condition}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={getPriorityColor(item.priority)}>
                                    {item.priority}
                                  </Badge>
                                  {!item.owned && (
                                    <Button variant="outline" size="sm" className="gap-1 text-xs">
                                      <Search className="h-3 w-3" />
                                      Find
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemoveFromList(selectedList.id, item.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Heart className="mb-4 h-16 w-16 text-muted-foreground/50" />
                        <h3 className="text-xl font-medium">Select a list to view</h3>
                        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                          Choose a wants list from the sidebar or create a new one to start tracking the cards you need
                        </p>
                        <Button
                          className="mt-6 gap-2"
                          onClick={() => setIsCreateDialogOpen(true)}
                        >
                          <FolderPlus className="h-4 w-4" />
                          Create New List
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Cart Tab */}
            <TabsContent value="cart">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Shopping Cart ({cartItems.length} items)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
                          <h3 className="text-lg font-medium">Your cart is empty</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Browse the marketplace to find cards to add
                          </p>
                          <Button className="mt-4" onClick={() => setActiveTab("buy")}>
                            Start Shopping
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {cartItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
                            >
                              <div className="flex h-16 w-12 items-center justify-center rounded bg-muted">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <h4 className="font-medium">{item.name}</h4>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <span>{item.set}</span>
                                  <Badge className={getConditionColor(item.condition)}>
                                    {item.condition}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Seller: {item.seller}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <span className="w-20 text-right font-bold">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>Calculated at checkout</span>
                      </div>
                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>${cartTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      <Button className="w-full" size="lg" disabled={cartItems.length === 0}>
                        Proceed to Checkout
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
