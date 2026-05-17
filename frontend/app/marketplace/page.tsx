"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  Wallet,
  CreditCard,
  History,
  Clock,
  Camera,
  Loader2,
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
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/auth-context"
import { useMarketplace } from "@/context/marketplace-context"

type WantsListType = "empty" | "deck" | "collection"
type WantsListItem = {
  id: string | number
  name: string
  set: string
  number: string
  count: number
  condition: string
  owned: boolean
  imageUrl?: string
}
export interface WantsList {
  id: string
  name: string
  type: "deck" | "collection" | "empty"
  sourceId?: string
  sourceName?: string
  language?: string
  items: WantsListItem[]
  createdAt: string
}

const shippingPrices: Record<string, { name: string, min: number, max: number, flag: string }> = {
  ES: { name: "España", min: 1.33, max: 8.00, flag: "🇪🇸" },
  DE: { name: "Alemania", min: 1.55, max: 1.55, flag: "🇩🇪" },
  LU: { name: "Luxemburgo", min: 2.00, max: 7.70, flag: "🇱🇺" },
  CZ: { name: "Rep. Checa", min: 2.28, max: 5.49, flag: "🇨🇿" },
  NL: { name: "Países Bajos", min: 2.30, max: 10.85, flag: "🇳🇱" },
  FR: { name: "Francia", min: 2.40, max: 7.80, flag: "🇫🇷" },
  BG: { name: "Bulgaria", min: 2.40, max: 6.23, flag: "🇧🇬" },
  HR: { name: "Croacia", min: 2.50, max: 5.90, flag: "🇭🇷" },
  MT: { name: "Malta", min: 2.51, max: 10.79, flag: "🇲🇹" },
  PL: { name: "Polonia", min: 2.65, max: 5.66, flag: "🇵🇱" },
  SK: { name: "Eslovaquia", min: 2.70, max: 8.20, flag: "🇸🇰" },
  LV: { name: "Letonia", min: 2.84, max: 6.10, flag: "🇱🇻" },
  PT: { name: "Portugal", min: 2.85, max: 7.27, flag: "🇵🇹" },
  IE: { name: "Irlanda", min: 2.95, max: 11.70, flag: "🇮🇪" },
  NO: { name: "Noruega", min: 3.13, max: 24.83, flag: "🇳🇴" },
  BE: { name: "Bélgica", min: 3.20, max: 10.30, flag: "🇧🇪" },
  GR: { name: "Grecia", min: 3.30, max: 7.50, flag: "🇬🇷" },
  RO: { name: "Rumanía", min: 3.34, max: 5.77, flag: "🇷🇴" },
  FI: { name: "Finlandia", min: 3.35, max: 21.95, flag: "🇫🇮" },
  CY: { name: "Chipre", min: 3.38, max: 3.38, flag: "🇨🇾" },
  SI: { name: "Eslovenia", min: 3.44, max: 7.57, flag: "🇸🇮" },
  HU: { name: "Hungría", min: 3.57, max: 10.42, flag: "🇭🇺" },
  EE: { name: "Estonia", min: 3.80, max: 15.05, flag: "🇪🇪" },
  IT: { name: "Italia", min: 4.05, max: 10.70, flag: "🇮🇹" },
  GB: { name: "Reino Unido", min: 4.10, max: 11.91, flag: "🇬🇧" },
  SE: { name: "Suecia", min: 4.30, max: 13.58, flag: "🇸🇪" },
  CH: { name: "Suiza", min: 4.79, max: 11.75, flag: "🇨🇭" },
  DK: { name: "Dinamarca", min: 6.90, max: 6.90, flag: "🇩🇰" },
  LT: { name: "Lituania", min: 5.50, max: 5.50, flag: "🇱🇹" },
  AT: { name: "Austria", min: 6.75, max: 6.75, flag: "🇦🇹" },
}

export default function MarketplacePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("buy")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSet, setSelectedSet] = useState("all")
  const [setSearchTerm, setSetSearchTerm] = useState("")
  const [wantsLists, setWantsLists] = useState<WantsList[]>([])
  const [selectedList, setSelectedList] = useState<WantsList | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [newListType, setNewListType] = useState<WantsListType>("empty")
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null)
  const [userDecks, setUserDecks] = useState<any[]>([])
  const [userCollections, setUserCollections] = useState<any[]>([])
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [userSalesHistory, setUserSalesHistory] = useState<any[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])


  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false)
  const [wizardResults, setWizardResults] = useState<any>(null)
  const [isSeller, setIsSeller] = useState(false)
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)
  const [listingPrice, setListingPrice] = useState("")
  const [addAmount, setAddAmount] = useState("")
  const [realSales, setRealSales] = useState<any[]>([])
  const [featuredSets, setFeaturedSets] = useState<any[]>([])
  const [featuredCards, setFeaturedCards] = useState<any[]>([])
  const [risingCards, setRisingCards] = useState<any[]>([])
  const [fallingCards, setFallingCards] = useState<any[]>([])
  const [isLoadingSales, setIsLoadingSales] = useState(true)
  const [isLoadingTrending, setIsLoadingTrending] = useState(true)
  const [sellSearchQuery, setSellSearchQuery] = useState("")
  const [sellSearchResults, setSellSearchResults] = useState<any[]>([])
  const [selectedSellCard, setSelectedSellCard] = useState<any | null>(null)
  const [isSearchingSellCards, setIsSearchingSellCards] = useState(false)
  const [selectedCondition, setSelectedCondition] = useState("NM")
  const [selectedLanguage, setSelectedLanguage] = useState("EN")
  const [listingQuantity, setListingQuantity] = useState("1")
  const [listingDescription, setListingDescription] = useState("")
  const [isReverse, setIsReverse] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const [isAltered, setIsAltered] = useState(false)
  const [isFirstEdition, setIsFirstEdition] = useState(false)
  const [isListing, setIsListing] = useState(false)
  const [sellImagePreview, setSellImagePreview] = useState<string | null>(null)
  const [userSales, setUserSales] = useState<any[]>([])
  const [allSets, setAllSets] = useState<any[]>([])
  const [isLoadingUserSales, setIsLoadingUserSales] = useState(false)
  const [wantsSearchQuery, setWantsSearchQuery] = useState("")
  const [wantsSearchResults, setWantsSearchResults] = useState<any[]>([])
  const [isSearchingWantsCards, setIsSearchingWantsCards] = useState(false)
  const [sellSelectedSet, setSellSelectedSet] = useState("all")
  const [wantsSelectedSet, setWantsSelectedSet] = useState("all")
  const [sellSetSearchTerm, setSellSetSearchTerm] = useState("")
  const [wantsSetSearchTerm, setWantsSetSearchTerm] = useState("")
  const [sellerShippingMethod, setSellerShippingMethod] = useState<Record<string, 'ordinary' | 'certified'>>({}) // sellerId -> method
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingListing, setEditingListing] = useState<any>(null)
  const [editPrice, setEditPrice] = useState("")
  const [editQuantity, setEditQuantity] = useState("")
  const [editCondition, setEditCondition] = useState("")
  const [editLanguage, setEditLanguage] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editReverse, setEditReverse] = useState(false)
  const [editSigned, setEditSigned] = useState(false)
  const [editAltered, setEditAltered] = useState(false)
  const [editFirstEdition, setEditFirstEdition] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3500)
  }
  const { user, updateUser } = useAuth()
  const { language } = useMarketplace()

  useEffect(() => {
    fetchTrending()
  }, [language])

  useEffect(() => {
    fetchSales()
    fetchAllSets()
    if (user) {
      fetchUserSales()
      fetchUserDecks()
      fetchUserCollections()
      fetchUserOrders()
      loadWantsLists()
      loadCart()
    }
  }, [user])



  // Debounce for Sell Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Allow searching by set alone, or by query if >= 3 chars
      if (!sellSearchQuery && sellSelectedSet === 'all') {
        setSellSearchResults([])
        return
      }

      if (sellSearchQuery && sellSearchQuery.length < 3 && sellSelectedSet === 'all') {
        setSellSearchResults([])
        return
      }

      setIsSearchingSellCards(true)
      try {
        let url = `http://localhost:3000/api/cards/search?name=${encodeURIComponent(sellSearchQuery)}`
        if (sellSelectedSet !== 'all') {
          url += `&set=${encodeURIComponent(sellSelectedSet)}`
        }
        const response = await fetch(url)
        const data = await response.json()
        if (Array.isArray(data)) {
          setSellSearchResults(data.slice(0, 50)) // Show top 50
        } else {
          setSellSearchResults([])
        }
      } catch (error) {
        console.error("Error searching cards for sale:", error)
      } finally {
        setIsSearchingSellCards(false)
      }
    }, 400) // 400ms debounce

    return () => clearTimeout(timer)
  }, [sellSearchQuery, sellSelectedSet])

  // Debounce for Wants Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Allow searching by set alone, or by query if >= 3 chars
      if (!wantsSearchQuery && wantsSelectedSet === 'all') {
        setWantsSearchResults([])
        return
      }

      if (wantsSearchQuery && wantsSearchQuery.length < 3 && wantsSelectedSet === 'all') {
        setWantsSearchResults([])
        return
      }

      setIsSearchingWantsCards(true)
      try {
        let url = `http://localhost:3000/api/cards/search?name=${encodeURIComponent(wantsSearchQuery)}`
        if (wantsSelectedSet !== 'all') {
          url += `&set=${encodeURIComponent(wantsSelectedSet)}`
        }
        const response = await fetch(url)
        const data = await response.json()
        if (Array.isArray(data)) {
          setWantsSearchResults(data.slice(0, 20))
        } else {
          setWantsSearchResults([])
        }
      } catch (error) {
        console.error("Error searching cards for wants list:", error)
      } finally {
        setIsSearchingWantsCards(false)
      }
    }, 400) // 400ms debounce

    return () => clearTimeout(timer)
  }, [wantsSearchQuery, wantsSelectedSet])

  const loadWantsLists = () => {
    if (user?.wantList) {
      try {
        const decoded = user.wantList.map(item => JSON.parse(item))
        setWantsLists(decoded)
      } catch (e) {
        console.error("Error decoding wants lists", e)
      }
    }
  }

  const loadCart = () => {
    if (user?.cart) {
      try {
        const decoded = user.cart.map(item => JSON.parse(item))
        setCartItems(decoded)
      } catch (e) {
        console.error("Error decoding cart", e)
      }
    }
  }

  const fetchUserDecks = async () => {
    if (!user) return
    try {
      const res = await fetch(`http://localhost:3000/api/decks/owner/${user.id}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      setUserDecks(data)
    } catch (e) {
      console.error("Error fetching decks", e)
    }
  }

  const fetchUserCollections = async () => {
    if (!user) return
    try {
      const res = await fetch(`http://localhost:3000/api/albums`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      // Filter by owner since backend doesn't have findByOwner route yet
      setUserCollections(data.filter((a: any) => a.ownerId === user.id))
    } catch (e) {
      console.error("Error fetching albums", e)
    }
  }

  const fetchUserOrders = async () => {
    if (!user) return
    try {
      const pRes = await fetch(`http://localhost:3000/api/transactions/buyer/${user.id}`)
      if (!pRes.ok) throw new Error(`HTTP error! status: ${pRes.status}`)
      const pData = await pRes.json()
      setUserOrders(pData)

      const sRes = await fetch(`http://localhost:3000/api/transactions/seller/${user.id}`)
      if (!sRes.ok) throw new Error(`HTTP error! status: ${sRes.status}`)
      const sData = await sRes.json()
      setUserSalesHistory(sData)
    } catch (e) {
      console.error("Error fetching orders", e)
    }
  }

  const fetchAllSets = async () => {
    try {
      const res = await fetch("https://api.pokemontcg.io/v2/sets")
      const data = await res.json()
      setAllSets(data.data)
    } catch (e) {
      console.error("Error fetching sets", e)
    }
  }

  const syncUserWithBackend = async (updates: { wantList?: string[], cart?: string[] }) => {
    if (!user) return
    try {
      const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      updateUser(updates)
    } catch (e) {
      console.error("Error syncing with backend", e)
    }
  }

  const fetchSales = async () => {
    setIsLoadingSales(true)
    try {
      const response = await fetch('http://localhost:3000/api/sales')
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setRealSales(data)
    } catch (error: any) {
      console.error("Error fetching sales:", error)
      const message = error instanceof Error ? error.message : "Error fetching sales";
      // Optional: set an error state to show in UI
    } finally {
      setIsLoadingSales(false)
    }
  }

  const fetchTrending = async () => {
    setIsLoadingTrending(true)
    try {
      const langParam = language !== 'all' ? `?language=${language}` : ''
      const statsRes = await fetch(`http://localhost:3000/api/statistics${langParam}`)
      if (!statsRes.ok) {
        const text = await statsRes.text()
        console.error("Stats fetch failed:", statsRes.status, text.slice(0, 100))
        throw new Error(`HTTP error! status: ${statsRes.status}`)
      }
      const stats = await statsRes.json()

      setFeaturedCards(stats.mostPurchasedCards || [])
      setFeaturedSets(stats.mostPurchasedSets || [])
      setRisingCards(stats.trends?.rising || [])
      setFallingCards(stats.trends?.falling || [])
      // Use recent listings from stats if available, or fetch separately
      if (stats.recentListings) {
        setRealSales(stats.recentListings)
      }
    } catch (error) {
      console.error("Error fetching trending data:", error)
    } finally {
      setIsLoadingTrending(false)
    }
  }

  const fetchUserSales = async () => {
    if (!user) return
    setIsLoadingUserSales(true)
    try {
      const response = await fetch(`http://localhost:3000/api/sales/user/${user.id}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setUserSales(data)
    } catch (error) {
      console.error("Error fetching user sales:", error)
    } finally {
      setIsLoadingUserSales(false)
    }
  }

  const handleSellSearch = (query: string) => {
    setSellSearchQuery(query)
  }

  const handleWantsCardSearch = (query: string) => {
    setWantsSearchQuery(query)
  }

  const handleAddToSpecificWantsList = async (card: any) => {
    if (!selectedList || !user) return

    const newItem: WantsListItem = {
      id: card.id,
      name: card.name,
      set: card.set?.name || card.set || 'Unknown Set',
      number: card.number || 'N/A',
      count: 1,
      condition: "Near Mint",
      owned: false,
      imageUrl: card.images?.small
    }

    const updatedLists = wantsLists.map(list => {
      if (list.id === selectedList.id) {
        if (list.items.some(item => item.id === card.id)) return list
        return {
          ...list,
          items: [...list.items, newItem]
        }
      }
      return list
    })

    setWantsLists(updatedLists)
    setSelectedList(updatedLists.find(l => l.id === selectedList.id) || null)
    syncUserWithBackend({ wantList: updatedLists.map(l => JSON.stringify(l)) })
    setWantsSearchQuery("")
    setWantsSearchResults([])
    showNotification(`Added ${card.name} to ${selectedList.name}`)
  }

  const handleEditListing = (listing: any) => {
    setEditingListing(listing)
    setEditPrice(listing.price.toString())
    setEditQuantity(listing.amount.toString())
    setEditCondition(listing.condition)
    setEditLanguage(listing.language)
    setEditDescription(listing.observations || "")
    setEditReverse(!!listing.extras?.reverseHolo)
    setEditSigned(!!listing.extras?.signed)
    setEditAltered(!!listing.extras?.altered)
    setEditFirstEdition(!!listing.extras?.firstEdition)
    setIsEditDialogOpen(true)
  }

  const handleUpdateListing = async () => {
    if (!editingListing || !user) return
    setIsUpdating(true)
    try {
      const res = await fetch(`http://localhost:3000/api/sales/${editingListing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          price: parseFloat(editPrice),
          amount: parseInt(editQuantity),
          condition: editCondition,
          language: editLanguage,
          observations: editDescription,
          extras: {
            reverseHolo: editReverse,
            signed: editSigned,
            altered: editAltered,
            firstEdition: editFirstEdition
          }
        })
      })
      if (!res.ok) throw new Error("Failed to update listing")
      setIsEditDialogOpen(false)
      fetchUserSales()
      fetchSales()
      showNotification("Listing updated successfully")
    } catch (e) {
      console.error("Error updating sale", e)
      showNotification("Error updating listing", "error")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteSale = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return
    try {
      const res = await fetch(`http://localhost:3000/api/sales/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete listing");
      }
      fetchUserSales()
      fetchSales()
      showNotification("Listing deleted successfully")
    } catch (e: any) {
      console.error("Error deleting sale", e)
      showNotification(e.message || "Error deleting listing", "error")
    }
  }

  const handleListForSale = async () => {
    if (!user || !selectedSellCard || !listingPrice) return

    setIsListing(true)
    try {
      // 1. Create Card Entity
      const cardRes = await fetch('http://localhost:3000/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tcgId: selectedSellCard.id,
          name: selectedSellCard.name,
          type: selectedSellCard.supertype || 'Pokémon',
          rarity: selectedSellCard.rarity || 'Common',
          price: parseFloat(listingPrice),
          stock: parseInt(listingQuantity),
          source: selectedSellCard.set?.name || 'Unknown Set',
          ownerId: user.id,
          language: selectedLanguage,
          isForSale: true,
          metadata: {
            tcgId: selectedSellCard.id,
            images: selectedSellCard.images,
            number: selectedSellCard.number,
            set: selectedSellCard.set
          }
        })
      })
      const cardData = await cardRes.json().catch(() => ({}));
      if (!cardRes.ok) throw new Error(cardData.error || cardData.message || "Error creating card")

      // 2. Create Sale Entity
      const saleRes = await fetch('http://localhost:3000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: cardData.id,
          sellerId: user.id,
          amount: parseInt(listingQuantity),
          price: parseFloat(listingPrice),
          language: selectedLanguage,
          condition: selectedCondition,
          observations: listingDescription,
          imageUrl: sellImagePreview || null,
          extras: {
            reverseHolo: isReverse,
            signed: isSigned,
            altered: isAltered,
            firstEdition: isFirstEdition
          }
        })
      })

      if (!saleRes.ok) throw new Error("Error creating sale")

      // Success
      setSelectedSellCard(null)
      setListingPrice("")
      setListingQuantity("1")
      setListingDescription("")
      setSelectedCondition("NM")
      setSelectedLanguage("EN")
      setIsReverse(false)
      setIsSigned(false)
      setIsAltered(false)
      setIsFirstEdition(false)
      setSellImagePreview(null)
      setSellSearchQuery("")
      fetchSales() // Refresh marketplace
      fetchUserSales() // Refresh inventory
      showNotification("Card listed successfully!")
    } catch (error: any) {
      console.error("Error listing card:", error)
      showNotification(error.message || "Error listing card", "error")
    } finally {
      setIsListing(false)
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Mint":
      case "M":
        return "bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
      case "Near Mint":
      case "NM":
        return "bg-blue-500/20 text-blue-700 border-blue-500/30"
      case "Excellent":
      case "EX":
        return "bg-cyan-500/20 text-cyan-700 border-cyan-500/30"
      case "Good":
      case "GD":
        return "bg-lime-500/20 text-lime-700 border-lime-500/30"
      case "Lightly Played":
      case "LP":
      case "Light Played":
        return "bg-amber-500/20 text-amber-700 border-amber-500/30"
      case "Played":
      case "PL":
        return "bg-orange-500/20 text-orange-700 border-orange-500/30"
      case "Poor":
      case "PO":
        return "bg-red-500/20 text-red-700 border-red-500/30"
      default: return "bg-muted text-muted-foreground"
    }
  }


  const getLanguageFlag = (lang: string) => {
    switch (lang?.toUpperCase()) {
      case 'EN': return '🇺🇸'
      case 'ES': return '🇪🇸'
      case 'JP': return '🇯🇵'
      case 'DE': return '🇩🇪'
      case 'FR': return '🇫🇷'
      case 'IT': return '🇮🇹'
      case 'PT': return '🇵🇹'
      default: return '🌐'
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
      case "deck": return "From Deck"
      case "collection": return "From Set"
      default: return "Empty"
    }
  }

  const handleCreateList = async () => {
    let items: WantsListItem[] = []
    let sourceName = ""

    if (newListType === "deck") {
      const deck = userDecks.find(d => d.id.toString() === selectedSourceId)
      if (deck) {
        sourceName = deck.name
        items = deck.cards.map((item: any) => ({
          id: item.card.id,
          name: item.card.name,
          set: item.card.set?.name || item.card.set,
          number: item.card.number,
          count: item.count || 1,
          condition: "Any",
          owned: false,
          imageUrl: item.card.images?.small
        }))
      }
    } else if (newListType === "collection" && selectedSourceId) {
      const set = allSets.find(s => s.id === selectedSourceId)
      if (set) {
        sourceName = set.name
        try {
          const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${set.id}&pageSize=250&orderBy=number`)
          const result = await res.json()
          const setCards = result.data || []
          const ownedIds = [...(user?.ownedEnglishCards || []), ...(user?.ownedPokemon || [])]
          const missingCards = setCards.filter((card: any) => !ownedIds.includes(card.id))

          items = missingCards.map((card: any) => ({
            id: card.id,
            name: card.name,
            set: set.name,
            number: card.number,
            count: 1,
            condition: "Near Mint",
            owned: false,
            imageUrl: card.images?.small
          }))
        } catch (e) {
          console.error("Error importing set cards", e)
        }
      }
    }

    const newList: WantsList = {
      id: Date.now().toString(),
      name: newListName || sourceName || "New List",
      type: newListType,
      sourceId: selectedSourceId || undefined,
      sourceName,
      language: selectedLanguage,
      items,
      createdAt: new Date().toISOString().split('T')[0],
    }

    const updatedLists = [...wantsLists, newList]
    setWantsLists(updatedLists)
    syncUserWithBackend({ wantList: updatedLists.map(l => JSON.stringify(l)) })

    setNewListName("")
    setNewListType("empty")
    setSelectedSourceId(null)
    setIsCreateDialogOpen(false)
  }

  const handleDeleteList = (listId: string) => {
    const updatedLists = wantsLists.filter(list => list.id !== listId)
    setWantsLists(updatedLists)
    syncUserWithBackend({ wantList: updatedLists.map(l => JSON.stringify(l)) })
    if (selectedList?.id === listId) {
      setSelectedList(null)
    }
  }

  const handleToggleOwned = (listId: string, itemId: string) => {
    const updatedLists = wantsLists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map(item =>
            item.id.toString() === itemId ? { ...item, owned: !item.owned } : item
          ),
        }
      }
      return list
    })
    setWantsLists(updatedLists)
    syncUserWithBackend({ wantList: updatedLists.map(l => JSON.stringify(l)) })

    // Update selected list if it's the one being modified
    if (selectedList?.id === listId) {
      setSelectedList(prev => prev ? {
        ...prev,
        items: prev.items.map(item =>
          item.id.toString() === itemId ? { ...item, owned: !item.owned } : item
        ),
      } : null)
    }
  }

  const handleRemoveFromList = (listId: string, itemId: string) => {
    const updatedLists = wantsLists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.filter(item => item.id.toString() !== itemId.toString()),
        }
      }
      return list
    })
    setWantsLists(updatedLists)
    syncUserWithBackend({ wantList: updatedLists.map(l => JSON.stringify(l)) })

    if (selectedList?.id === listId) {
      setSelectedList(prev => prev ? {
        ...prev,
        items: prev.items.filter(item => item.id.toString() !== itemId.toString()),
      } : null)
    }
  }

  const handleUpdateItem = (listId: string, itemId: string, updates: Partial<WantsListItem>) => {
    const updatedLists = wantsLists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map(item =>
            item.id.toString() === itemId.toString() ? { ...item, ...updates } : item
          )
        }
      }
      return list
    })
    setWantsLists(updatedLists)
    syncUserWithBackend({ wantList: updatedLists.map(l => JSON.stringify(l)) })

    if (selectedList?.id === listId) {
      setSelectedList(prev => prev ? {
        ...prev,
        items: prev.items.map(item =>
          item.id.toString() === itemId.toString() ? { ...item, ...updates } : item
        )
      } : null)
    }
  }


  const handleAddToCart = (listing: any) => {
    if (!user) {
      showNotification("Please login to add items to cart", "error")
      return
    }
    const newItem = {
      id: listing.id, // Use listing ID as cart item ID to make finding easier
      saleId: listing.id,
      name: listing.cardName,
      set: listing.cardSet,
      condition: listing.condition,
      language: listing.language,
      price: listing.price,
      quantity: 1,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      sellerCountry: listing.country || listing.sellerCountry || "ES",
      imageUrl: listing.cardImage || listing.imageUrl
    }
    const updatedCart = [...cartItems, newItem]
    setCartItems(updatedCart)
    syncUserWithBackend({ cart: updatedCart.map(i => JSON.stringify(i)) })
    showNotification("Added to cart!")
  }

  const handleRemoveFromCart = (itemId: string) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId)
    setCartItems(updatedCart)
    syncUserWithBackend({ cart: updatedCart.map(i => JSON.stringify(i)) })
  }

  const handleUpdateCartQuantity = (itemId: string, delta: number) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    })
    setCartItems(updatedCart)
    syncUserWithBackend({ cart: updatedCart.map(i => JSON.stringify(i)) })
  }

  const handleClearCart = () => {
    setCartItems([])
    syncUserWithBackend({ cart: [] })
  }

  const handleClearSellerCart = (sellerId: string) => {
    const updatedCart = cartItems.filter(item => (item.sellerId || 'unknown') !== sellerId)
    setCartItems(updatedCart)
    syncUserWithBackend({ cart: updatedCart.map(i => JSON.stringify(i)) })
  }

  const handleRunWizard = () => {
    if (!selectedList || selectedList.items.length === 0) return

    setIsWizardOpen(true)

    const missingItems = selectedList.items.filter(item => !item.owned)
    if (missingItems.length === 0) {
      setWizardResults(null)
      return
    }

    const matchingSales = realSales.filter(sale =>
      missingItems.some(item =>
        sale.cardName.toLowerCase().includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(sale.cardName.toLowerCase())
      )
    )

    const sellersMap = new Map<string, any[]>()
    matchingSales.forEach(sale => {
      const seller = sale.sellerName || 'Unknown Seller'
      if (!sellersMap.has(seller)) sellersMap.set(seller, [])
      sellersMap.get(seller)!.push(sale)
    })

    const sortedSellers = Array.from(sellersMap.entries()).sort((a, b) => b[1].length - a[1].length)

    let opt1Sellers: { name: string, cards: number }[] = []
    let opt1Total = 0
    let opt1CardsCount = 0

    if (sortedSellers.length > 0) {
      opt1Sellers.push({ name: sortedSellers[0][0], cards: sortedSellers[0][1].length })
      opt1Total += sortedSellers[0][1].reduce((sum: number, sale: any) => sum + sale.price, 0)
      opt1CardsCount += sortedSellers[0][1].length

      if (sortedSellers.length > 1) {
        opt1Sellers.push({ name: sortedSellers[1][0], cards: sortedSellers[1][1].length })
        opt1Total += sortedSellers[1][1].reduce((sum: number, sale: any) => sum + sale.price, 0)
        opt1CardsCount += sortedSellers[1][1].length
      }
    }

    setWizardResults({
      option1: {
        total: opt1Total,
        shipping: 5.40,
        sellers: opt1Sellers,
        cardsFound: opt1CardsCount,
        totalMissing: missingItems.length
      }
    })
  }

  const getMissingCount = (list: WantsList) => list.items.filter(item => !item.owned).length
  const getOwnedCount = (list: WantsList) => list.items.filter(item => item.owned).length

  const allTimeHighCards = realSales?.length
    ? [...realSales].sort((a, b) => b.price - a.price).slice(0, 5).map(s => ({
      id: s.id,
      name: s.cardName || s.name || s.card?.name || "Unknown Card",
      set: s.cardSet || s.set || s.card?.set?.name || s.card?.set || "Unknown Set",
      price: s.price,
      image: s.cardImage || s.imageUrl || (s.card && s.card.images ? s.card.images.small : ""),
      tcgId: s.tcgId || s.card?.id,
      note: 'Market Peak'
    }))
    : [];

  const allTimeLowCards = realSales?.length
    ? [...realSales].sort((a, b) => a.price - b.price).slice(0, 5).map(s => ({
      id: s.id,
      name: s.cardName || s.name || s.card?.name || "Unknown Card",
      set: s.cardSet || s.set || s.card?.set?.name || s.card?.set || "Unknown Set",
      price: s.price,
      image: s.cardImage || s.imageUrl || (s.card && s.card.images ? s.card.images.small : ""),
      tcgId: s.tcgId || s.card?.id
    }))
    : [];

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
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">
                Marketplace
              </h1>
              <p className="mt-2 text-muted-foreground">
                Buy, sell, and trade Pokémon cards with collectors worldwide
              </p>
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <Card className="bg-secondary/30 border-none shadow-sm">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your Balance</p>
                      <p className="text-xl font-bold font-mono">${(user.balance || 0).toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                      <Plus className="h-4 w-4" />
                      Add Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Add Balance
                      </DialogTitle>
                      <DialogDescription>
                        Add funds to your wallet to purchase cards instantly.
                      </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="deposit">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="deposit">Deposit</TabsTrigger>
                        <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                      </TabsList>
                      <TabsContent value="deposit">
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">Amount (€)</label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={addAmount}
                              onChange={(e) => setAddAmount(e.target.value)}
                              className="text-lg font-bold"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[10, 20, 50].map((amount) => (
                              <Button
                                key={amount}
                                variant="outline"
                                onClick={() => setAddAmount(amount.toString())}
                              >
                                +{amount}€
                              </Button>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="withdraw">
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">Amount to Withdraw (€)</label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              className="text-lg font-bold"
                            />
                            <p className="text-xs text-muted-foreground">Available balance: {(user.balance || 0).toFixed(2)}€</p>
                          </div>
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">PayPal Email / IBAN</label>
                            <Input placeholder="your@email.com" />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddFundsOpen(false)}>Cancel</Button>
                      <Button
                        onClick={() => {
                          const amount = parseFloat(addAmount);
                          if (isNaN(amount) || amount <= 0) return;

                          const newBalance = (user.balance || 0) + amount;
                          updateUser({ balance: newBalance });
                          setIsAddFundsOpen(false);
                          setAddAmount("");
                        }}
                        disabled={!addAmount || parseFloat(addAmount) <= 0}
                      >
                        Confirm Transaction
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Sparkles className="h-6 w-6 text-amber-500" />
                  Shopping Wizard
                </DialogTitle>
                <DialogDescription>
                  We found the best ways to get all the cards in your list. Choose the option that fits you best.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {wizardResults ? (
                  <>
                    {/* Option 1: Max Efficiency */}
                    <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                        BEST VALUE
                      </div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">Option 1: Max Efficiency</h4>
                          <p className="text-sm text-muted-foreground">Found {wizardResults.option1.cardsFound} of {wizardResults.option1.totalMissing} cards</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{wizardResults.option1.total.toFixed(2)}€</p>
                          <p className="text-xs text-muted-foreground">+{wizardResults.option1.shipping.toFixed(2)}€ shipping</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {wizardResults.option1.sellers.map((s: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-emerald-500" />
                            <span>{s.name}: {s.cards} cards</span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full mt-4 bg-primary hover:bg-primary/90" onClick={() => {
                        setIsWizardOpen(false);
                        showNotification("Added matching items to cart!");
                        // Add real logic to push items to cart
                      }}>
                        Select Option & Add to Cart
                      </Button>
                    </div>

                    {/* Option 2: Budget Saver (Mock) */}
                    <div className="rounded-xl border border-border p-4 hover:border-primary/50 transition-colors opacity-70">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">Option 2: Budget Saver</h4>
                          <p className="text-sm text-muted-foreground">Cheapest individual cards</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{(wizardResults.option1.total * 0.85).toFixed(2)}€</p>
                          <p className="text-xs text-muted-foreground">+14.20€ shipping (multiple sellers)</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4" onClick={() => setIsWizardOpen(false)}>
                        Select Option
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="py-10 text-center text-muted-foreground">
                    <p>No cards needed or unable to find matches in the current marketplace.</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`mb-8 grid w-full max-w-2xl ${user ? 'grid-cols-5' : 'grid-cols-1'}`}>
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
                  <TabsTrigger value="orders" className="gap-2">
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Orders</span>
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
                        placeholder="Search cards (e.g. charizard, charizard PAF, charizard 51...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            router.push(`/marketplace/search?q=${encodeURIComponent(searchQuery)}&set=${selectedSet}`)
                          }
                        }}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Select value={selectedSet} onValueChange={setSelectedSet}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Filter by Set" />
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
                                onKeyDown={(e) => e.stopPropagation()} // Prevent closing select on space
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
                      <Button className="gap-2" onClick={() => {
                        router.push(`/marketplace/search?q=${encodeURIComponent(searchQuery)}&set=${selectedSet}`)
                      }}>
                        <Search className="h-4 w-4" />
                        Search
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
                  {isLoadingTrending ? (
                    [1, 2, 3, 4].map(i => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="mb-3 h-24 rounded-lg bg-muted" />
                          <div className="h-4 w-3/4 bg-muted mb-2" />
                          <div className="h-3 w-1/2 bg-muted" />
                        </CardContent>
                      </Card>
                    ))
                  ) : featuredSets.length > 0 ? (
                    featuredSets.map((set, index) => {
                      const setInfo = allSets.find(s => s.name === set.name);
                      return (
                        <Card key={set.name} className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                          <CardContent className="p-4">
                            <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-gradient-to-br from-muted to-secondary p-4">
                              {setInfo?.images?.logo ? (
                                <img src={setInfo.images.logo} alt={set.name} className="max-h-full max-w-full object-contain filter drop-shadow-md" />
                              ) : (
                                <Package className="h-10 w-10 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium group-hover:text-accent line-clamp-1">{set.name}</h3>
                                <p className="text-sm text-muted-foreground">{setInfo?.series || set.series}</p>
                              </div>
                              <Badge variant="secondary" className="text-xs">#{index + 1}</Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {parseInt(set.sales).toLocaleString()} sold
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-10 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No sets data available yet.</p>
                    </div>
                  )}
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
                  {isLoadingTrending ? (
                    [1, 2, 3, 4].map(i => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="mb-3 aspect-[3/4] rounded-lg bg-muted" />
                          <div className="h-4 w-3/4 bg-muted mb-2" />
                          <div className="h-3 w-1/2 bg-muted" />
                        </CardContent>
                      </Card>
                    ))
                  ) : featuredCards.length > 0 ? (
                    featuredCards.map((card, index) => (
                      <Link key={card.id} href={`/marketplace/card/${card.id}`}>
                        <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                          <CardContent className="p-4">
                            <div className="mb-3 aspect-[3/4] flex items-center justify-center rounded-lg bg-muted overflow-hidden">
                              {card.image || card.card_image ? (
                                <img src={card.image || card.card_image} alt={card.name} className="h-full w-full object-contain transition-transform group-hover:scale-105" />
                              ) : (
                                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium group-hover:text-accent truncate">{card.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">{card.cardSet || 'Set'}</p>
                              </div>
                              <Badge variant="secondary" className="ml-2 text-xs shrink-0">#{index + 1}</Badge>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="font-bold text-lg">
                                {card.minPrice ? `${parseFloat(card.minPrice).toFixed(2)}€` : '--€'}
                              </span>
                              <span className="text-xs text-muted-foreground">Min. Price</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full py-10 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                      <Star className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No popular cards data available yet.</p>
                    </div>
                  )}
                </div>
              </section>


              {/* Price Movement Section */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Rising Prices */}
                <section className={risingCards.length === 0 ? "hidden" : ""}>
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                    <h2 className="font-serif text-2xl font-semibold">Rising Prices</h2>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border">
                        {isLoadingTrending ? (
                          [1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse bg-muted m-4 rounded" />)
                        ) : risingCards.length > 0 ? (
                          risingCards.map((card) => (
                            <Link key={card.id} href={`/marketplace/card/${card.id}`}>
                              <div className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50 cursor-pointer">
                                <div className="aspect-[3/4] h-12 bg-muted rounded overflow-hidden flex items-center justify-center">
                                  {card.card_image || card.image ? (
                                    <img src={card.card_image || card.image} alt="" className="h-full w-full object-contain" />
                                  ) : (
                                    <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{card.card_name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{card.card_set}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-sm">
                                    {card.minPrice ? `${parseFloat(card.minPrice).toFixed(2)}€` : '--€'}
                                  </p>
                                  <p className="text-[10px] text-emerald-600 font-bold flex items-center justify-end">
                                    <Plus className="h-2 w-2 mr-0.5" />
                                    {parseFloat(card.change_percent).toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="py-10 text-center text-muted-foreground">
                            No price increases detected recently.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <section className={fallingCards.length === 0 ? "hidden" : ""}>
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingDown className="h-6 w-6 text-red-500" />
                    <h2 className="font-serif text-2xl font-semibold">Falling Prices</h2>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border">
                        {isLoadingTrending ? (
                          [1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse bg-muted m-4 rounded" />)
                        ) : fallingCards.length > 0 ? (
                          fallingCards.map((card) => (
                            <Link key={card.id} href={`/marketplace/card/${card.id}`}>
                              <div className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50 cursor-pointer">
                                <div className="aspect-[3/4] h-12 bg-muted rounded overflow-hidden flex items-center justify-center">
                                  {card.card_image || card.image ? (
                                    <img src={card.card_image || card.image} alt="" className="h-full w-full object-contain" />
                                  ) : (
                                    <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{card.card_name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{card.card_set}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-sm">
                                    {card.minPrice ? `${parseFloat(card.minPrice).toFixed(2)}€` : '--€'}
                                  </p>
                                  <p className="text-[10px] text-red-600 font-bold flex items-center justify-end">
                                    <Minus className="h-2 w-2 mr-0.5" />
                                    {Math.abs(parseFloat(card.change_percent)).toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="py-10 text-center text-muted-foreground">
                            No significant price drops detected recently.
                          </div>
                        )}
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
                        {allTimeHighCards.length > 0 ? (
                          allTimeHighCards.map((card) => (
                            <Link key={card.id} href={`/marketplace/card/${card.tcgId || card.id}`}>
                              <div className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50 cursor-pointer">
                                <div className="aspect-[3/4] h-14 bg-muted rounded overflow-hidden flex items-center justify-center">
                                  {card.image ? (
                                    <img src={card.image} alt="" className="h-full w-full object-contain" />
                                  ) : (
                                    <Star className="h-5 w-5 text-amber-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{card.name}</h4>
                                  <p className="text-sm text-muted-foreground">{card.set}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">{card.price.toFixed(2)}€</p>
                                  <Badge variant="outline" className="text-xs">{card.note}</Badge>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="py-10 text-center text-muted-foreground">
                            No high price records available.
                          </div>
                        )}
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
                        {allTimeLowCards.length > 0 ? (
                          allTimeLowCards.map((card) => (
                            <Link key={card.id} href={`/marketplace/card/${card.tcgId || card.id}`}>
                              <div className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50 cursor-pointer">
                                <div className="aspect-[3/4] h-14 bg-muted rounded overflow-hidden flex items-center justify-center">
                                  {card.image ? (
                                    <img src={card.image} alt="" className="h-full w-full object-contain" />
                                  ) : (
                                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{card.name}</h4>
                                  <p className="text-sm text-muted-foreground">{card.set}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-emerald-600">{card.price.toFixed(2)}€</p>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="py-10 text-center text-muted-foreground">
                            No low price records available.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </div>


              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold">
                    <Clock className="h-6 w-6 text-primary" />
                    Recent Listings
                  </h2>
                  <Button variant="ghost" size="sm" onClick={fetchSales}>Refresh</Button>
                </div>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {isLoadingSales ? (
                        <div className="py-10 text-center">
                          <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Loading recent listings...</p>
                        </div>
                      ) : realSales.length > 0 ? (
                        realSales.map((listing) => {
                          const cartItemForListing = cartItems.find((item: any) => item.saleId === listing.id || item.id === listing.id);
                          const inCartQty = cartItemForListing ? cartItemForListing.quantity : 0;
                          const availableStock = (listing.amount || 1) - inCartQty;
                          const isOutOfStock = availableStock <= 0;

                          return (
                            <div
                              key={listing.id}
                              className={`flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/50 ${isOutOfStock ? 'opacity-50 grayscale-[0.5]' : ''}`}
                            >
                              <div className="flex h-16 w-12 items-center justify-center rounded bg-muted overflow-hidden">
                                {listing.cardImage || listing.image || listing.card_image || listing.imageUrl ? (
                                  <img src={listing.cardImage || listing.image || listing.card_image || listing.imageUrl} alt={listing.cardName} className="h-full w-full object-contain" />
                                ) : (
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm truncate">{listing.cardName}</h4>
                                  <Badge variant="outline" className="text-[10px] font-bold">
                                    {listing.cardSet}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground ml-auto">
                                    {new Date(listing.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                  <Badge className={`${getConditionColor(listing.condition)} border-none text-[10px] px-1.5 py-0 rounded-full font-bold`}>
                                    {listing.condition}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <span>{getLanguageFlag(listing.language)}</span>
                                    <span className="font-bold uppercase tracking-tighter text-[10px]">{listing.language}</span>
                                  </div>
                                  <span className={`text-[10px] font-bold ${isOutOfStock ? 'text-red-500' : 'text-muted-foreground'}`}>
                                    {isOutOfStock ? 'OUT OF STOCK' : `${availableStock} STOCK`}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium">
                                  Seller: <span className="text-foreground">{listing.sellerName}</span>
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                                <span className="text-xl font-black tracking-tighter">{listing.price.toFixed(2)}€</span>
                                <Button 
                                  size="sm" 
                                  className={`gap-2 h-9 rounded-full ${isOutOfStock ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'}`} 
                                  onClick={() => !isOutOfStock && handleAddToCart(listing)}
                                  disabled={isOutOfStock}
                                >
                                  {isOutOfStock ? <X className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                                  <span className="hidden sm:inline font-bold uppercase text-[10px] tracking-widest">{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-10 text-center text-muted-foreground">
                          No active listings found.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>

            {user ? (
              <>
                {/* Sell Tab */}
                <TabsContent value="sell">
                  {!isSeller ? (
                    <Card className="max-w-2xl mx-auto border-2 border-dashed border-primary/20 bg-primary/5">
                      <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                          <Tag className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-serif">Start Selling on TCG Temple</CardTitle>
                        <CardDescription className="text-base mt-2">
                          Join our marketplace and turn your collection into balance.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="flex gap-3 items-start">
                            <div className="bg-emerald-100 p-1 rounded-full"><Check className="h-4 w-4 text-emerald-600" /></div>
                            <div>
                              <p className="font-semibold text-sm">Low Fees</p>
                              <p className="text-xs text-muted-foreground">Only 2% commission on each sale.</p>
                            </div>
                          </div>
                          <div className="flex gap-3 items-start">
                            <div className="bg-emerald-100 p-1 rounded-full"><Check className="h-4 w-4 text-emerald-600" /></div>
                            <div>
                              <p className="font-semibold text-sm">Fast Payments</p>
                              <p className="text-xs text-muted-foreground">Withdraw your balance anytime to PayPal or Bank.</p>
                            </div>
                          </div>
                          <div className="flex gap-3 items-start">
                            <div className="bg-emerald-100 p-1 rounded-full"><Check className="h-4 w-4 text-emerald-600" /></div>
                            <div>
                              <p className="font-semibold text-sm">Huge Audience</p>
                              <p className="text-xs text-muted-foreground">Reach thousands of collectors instantly.</p>
                            </div>
                          </div>
                          <div className="flex gap-3 items-start">
                            <div className="bg-emerald-100 p-1 rounded-full"><Check className="h-4 w-4 text-emerald-600" /></div>
                            <div>
                              <p className="font-semibold text-sm">Secure Shipping</p>
                              <p className="text-xs text-muted-foreground">Integrated tracking and shipping labels.</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-background rounded-lg border border-border space-y-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="terms"
                              checked={hasAcceptedTerms}
                              onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                              className="h-4 w-4 rounded border-border"
                            />
                            <label htmlFor="terms" className="text-sm cursor-pointer">
                              I accept the <Button variant="link" className="p-0 h-auto text-sm">Seller Terms & Conditions</Button>
                            </label>
                          </div>
                        </div>

                        <Button
                          className="w-full h-12 text-lg shadow-lg shadow-primary/20"
                          disabled={!hasAcceptedTerms}
                          onClick={() => setIsSeller(true)}
                        >
                          Activate Seller Account
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      <Tabs defaultValue="active" className="w-full">
                        <TabsList className="mb-6 grid w-full max-w-2xl grid-cols-4">
                          <TabsTrigger value="active" className="gap-2">
                            <Library className="h-4 w-4" />
                            My Inventory
                          </TabsTrigger>
                          <TabsTrigger value="new" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Sell New
                          </TabsTrigger>
                          <TabsTrigger value="to-ship" className="gap-2">
                            <Package className="h-4 w-4" />
                            To Ship
                          </TabsTrigger>
                          <TabsTrigger value="history" className="gap-2">
                            <History className="h-4 w-4" />
                            History
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="active">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Your Active Listings</CardTitle>
                              <CardDescription>Manage your cards currently for sale in the marketplace.</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {isLoadingUserSales ? (
                                  <div className="py-20 text-center">
                                    <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                                    <p className="text-muted-foreground">Loading your listings...</p>
                                  </div>
                                ) : userSales.length > 0 ? (
                                    userSales.map((listing) => (
                                      <div key={listing.id} className="group flex items-center gap-6 rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-all shadow-sm hover:shadow-lg">
                                        <div className="aspect-[3/4] h-24 bg-muted rounded-lg overflow-hidden flex items-center justify-center p-1 bg-white shadow-inner">
                                          {listing.cardImage || listing.image || listing.card_image || listing.imageUrl ? (
                                            <img src={listing.cardImage || listing.image || listing.card_image || listing.imageUrl} alt="" className="h-full w-full object-contain group-hover:scale-110 transition-transform" />
                                          ) : (
                                            <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-3 mb-2">
                                            <Link href={`/marketplace/card/${listing.tcgId || listing.cardId}`} className="font-black text-xl hover:text-primary transition-colors truncate">
                                              {listing.cardName}
                                            </Link>
                                            <Badge className={`${getConditionColor(listing.condition)} border-none font-bold text-xs px-2 py-0.5 rounded-full`}>
                                              {listing.condition}
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-muted-foreground font-medium mb-3">{listing.cardSet}</p>
                                          <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                                              <span className="text-lg">{getLanguageFlag(listing.language)}</span>
                                              <span className="text-xs font-bold uppercase">{listing.language}</span>
                                            </div>
                                            {listing.extras?.reverseHolo && <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/30 text-[10px] font-bold">REVERSE</Badge>}
                                            {listing.extras?.firstEdition && <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30 text-[10px] font-bold">1ST ED</Badge>}
                                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded">
                                              Stock: {listing.amount}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-3">
                                          <p className="font-black text-3xl tracking-tighter text-foreground">{listing.price.toFixed(2)}€</p>
                                          <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditListing(listing); }}>
                                              <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteSale(listing.id); }}>
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                ) : (
                                  <div className="py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                    <Tag className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <h3 className="font-bold text-lg">Your inventory is empty</h3>
                                    <p className="text-sm mt-2">Start selling cards to see them here.</p>
                                    <Button variant="outline" className="mt-4 gap-2" onClick={() => {/* Set active sub-tab to 'new' */ }}>
                                      <Plus className="h-4 w-4" />
                                      List your first card
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="new">
                          <Card className="border-primary/20 shadow-lg shadow-primary/5">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-primary" />
                                Create New Listing
                              </CardTitle>
                              <CardDescription>Fill in the details to list your card for sale worldwide.</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-8 lg:grid-cols-2">
                                <div className="space-y-6">
                                  <div className="space-y-2 relative">
                                    <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Step 1: Search Card</label>
                                    <div className="flex gap-2">
                                      <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                          placeholder="Search by name (e.g. Charizard)..."
                                          value={sellSearchQuery}
                                          onChange={(e) => handleSellSearch(e.target.value)}
                                          className="pl-10 h-11"
                                        />
                                      </div>
                                      <Select value={sellSelectedSet} onValueChange={setSellSelectedSet}>
                                        <SelectTrigger className="w-[180px] h-11">
                                          <SelectValue placeholder="All Sets" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <div className="p-2 border-b">
                                            <div className="relative">
                                              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                              <Input
                                                placeholder="Search sets..."
                                                value={sellSetSearchTerm}
                                                onChange={(e) => setSellSetSearchTerm(e.target.value)}
                                                className="pl-8 h-8 text-xs"
                                                onKeyDown={(e) => e.stopPropagation()}
                                              />
                                            </div>
                                          </div>
                                          <div className="max-h-[200px] overflow-y-auto">
                                            <SelectItem value="all">All Sets</SelectItem>
                                            {allSets
                                              .filter(set => set.name.toLowerCase().includes(sellSetSearchTerm.toLowerCase()) || set.id.toLowerCase().includes(sellSetSearchTerm.toLowerCase()))
                                              .map(set => (
                                                <SelectItem key={set.id} value={set.id}>
                                                  {set.name}
                                                </SelectItem>
                                              ))
                                            }
                                          </div>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {sellSearchResults.length > 0 && (
                                      <Card className="absolute z-50 w-full mt-1 shadow-2xl max-h-[300px] overflow-y-auto border-primary/20">
                                        <CardContent className="p-0">
                                          {sellSearchResults.map((card) => (
                                            <div
                                              key={card.id}
                                              className="flex items-center gap-3 p-3 hover:bg-primary/5 cursor-pointer transition-colors border-b border-border last:border-0"
                                              onClick={() => {
                                                setSelectedSellCard(card);
                                                setSellSearchQuery(card.name);
                                                setSellSearchResults([]);
                                              }}
                                            >
                                              <div className="aspect-[3/4] h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                                                {card.images?.small ? (
                                                  <img src={card.images.small} alt={card.name} className="h-full w-full object-contain" />
                                                ) : (
                                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                )}
                                              </div>
                                              <div>
                                                <p className="font-bold text-sm">{card.name}</p>
                                                <p className="text-xs text-muted-foreground">{card.set?.name} - {card.number}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </CardContent>
                                      </Card>
                                    )}

                                    {selectedSellCard && (
                                      <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="aspect-[3/4] h-24 bg-white rounded shadow-sm overflow-hidden p-1 flex items-center justify-center">
                                          {selectedSellCard.images?.small ? (
                                            <img src={selectedSellCard.images?.small} alt="" className="h-full w-full object-contain" />
                                          ) : (
                                            <ImageIcon className="h-8 w-8 text-muted-foreground/20" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                            <p className="font-black text-primary">{selectedSellCard.name}</p>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedSellCard(null)}>
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </div>
                                          <p className="text-xs text-muted-foreground font-medium">{selectedSellCard.set?.name}</p>
                                          <Badge variant="outline" className="mt-2 text-[10px]">{selectedSellCard.number}</Badge>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Condition</label>
                                      <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                                        <SelectTrigger className="h-11">
                                          <SelectValue placeholder="Select condition" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="M">Mint (M)</SelectItem>
                                          <SelectItem value="NM">Near Mint (NM)</SelectItem>
                                          <SelectItem value="LP">Light Played (LP)</SelectItem>
                                          <SelectItem value="MP">Moderately Played (MP)</SelectItem>
                                          <SelectItem value="HP">Heavily Played (HP)</SelectItem>
                                          <SelectItem value="PO">Poor (PO)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Language</label>
                                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                        <SelectTrigger className="h-11">
                                          <SelectValue placeholder="Language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="EN">🇺🇸 English</SelectItem>
                                          <SelectItem value="ES">🇪🇸 Spanish</SelectItem>
                                          <SelectItem value="FR">🇫🇷 French</SelectItem>
                                          <SelectItem value="DE">🇩🇪 German</SelectItem>
                                          <SelectItem value="IT">🇮🇹 Italian</SelectItem>
                                          <SelectItem value="PT">🇵🇹 Portuguese</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-secondary/20 rounded-xl">
                                    <div className="flex flex-col gap-2">
                                      <label className="text-[10px] font-black uppercase text-muted-foreground">Reverse</label>
                                      <div className="flex items-center gap-2">
                                        <Checkbox checked={isReverse} onCheckedChange={(checked) => setIsReverse(!!checked)} id="reverse" />
                                        <label htmlFor="reverse" className="text-xs cursor-pointer">Holo</label>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      <label className="text-[10px] font-black uppercase text-muted-foreground">Signed</label>
                                      <div className="flex items-center gap-2">
                                        <Checkbox checked={isSigned} onCheckedChange={(checked) => setIsSigned(!!checked)} id="signed" />
                                        <label htmlFor="signed" className="text-xs cursor-pointer">Yes</label>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      <label className="text-[10px] font-black uppercase text-muted-foreground">Altered</label>
                                      <div className="flex items-center gap-2">
                                        <Checkbox checked={isAltered} onCheckedChange={(checked) => setIsAltered(!!checked)} id="altered" />
                                        <label htmlFor="altered" className="text-xs cursor-pointer">Yes</label>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      <label className="text-[10px] font-black uppercase text-muted-foreground">1st Ed.</label>
                                      <div className="flex items-center gap-2">
                                        <Checkbox checked={isFirstEdition} onCheckedChange={(checked) => setIsFirstEdition(!!checked)} id="first" />
                                        <label htmlFor="first" className="text-xs cursor-pointer">Yes</label>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Price (€)</label>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          placeholder="0.00"
                                          step="0.01"
                                          value={listingPrice}
                                          onChange={(e) => setListingPrice(e.target.value)}
                                          className="h-11 pr-8"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">€</span>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Quantity</label>
                                      <Input
                                        type="number"
                                        value={listingQuantity}
                                        onChange={(e) => setListingQuantity(e.target.value)}
                                        min="1"
                                        className="h-11"
                                      />
                                    </div>
                                  </div>

                                  {listingPrice && parseFloat(listingPrice) > 0 && (
                                    <div className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between text-xs font-bold uppercase tracking-tighter">
                                      <span className="text-muted-foreground">Market Fee (2%): -{(parseFloat(listingPrice) * 0.02).toFixed(2)}€</span>
                                      <span className="text-primary">Net Profit: {(parseFloat(listingPrice) * 0.98).toFixed(2)}€</span>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-6">
                                  <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Card Photo (Required)</label>
                                    <div className="relative group aspect-video">
                                      <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 overflow-hidden">
                                        {sellImagePreview ? (
                                          <img src={sellImagePreview} alt="Preview" className="h-full w-full object-contain p-2" />
                                        ) : (
                                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                              <Camera className="w-6 h-6 text-primary" />
                                            </div>
                                            <p className="mb-1 text-sm font-bold">Click to upload photo</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">Real photos increase trust by 400%</p>
                                          </div>
                                        )}
                                        <input
                                          type="file"
                                          className="hidden"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                setSellImagePreview(reader.result as string);
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                      </label>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">Additional Info</label>
                                    <textarea
                                      className="w-full h-32 rounded-xl border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                      placeholder="Centering, holo bleed, specific wear details..."
                                      value={listingDescription}
                                      onChange={(e) => setListingDescription(e.target.value)}
                                    />
                                  </div>

                                  <Button
                                    className="w-full h-12 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                                    onClick={handleListForSale}
                                    disabled={isListing || !selectedSellCard || !listingPrice}
                                  >
                                    {isListing ? (
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                      <>
                                        <Sparkles className="h-5 w-5 mr-2" />
                                        Confirm Listing
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="to-ship">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Orders to Ship</CardTitle>
                              <CardDescription>Track and manage your outgoing orders.</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {userSalesHistory.filter(s => s.status === "pending" || s.status === "shipped").map((sale) => (
                                  <div key={sale.id} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                          <Package className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                          <p className="font-bold">Order #{sale.id.slice(0, 8)}</p>
                                          <p className="text-xs text-muted-foreground font-medium">Buyer: {sale.buyerName || "User"}</p>
                                        </div>
                                      </div>
                                      <Badge className={sale.status === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"}>
                                        {sale.status === "pending" ? "Pending Shipment" : "Shipped"}
                                      </Badge>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2 p-3 bg-secondary/30 rounded-lg">
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Item Details</p>
                                        <p className="text-sm font-bold truncate">1x {sale.cardName} ({sale.cardSet})</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Revenue</p>
                                        <p className="text-sm font-bold">{(sale.price * 0.98).toFixed(2)}€ <span className="text-[10px] font-normal text-muted-foreground">(Net)</span></p>
                                      </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                      {sale.status === "pending" && (
                                        <Button size="sm" className="flex-1 gap-2 font-bold uppercase text-[10px] tracking-widest h-10">
                                          <Check className="h-4 w-4" />
                                          Mark as Shipped
                                        </Button>
                                      )}
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button size="sm" variant="outline" className="flex-1 gap-2 font-bold uppercase text-[10px] tracking-widest h-10">
                                            <Plus className="h-4 w-4" />
                                            {sale.trackingNumber ? "Edit Tracking" : "Add Tracking"}
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Tracking Information</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                              <label className="text-sm font-medium">Tracking Code</label>
                                              <Input placeholder="e.g., RR123456789ES" defaultValue={sale.trackingNumber || ""} />
                                            </div>
                                          </div>
                                          <DialogFooter>
                                            <Button>Save Tracking</Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  </div>
                                ))}
                                {userSalesHistory.filter(s => s.status === "pending" || s.status === "shipped").length === 0 && (
                                  <div className="py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                    <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <h3 className="font-bold text-lg">No orders to ship</h3>
                                    <p className="text-sm mt-2">When someone buys your cards, they'll appear here.</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="history">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Sales History</CardTitle>
                              <CardDescription>View your completed sales and earnings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {userSalesHistory.filter(s => s.status === "delivered" || s.status === "completed").map((sale) => (
                                  <div key={sale.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                      <Check className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-sm truncate">{sale.cardName}</p>
                                      <p className="text-xs text-muted-foreground font-medium">{new Date(sale.createdAt).toLocaleDateString()} • {sale.buyerName || "User"}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-black text-emerald-600">{sale.price.toFixed(2)}€</p>
                                      <Badge variant="secondary" className="text-[10px] h-4 bg-emerald-50 text-emerald-700">Delivered</Badge>
                                    </div>
                                  </div>
                                ))}
                                {userSalesHistory.filter(s => s.status === "delivered" || s.status === "completed").length === 0 && (
                                  <div className="py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                    <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <h3 className="font-bold text-lg">No sales history yet</h3>
                                    <p className="text-sm mt-2">Completed orders will be archived here.</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase italic">Edit Listing</DialogTitle>
                            <DialogDescription>Modify the details of your marketplace listing.</DialogDescription>
                          </DialogHeader>
                          {editingListing && (
                            <div className="grid gap-6 md:grid-cols-2 py-4">
                              <div className="space-y-4">
                                <div className="aspect-[3/4] max-h-[300px] bg-muted rounded-2xl overflow-hidden flex items-center justify-center p-4 bg-white shadow-inner border border-border/50">
                                  {editingListing.cardImage || editingListing.image || editingListing.card_image || editingListing.imageUrl ? (
                                    <img src={editingListing.cardImage || editingListing.image || editingListing.card_image || editingListing.imageUrl} alt="" className="h-full w-full object-contain" />
                                  ) : (
                                    <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-black text-xl">{editingListing.cardName}</h4>
                                  <p className="text-muted-foreground font-medium">{editingListing.cardSet}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Price (€)</label>
                                    <Input 
                                      type="number" 
                                      step="0.01" 
                                      value={editPrice} 
                                      onChange={(e) => setEditPrice(e.target.value)} 
                                      className="font-bold"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Quantity</label>
                                    <Input 
                                      type="number" 
                                      min="1" 
                                      value={editQuantity} 
                                      onChange={(e) => setEditQuantity(e.target.value)} 
                                      className="font-bold"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Condition</label>
                                    <Select value={editCondition} onValueChange={setEditCondition}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="M">Mint (M)</SelectItem>
                                        <SelectItem value="NM">Near Mint (NM)</SelectItem>
                                        <SelectItem value="LP">Light Played (LP)</SelectItem>
                                        <SelectItem value="MP">Moderately Played (MP)</SelectItem>
                                        <SelectItem value="HP">Heavily Played (HP)</SelectItem>
                                        <SelectItem value="PO">Poor (PO)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Language</label>
                                    <Select value={editLanguage} onValueChange={setEditLanguage}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="EN">🇺🇸 English</SelectItem>
                                        <SelectItem value="ES">🇪🇸 Spanish</SelectItem>
                                        <SelectItem value="FR">🇫🇷 French</SelectItem>
                                        <SelectItem value="DE">🇩🇪 German</SelectItem>
                                        <SelectItem value="IT">🇮🇹 Italian</SelectItem>
                                        <SelectItem value="PT">🇵🇹 Portuguese</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex items-center gap-2">
                                    <Checkbox checked={editReverse} onCheckedChange={(c) => setEditReverse(!!c)} id="edit-reverse" />
                                    <label htmlFor="edit-reverse" className="text-xs font-bold uppercase cursor-pointer">Reverse Holo</label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Checkbox checked={editFirstEdition} onCheckedChange={(c) => setEditFirstEdition(!!c)} id="edit-first" />
                                    <label htmlFor="edit-first" className="text-xs font-bold uppercase cursor-pointer">1st Edition</label>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Observations</label>
                                  <textarea 
                                    className="w-full h-24 rounded-lg border border-border bg-background p-3 text-sm resize-none focus:ring-2 focus:ring-primary/20"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Centering, scratches, etc..."
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateListing} disabled={isUpdating} className="font-black uppercase tracking-widest min-w-[120px]">
                              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders">
                  <div className="space-y-6">
                    <Tabs defaultValue="transit" className="w-full">
                      <TabsList className="mb-4 grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="transit" className="gap-2">
                          <Clock className="h-4 w-4" />
                          In Transit / Pending
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="gap-2">
                          <Check className="h-4 w-4" />
                          Completed
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="transit">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Orders on the Way</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {userOrders.filter(p => p.status !== "completed").map((order) => (
                                <div
                                  key={order.id}
                                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/20"
                                >
                                  <div className="flex h-16 w-12 items-center justify-center rounded bg-blue-500/10">
                                    <Package className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <h4 className="font-medium">{order.cardName || "Pokemon Card"}</h4>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                      <span>{order.cardSet}</span>
                                      <Badge variant="outline" className={order.status === "pending" ? "text-amber-600 border-amber-200" : "text-blue-600 border-blue-200"}>
                                        {order.status}
                                      </Badge>
                                      {order.trackingNumber && (
                                        <div className="flex items-center gap-1 font-mono text-[10px]">
                                          <ExternalLink className="h-3 w-3" />
                                          {order.trackingNumber}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <div className="text-right">
                                      <p className="text-lg font-bold">{order.totalPrice.toFixed(2)}€</p>
                                      <p className="text-xs text-muted-foreground">Ordered {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    {order.status === "shipped" && (
                                      <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                                        <Check className="h-4 w-4" />
                                        Confirm Receipt
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {userOrders.filter(p => p.status !== "completed").length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                  No orders in transit.
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="completed">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Order History</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {userOrders.filter(p => p.status === "completed").map((order) => (
                                <div
                                  key={order.id}
                                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 opacity-80"
                                >
                                  <div className="flex h-16 w-12 items-center justify-center rounded bg-emerald-500/10">
                                    <Check className="h-6 w-6 text-emerald-600" />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <h4 className="font-medium">{order.cardName}</h4>
                                    <p className="text-sm text-muted-foreground">{order.cardSet}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Received on {new Date(order.updatedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold">{order.totalPrice.toFixed(2)}€</p>
                                    <Button variant="link" size="sm" className="h-auto p-0">View Details</Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
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
                                      <SelectItem value="deck">From Deck (Synced)</SelectItem>
                                      <SelectItem value="collection">From Set (Missing Cards)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Default Language</label>
                                  <Select
                                    value={selectedLanguage}
                                    onValueChange={setSelectedLanguage}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select language..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="EN">🇺🇸 English</SelectItem>
                                      <SelectItem value="ES">🇪🇸 Spanish</SelectItem>
                                      <SelectItem value="JP">🇯🇵 Japanese</SelectItem>
                                      <SelectItem value="DE">🇩🇪 German</SelectItem>
                                      <SelectItem value="FR">🇫🇷 French</SelectItem>
                                      <SelectItem value="IT">🇮🇹 Italian</SelectItem>
                                      <SelectItem value="all">Any Language</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                {newListType === "deck" && (
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Select Deck</label>
                                    <Select
                                      onValueChange={(value) => setSelectedSourceId(value)}
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
                                    <label className="text-sm font-medium">Select Set</label>
                                    <Select
                                      onValueChange={(value) => setSelectedSourceId(value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a set..." />
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
                                        <div className="max-h-[200px] overflow-y-auto">
                                          {allSets
                                            .filter(set => (set.name.toLowerCase().includes(setSearchTerm.toLowerCase()) || set.id.toLowerCase().includes(setSearchTerm.toLowerCase())) && (user?.ownedEnglishCards?.some(id => id.startsWith(set.id))))
                                            .map(set => (
                                              <SelectItem key={set.id} value={set.id}>
                                                {set.name} ({set.id})
                                              </SelectItem>
                                            ))}
                                        </div>
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
                                <DropdownMenuItem className="gap-2" onClick={() => {
                                  if (confirm("Are you sure you want to delete this list?")) {
                                    handleDeleteList(selectedList.id);
                                  }
                                }}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                  <span className="text-red-500">Delete List</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="gap-2">
                                  <Plus className="h-4 w-4" />
                                  Add Card
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-xl">
                                <DialogHeader>
                                  <DialogTitle>Add Card to {selectedList.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="flex gap-2">
                                    <div className="relative flex-1">
                                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                      <Input
                                        placeholder="Search card by name..."
                                        value={wantsSearchQuery}
                                        onChange={(e) => setWantsSearchQuery(e.target.value)}
                                        className="pl-10"
                                      />
                                    </div>
                                    <Select value={wantsSelectedSet} onValueChange={setWantsSelectedSet}>
                                      <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All Sets" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <div className="p-2 border-b">
                                          <div className="relative">
                                            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                              placeholder="Search sets..."
                                              value={wantsSetSearchTerm}
                                              onChange={(e) => setWantsSetSearchTerm(e.target.value)}
                                              className="pl-8 h-8 text-xs"
                                              onKeyDown={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        </div>
                                        <div className="max-h-[200px] overflow-y-auto">
                                          <SelectItem value="all">All Sets</SelectItem>
                                          {allSets
                                            .filter(set => set.name.toLowerCase().includes(wantsSetSearchTerm.toLowerCase()) || set.id.toLowerCase().includes(wantsSetSearchTerm.toLowerCase()))
                                            .map(set => (
                                              <SelectItem key={set.id} value={set.id}>
                                                {set.name}
                                              </SelectItem>
                                            ))
                                          }
                                        </div>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="min-h-[200px] max-h-[400px] overflow-y-auto rounded-lg border border-border">
                                    {isSearchingWantsCards ? (
                                      <div className="flex items-center justify-center h-full py-10">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                      </div>
                                    ) : wantsSearchResults.length > 0 ? (
                                      <div className="divide-y divide-border">
                                        {wantsSearchResults.map((card) => (
                                          <div key={card.id} className="flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors">
                                            <div className="aspect-[3/4] h-12 bg-muted rounded overflow-hidden flex items-center justify-center">
                                              {card.images?.small ? (
                                                <img src={card.images.small} alt="" className="h-full w-full object-contain" />
                                              ) : (
                                                <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                                              )}
                                            </div>
                                            <div className="flex-1">
                                              <p className="font-bold text-sm">{card.name}</p>
                                              <p className="text-xs text-muted-foreground">{card.set?.name || card.set} - {card.number}</p>
                                            </div>
                                            <Button size="sm" onClick={() => handleAddToSpecificWantsList(card)}>
                                              <Plus className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center h-full py-10 text-muted-foreground text-sm">
                                        <Search className="h-10 w-10 mb-2 opacity-20" />
                                        <p>Search for a card to add it to your list.</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {selectedList.items.length > 0 ? (
                                [...selectedList.items].sort((a, b) => {
                                  if (a.set !== b.set) return a.set.localeCompare(b.set)
                                  const numA = parseInt(String(a.number).replace(/\\D/g, '')) || 0
                                  const numB = parseInt(String(b.number).replace(/\\D/g, '')) || 0
                                  return numA - numB
                                }).map((item: any) => (
                                  <div
                                    key={item.id}
                                    className={`flex items-center gap-4 rounded-lg border p-4 transition-all ${item.owned ? 'bg-muted/50 opacity-60' : 'bg-card'}`}
                                  >
                                    <button
                                      onClick={() => handleToggleOwned(selectedList.id.toString(), item.id.toString())}
                                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${item.owned ? 'border-accent bg-accent text-accent-foreground' : 'border-muted-foreground/30 hover:border-accent'}`}
                                    >
                                      {item.owned && <Check className="h-3 w-3" />}
                                    </button>
                                    <div className="aspect-[3/4] h-16 bg-muted rounded overflow-hidden flex items-center justify-center p-0.5 bg-white shadow-inner">
                                      {item.imageUrl || item.image ? (
                                        <img src={item.imageUrl || item.image} alt="" className="h-full w-full object-contain" />
                                      ) : (
                                        <ImageIcon className="h-6 w-6 text-muted-foreground/20" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3">
                                        <h4 className={`font-black text-lg ${item.owned ? 'line-through text-muted-foreground' : ''}`}>{item.name}</h4>
                                        <Badge variant="outline" className="text-[10px] font-bold">{item.number}</Badge>
                                        <span className="text-sm font-black text-primary bg-primary/5 px-2 py-0.5 rounded">x{item.count}</span>
                                      </div>
                                      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mt-1.5">
                                        <span className="hover:text-foreground transition-colors cursor-default">{item.set}</span>
                                        <span className="bg-secondary/80 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{item.condition}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Edit3 className="h-3 w-3 text-muted-foreground" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-xs">
                                          <DialogHeader>
                                            <DialogTitle>Edit Item</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                              <label className="text-xs font-bold uppercase">Quantity</label>
                                              <Input
                                                type="number"
                                                defaultValue={item.count}
                                                onChange={(e) => {
                                                  const newCount = parseInt(e.target.value);
                                                  if (newCount > 0) {
                                                    handleUpdateItem(selectedList.id, item.id, { count: newCount });
                                                  }
                                                }}
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <label className="text-xs font-bold uppercase">Condition</label>
                                              <Select
                                                defaultValue={item.condition}
                                                onValueChange={(val) => handleUpdateItem(selectedList.id, item.id, { condition: val })}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="Any">Any</SelectItem>
                                                  <SelectItem value="Mint">Mint</SelectItem>
                                                  <SelectItem value="Near Mint">Near Mint</SelectItem>
                                                  <SelectItem value="Excellent">Excellent</SelectItem>
                                                  <SelectItem value="Light Played">Light Played</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
                                        onClick={() => handleRemoveFromList(selectedList.id, item.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="py-12 text-center text-muted-foreground">
                                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                  <p>No cards in this list yet.</p>
                                  <Button variant="link" className="gap-2" onClick={handleRunWizard}>
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    Run Shopping Wizard
                                  </Button>
                                </div>
                              )}
                            </div>

                            {selectedList.items.length > 0 && (
                              <div className="mt-8 pt-6 border-t border-border">
                                <Button size="lg" className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-orange-500/20" onClick={handleRunWizard}>
                                  <Sparkles className="h-5 w-5" />
                                  Run Shopping Wizard
                                </Button>
                                <p className="text-center text-xs text-muted-foreground mt-3">
                                  Find the best combination of sellers to get all your cards at the best price.
                                </p>
                              </div>
                            )}
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
                    <div className="lg:col-span-2 space-y-6">
                      {cartItems.length > 0 ? (() => {
                        // Group items by seller
                        const groupedBySeller: Record<string, { sellerId: string, sellerName: string, country: string, items: any[] }> = {};
                        cartItems.forEach(item => {
                          const sellerId = item.sellerId || 'unknown';
                          if (!groupedBySeller[sellerId]) {
                            groupedBySeller[sellerId] = {
                              sellerId: sellerId,
                              sellerName: item.sellerName || item.seller || 'Unknown Seller',
                              country: item.sellerCountry || 'ES',
                              items: []
                            };
                          }
                          groupedBySeller[sellerId].items.push(item);
                        });

                        return Object.values(groupedBySeller).map(sellerGroup => {
                          const sellerSubtotal = sellerGroup.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                          const shippingInfo = shippingPrices[sellerGroup.country] || shippingPrices['ES'];
                          const isCertifiedForced = sellerSubtotal > 50;
                          
                          return (
                            <Card key={sellerGroup.sellerId} className="overflow-hidden border-none shadow-md bg-card/50">
                              <CardHeader className="bg-secondary/20 py-3 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{shippingInfo.flag}</span>
                                  <div>
                                    <h3 className="font-bold text-sm uppercase tracking-tight">{sellerGroup.sellerName}</h3>
                                    <p className="text-[10px] text-muted-foreground font-medium">{shippingInfo.name}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-muted-foreground uppercase">Seller Subtotal</p>
                                    <p className="text-lg font-black text-primary">{sellerSubtotal.toFixed(2)}€</p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                                    onClick={() => handleClearSellerCart(sellerGroup.sellerId)}
                                    title="Remove all items from this seller"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="p-0">
                                <div className="divide-y divide-border/50">
                                  {sellerGroup.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-4 hover:bg-secondary/5 transition-colors">
                                      <div className="aspect-[3/4] h-20 bg-white rounded-md shadow-sm overflow-hidden p-0.5 flex items-center justify-center">
                                        {item.image || item.cardImage || item.card_image || item.imageUrl ? (
                                          <img src={item.image || item.cardImage || item.card_image || item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                                        ) : (
                                          <ImageIcon className="h-6 w-6 text-muted-foreground/20" />
                                        )}
                                      </div>
                                      <div className="flex-1 flex flex-col justify-between py-1">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <h4 className="font-black text-base tracking-tight">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground font-medium">{item.set}</p>
                                            <div className="mt-1.5 flex items-center gap-2">
                                              <Badge className={`${getConditionColor(item.condition)} border-none font-bold text-[10px] px-1.5 py-0 rounded-full`}>
                                                {item.condition}
                                              </Badge>
                                              <div className="flex items-center gap-1 bg-secondary/80 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                {getLanguageFlag(item.language)} {item.language}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-black text-lg">{item.price.toFixed(2)}€</p>
                                            <p className="text-[10px] text-muted-foreground">Each</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                          <div className="flex items-center gap-3 bg-background/50 rounded-full border border-border p-1">
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary"
                                              onClick={() => handleUpdateCartQuantity(item.id, -1)}
                                            >
                                              <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary"
                                              onClick={() => handleUpdateCartQuantity(item.id, 1)}
                                            >
                                              <Plus className="h-3 w-3" />
                                            </Button>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/5 gap-1.5 text-[10px] font-black uppercase tracking-widest"
                                            onClick={() => handleRemoveFromCart(item.id)}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                            Remove
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="p-4 bg-secondary/10 border-t border-border flex items-center justify-between">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Shipping Method</label>
                                    {isCertifiedForced ? (
                                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                        <Check className="h-3 w-3" />
                                        Certified Shipping (Required for orders &gt;50€)
                                      </div>
                                    ) : (
                                      <Select
                                        value={sellerShippingMethod[sellerGroup.sellerId] || 'ordinary'}
                                        onValueChange={(val) => setSellerShippingMethod(prev => ({ ...prev, [sellerGroup.sellerId]: val as 'ordinary' | 'certified' }))}
                                      >
                                        <SelectTrigger className="h-8 w-48 text-xs font-bold bg-background">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="ordinary">Ordinary Shipping ({shippingInfo.min.toFixed(2)}€)</SelectItem>
                                          <SelectItem value="certified">Certified Shipping ({shippingInfo.max.toFixed(2)}€)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Shipping Price</p>
                                    <p className="text-base font-black">{(isCertifiedForced ? shippingInfo.max : (sellerShippingMethod[sellerGroup.sellerId] === 'certified' ? shippingInfo.max : shippingInfo.min)).toFixed(2)}€</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        });
                      })() : (
                        <Card className="flex flex-col items-center justify-center py-24 text-center border-dashed">
                          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
                            <ShoppingCart className="h-10 w-10 text-muted-foreground/20" />
                          </div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter">Your cart is empty</h3>
                          <p className="text-muted-foreground mt-2 max-w-xs">Looks like you haven't added any cards yet. Time to hunt for some grails!</p>
                          <Button className="mt-8 px-8 h-12 font-black uppercase tracking-widest shadow-xl shadow-primary/20" onClick={() => setActiveTab("buy")}>
                            Start Shopping
                          </Button>
                        </Card>
                      )}
                    </div>
                    <div className="lg:col-span-1">
                      <Card className="sticky top-24 shadow-2xl border-primary/10 overflow-hidden">
                        <div className="h-2 bg-primary w-full" />
                        <CardHeader>
                          <CardTitle className="font-black uppercase tracking-tighter text-xl italic flex justify-between items-center">
                            Checkout Summary
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive text-[10px] h-6 px-2"
                              onClick={handleClearCart}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Clear Cart
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm font-medium">
                              <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-black">Subtotal ({cartItems.length} items)</span>
                              <span className="font-bold">{cartTotal.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium">
                              <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-black">Total Shipping</span>
                              <span className="font-bold">
                                {(() => {
                                   const grouped: Record<string, string> = {};
                                   cartItems.forEach(item => { grouped[item.sellerId || 'unknown'] = item.sellerCountry || 'ES'; });
                                   return Object.entries(grouped).reduce((total, [sid, country]) => {
                                     const sellerItems = cartItems.filter(i => (i.sellerId || 'unknown') === sid);
                                     const subtotal = sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
                                     const sinfo = shippingPrices[country] || shippingPrices['ES'];
                                     const isCertified = subtotal > 50 || sellerShippingMethod[sid] === 'certified';
                                     return total + (isCertified ? sinfo.max : sinfo.min);
                                   }, 0).toFixed(2);
                                 })()}€
                              </span>
                            </div>
                          </div>
                          
                          <Separator className="bg-border/50" />
                          
                          <div className="flex justify-between items-end">
                            <span className="text-lg font-black uppercase tracking-tighter italic">Total Payable</span>
                            <span className="text-4xl font-black text-primary tracking-tighter">
                              {(() => {
                                const grouped: Record<string, string> = {};
                                cartItems.forEach(item => { grouped[item.sellerId || 'unknown'] = item.sellerCountry || 'ES'; });
                                const ship = Object.entries(grouped).reduce((total, [sid, country]) => {
                                  const sellerItems = cartItems.filter(i => (i.sellerId || 'unknown') === sid);
                                  const subtotal = sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
                                  const sinfo = shippingPrices[country] || shippingPrices['ES'];
                                  const isCertified = subtotal > 50 || sellerShippingMethod[sid] === 'certified';
                                  return total + (isCertified ? sinfo.max : sinfo.min);
                                }, 0);
                                return (cartTotal + ship).toFixed(2);
                              })()}€
                            </span>
                          </div>
                          
                          <div className="pt-4 space-y-3">
                            <Button className="w-full h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 group relative overflow-hidden" size="lg">
                              <span className="relative z-10 flex items-center gap-2">
                                Complete Purchase
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground uppercase font-medium">
                              Secure checkout powered by TCG Temple Pay
                            </p>
                          </div>
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
                    <h3 className="text-xl font-bold">Sign in to sell cards</h3>
                    <p className="text-muted-foreground mb-6">You must be logged in to create listings and manage your sales.</p>
                    <Button onClick={() => setActiveTab("buy")}>Go to Buy</Button>
                  </div>
                </TabsContent>
                <TabsContent value="wants">
                  <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold">Sign in to view your wants list</h3>
                    <p className="text-muted-foreground mb-6">Save the cards you want to track their price and availability.</p>
                    <Button onClick={() => setActiveTab("buy")}>Explore Cards</Button>
                  </div>
                </TabsContent>
                <TabsContent value="cart">
                  <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold">Your cart is waiting</h3>
                    <p className="text-muted-foreground mb-6">Sign in to add cards to your cart and complete your order.</p>
                    <Button onClick={() => setActiveTab("buy")}>Start Shopping</Button>
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
