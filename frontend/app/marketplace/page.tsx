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
import { useAuth } from "@/context/auth-context"

const buyListings = [
  { id: 1, name: "Charizard ex", set: "Obsidian Flames", number: "125/197", condition: "Near Mint", language: "English", price: 45.99, seller: "CardMaster" },
  { id: 2, name: "Pikachu VMAX", set: "Vivid Voltage", number: "044/185", condition: "Mint", language: "Japanese", price: 32.50, seller: "PKMNTrader" },
  { id: 3, name: "Mewtwo V", set: "Pokemon GO", number: "030/078", condition: "Lightly Played", language: "English", price: 12.99, seller: "CollectorJoe" },
  { id: 4, name: "Gardevoir ex", set: "Paldea Evolved", number: "086/193", condition: "Near Mint", language: "English", price: 28.00, seller: "CardMaster" },
  { id: 5, name: "Umbreon VMAX", set: "Evolving Skies", number: "095/203", condition: "Mint", language: "English", price: 125.00, seller: "RareFinds" },
]

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
  const { user } = useAuth()

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
            <TabsList className={`mb-8 grid w-full max-w-lg ${user ? 'grid-cols-4' : 'grid-cols-1'}`}>
              <TabsTrigger value="buy" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Buy</span>
              </TabsTrigger>
              {user && (
                <>
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
                </>
              )}
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

            {user ? (
              <>
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
                                  Create a list of cards you're looking for to track their prices and availability.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">List Name</label>
                                  <Input
                                    placeholder="e.g., My Dream Team"
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Populate from...</label>
                                  <Select
                                    value={newListType}
                                    onValueChange={(value: WantsListType) => {
                                      setNewListType(value)
                                      setSelectedSourceId(null)
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Start from..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="empty">Empty List</SelectItem>
                                      <SelectItem value="deck">A Mazo</SelectItem>
                                      <SelectItem value="collection">A Collection Set</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                {newListType === "deck" && (
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Select Deck</label>
                                    <Select
                                      onValueChange={(value) => setSelectedSourceId(parseInt(value))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a deck..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {userDecks.map(deck => (
                                          <SelectItem key={deck.id} value={deck.id.toString()}>
                                            {deck.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                                {newListType === "collection" && (
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Select Collection</label>
                                    <Select
                                      onValueChange={(value) => setSelectedSourceId(parseInt(value))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a set..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {userCollections.map(set => (
                                          <SelectItem key={set.id} value={set.id.toString()}>
                                            {set.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateList}>Create List</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y divide-border">
                            {wantsLists.map((list) => (
                              <button
                                key={list.id}
                                onClick={() => setSelectedList(list)}
                                className={`flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/50 ${selectedList?.id === list.id ? 'bg-secondary' : ''}`}
                              >
                                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                                  {getListTypeIcon(list.type)}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{list.name}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {getMissingCount(list)} remaining · {list.items.length} total
                                  </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* List Details */}
                    <div className="lg:col-span-2">
                      {selectedList ? (
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {selectedList.name}
                                <Badge variant="outline" className="ml-2 font-normal">
                                  {getListTypeLabel(selectedList.type)}
                                </Badge>
                              </CardTitle>
                              {selectedList.sourceName && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Source: {selectedList.sourceName}
                                </p>
                              )}
                            </div>
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
                                  <ShoppingCart className="h-4 w-4" />
                                  Buy All Missing
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
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {selectedList.items.length > 0 ? (
                                selectedList.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className={`flex items-center gap-4 rounded-lg border p-4 transition-all ${item.owned ? 'bg-muted/50 opacity-60' : 'bg-card'}`}
                                  >
                                    <button
                                      onClick={() => handleToggleOwned(selectedList.id, item.id)}
                                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${item.owned ? 'border-accent bg-accent text-accent-foreground' : 'border-muted-foreground/30 hover:border-accent'}`}
                                    >
                                      {item.owned && <Check className="h-3 w-3" />}
                                    </button>
                                    <div className="flex h-14 w-10 items-center justify-center rounded bg-muted">
                                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className={`font-medium ${item.owned ? 'line-through' : ''}`}>{item.name}</h4>
                                        <Badge variant="outline" className="text-[10px]">{item.number}</Badge>
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                        <span>{item.set}</span>
                                        <Badge className={`text-[10px] h-4 ${getPriorityColor(item.priority)}`}>
                                          {item.priority}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <ShoppingCart className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => handleRemoveFromList(selectedList.id, item.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="py-12 text-center text-muted-foreground">
                                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                  <p>No cards in this list yet.</p>
                                  <Button variant="link">Search for cards to add</Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="h-full flex flex-col items-center justify-center py-20 text-center border-dashed">
                          <Heart className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                          <h3 className="text-xl font-bold">Select a Wants List</h3>
                          <p className="text-muted-foreground max-w-xs mt-2">
                            Choose a list from the sidebar to view your desired cards and track your progress.
                          </p>
                        </Card>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Cart Tab */}
                <TabsContent value="cart">
                  <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Your Shopping Cart ({cartItems.length} items)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="divide-y divide-border">
                            {cartItems.map((item) => (
                              <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                <div className="flex h-24 w-16 items-center justify-center rounded bg-muted">
                                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="flex flex-1 flex-col justify-between">
                                  <div className="flex justify-between">
                                    <div>
                                      <h4 className="font-medium">{item.name}</h4>
                                      <p className="text-sm text-muted-foreground">{item.set}</p>
                                      <div className="mt-1 flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          {item.condition}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">Seller: {item.seller}</span>
                                      </div>
                                    </div>
                                    <span className="font-bold">${item.price.toFixed(2)}</span>
                                  </div>
                                  <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2 rounded-md border border-border px-2 py-1">
                                      <button className="text-muted-foreground hover:text-foreground">
                                        <Minus className="h-4 w-4" />
                                      </button>
                                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                                      <button className="text-muted-foreground hover:text-foreground">
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-destructive gap-2">
                                      <Trash2 className="h-4 w-4" />
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="lg:col-span-1">
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
                            <span>$4.99</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span>${(cartTotal * 0.08).toFixed(2)}</span>
                          </div>
                          <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${(cartTotal + 4.99 + cartTotal * 0.08).toFixed(2)}</span>
                          </div>
                          <Button className="w-full mt-4" size="lg">
                            Checkout
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </>
            ) : (
              <>
                <TabsContent value="sell">
                  <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
                    <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold">Inicia sesión para vender</h3>
                    <p className="text-muted-foreground mb-6">Debes estar conectado para crear anuncios y gestionar tus ventas.</p>
                    <Button onClick={() => setActiveTab("buy")}>Ir a Comprar</Button>
                  </div>
                </TabsContent>
                <TabsContent value="wants">
                  <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold">Inicia sesión para ver tu lista de deseos</h3>
                    <p className="text-muted-foreground mb-6">Guarda las cartas que quieres para seguir su precio y disponibilidad.</p>
                    <Button onClick={() => setActiveTab("buy")}>Explorar Cartas</Button>
                  </div>
                </TabsContent>
                <TabsContent value="cart">
                  <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold">Tu carrito está esperando</h3>
                    <p className="text-muted-foreground mb-6">Inicia sesión para añadir cartas a tu carrito y completar tu pedido.</p>
                    <Button onClick={() => setActiveTab("buy")}>Empezar a Comprar</Button>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
