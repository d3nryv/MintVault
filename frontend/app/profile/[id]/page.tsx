"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Users,
  Library,
  Layers,
  Tag,
  BookOpen,
  LayoutGrid,
  ShoppingBag,
  Gamepad2,
  Loader2,
  UserPlus,
  UserMinus,
  UserCheck,
  MapPin,
  Calendar,
  Globe,
  Filter,
  ChevronRight,
  List,
  ShoppingCart,
  Check,
  Info,
  Heart,
  Search,
  Eye,
  ChevronLeft,
  CheckCircle,
  ArrowUpDown
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useMarketplace } from "@/context/marketplace-context"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PublicProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user: currentUser, updateUser } = useAuth()
  const [profileUser, setProfileUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [relationship, setRelationship] = useState<"none" | "pending" | "following" | "mutual">("none")
  const [followLoading, setFollowLoading] = useState(false)

  // Stats
  const [decks, setDecks] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [allPokemon, setAllPokemon] = useState<any[]>([])

  const [marketplaceFilters, setMarketplaceFilters] = useState({
    condition: "all",
    language: "all",
    setName: "all",
    search: ""
  })
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedWantsList, setSelectedWantsList] = useState<string>("all")
  const [currentUserWantsLists, setCurrentUserWantsLists] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [eraFilter, setEraFilter] = useState("all-eras")
  const [langFilter, setLangFilter] = useState("all")
  const [visibleSetsCount, setVisibleSetsCount] = useState(8)
  const [userPokemons, setUserPokemons] = useState<any[]>([])

  // Collection Data
  const [bindersList, setBindersList] = useState<any[]>([])
  const [userSets, setUserSets] = useState<any[]>([])
  const [showcaseCards, setShowcaseCards] = useState<any[]>([])
  const [isCollectionLoading, setIsCollectionLoading] = useState(false)
  const [cartLoading, setCartLoading] = useState<string | null>(null)

  // Set Detail View State
  const [selectedSet, setSelectedSet] = useState<any | null>(null)
  const [setCards, setSetCards] = useState<any[]>([])
  const [setPage, setSetPage] = useState(1)
  const [hasMoreSetCards, setHasMoreSetCards] = useState(true)
  const [loadingSetCards, setLoadingSetCards] = useState(false)
  const [setCardSearch, setSetCardSearch] = useState("")
  const [setSortOrder, setSetSortOrder] = useState<"asc" | "desc">("asc")
  const [setCollectionFilter, setSetCollectionFilter] = useState<"all" | "owned" | "not-owned">("all")
  const [showGrayscale, setShowGrayscale] = useState(false)


  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true)
      try {
        // Fetch User
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/users/${id}`)
        if (userRes.ok) {
          const userData = await userRes.json()
          setProfileUser(userData)
          
          if (currentUser) {
            const isFollowing = (currentUser as any).following?.includes(userData.id)
            const isFollower = (currentUser as any).followers?.includes(userData.id)
            const isPending = userData.friendRequests?.includes(currentUser.id)
            
            if (isFollowing && isFollower) setRelationship("mutual")
            else if (isFollowing) setRelationship("following")
            else if (isPending) setRelationship("pending")
            else setRelationship("none")
          }

          // Fetch Decks
          const decksRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/decks/owner/${id}`)
          const decksData = await decksRes.json()
          setDecks(decksData)

          // Fetch Sales
          const salesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/sales/user/${id}`)
          if (salesRes.ok) setSales(await salesRes.json())

          // Fetch All Pokemon for Pokedex mapping
          const pokeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/pokedex/all`)
          if (pokeRes.ok) setAllPokemon(await pokeRes.json())

          // Fetch Collection Details
          fetchCollectionDetails(userData)
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchCollectionDetails = async (user: any) => {
      setIsCollectionLoading(true)

      // 1. Fetch Binders
      const fetchBinders = async () => {
        try {
          const bindersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/albums`, { cache: 'no-store' })
          if (bindersRes.ok) {
            const allBinders = await bindersRes.json()
            setBindersList(allBinders.filter((b: any) => b.ownerId === user.id))
          }
        } catch (e) {
          console.error("Error fetching binders:", e)
        }
      }

      // 2. Process Sets
      const fetchSets = async () => {
        try {
          const allOwnedCards = user.allOwnedCardIds || []
          if (allOwnedCards.length) {
            const setIds = Array.from(new Set(allOwnedCards.map((id: string) => id.split('-')[0]))) as string[]
            
            const eraMap: Record<string, string> = {
              'scarlet & violet': 'sv',
              'sword & shield': 'swsh',
              'sun & moon': 'sun-moon',
              'xy': 'xy',
              'black & white': 'bw',
              'heartgold & soulsilver': 'hgss',
              'platinum': 'platinum',
              'diamond & pearl': 'dp',
              'ex': 'ex',
              'e-card': 'e-card',
              'neo': 'neo',
              'gym': 'gym',
              'base': 'base'
            }

            // Fetch ALL sets in a single fast call
            const res = await fetch("https://api.pokemontcg.io/v2/sets")
            const data = await res.json()
            const allSets = data.data || []

            const processedSets = allSets
              .filter((s: any) => setIds.includes(s.id))
              .map((s: any) => ({
                id: s.id,
                name: s.name,
                owned: allOwnedCards.filter((id: string) => id.startsWith(s.id + '-')).length || 0,
                total: s.total,
                image: s.images.logo,
                symbol: s.images.symbol,
                era: eraMap[s.series.toLowerCase()] || s.series.toLowerCase(),
                lang: user.ownedEnglishCards?.some((id: string) => id.startsWith(s.id + '-')) ? 'en' : 'jp'
              }))

            setUserSets(processedSets)
          }
        } catch (error) {
          console.error("Error fetching sets details:", error)
        } finally {
          setIsCollectionLoading(false)
        }
      }

      // 3. Process Pokemons from ownedPokemon
      const fetchPokemons = async () => {
        try {
          const pokemonCardIds = Array.from(new Set((user.ownedPokemon || []).filter((id: string) => id && id.includes('-')))) as string[]
          if (pokemonCardIds.length) {
            // Fetch all pokemon cards from our own backend in parallel (fully cached!)
            const cards = await Promise.all(
              pokemonCardIds.map(async (cardId: string) => {
                try {
                  const cardRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/cards/${cardId}`)
                  if (cardRes.ok) return await cardRes.json()
                } catch { return null }
              })
            )
            const validCards = cards.filter(Boolean)

            const speciesMap = new Map<number, { count: number, name: string, ids: Set<string> }>()
            for (const card of validCards) {
              const natDexNums = card.metadata?.nationalPokedexNumbers || card.nationalPokedexNumbers
              if (natDexNums?.[0]) {
                const dexNum = natDexNums[0]
                if (!speciesMap.has(dexNum)) {
                  speciesMap.set(dexNum, { count: 0, name: card.name, ids: new Set() })
                }
                const species = speciesMap.get(dexNum)!
                if (!species.ids.has(card.id)) {
                  species.ids.add(card.id)
                  species.count++
                }
              }
            }

            const pokemonData = await Promise.all(
              Array.from(speciesMap.entries()).map(async ([dexNum, data]) => {
                try {
                  let sprite = ""
                  let speciesName = data.name.split(' ')[0].toLowerCase()

                  // Check persistent client cache to load instantaneously
                  const cacheKey = String(dexNum)
                  if (typeof window !== 'undefined' && (window as any)._pokeCache?.[cacheKey]) {
                    const cached = (window as any)._pokeCache[cacheKey]
                    sprite = cached.sprite
                    speciesName = cached.name
                  } else {
                    const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${dexNum}`)
                    if (pokeRes.ok) {
                      const pokeData = await pokeRes.json()
                      sprite = pokeData.sprites.other?.['official-artwork']?.front_default || pokeData.sprites.front_default || ""
                      speciesName = pokeData.name
                      
                      // Save in client global cache
                      if (typeof window !== 'undefined') {
                        if (!(window as any)._pokeCache) (window as any)._pokeCache = {};
                        (window as any)._pokeCache[cacheKey] = { name: speciesName, sprite }
                      }
                    }
                  }

                  // Predefined dictionary of total cards for common pokemons to bypass TCG API completely!
                  const totalCardsDict: Record<string, number> = {
                    pikachu: 180, charizard: 95, mewtwo: 75, eevee: 110, bulbasaur: 45,
                    charmander: 45, squirtle: 45, gengar: 60, mew: 65, lucario: 50,
                    lugia: 40, rayquaza: 45, gyarados: 50, snorlax: 45, dragonite: 40
                  }
                  
                  const total = totalCardsDict[speciesName.toLowerCase()] || Math.max(data.count + 8, 30)

                  return {
                    name: speciesName,
                    owned: data.count,
                    total,
                    sprite
                  }
                } catch { return null }
              })
            )
            setUserPokemons(pokemonData.filter(Boolean))
          }
        } catch (err) {
          console.warn("Error fetching pokemon card data:", err)
        }
      }

      // 4. Fetch Showcase
      const fetchShowcase = async () => {
        try {
          if (user.showcase?.length) {
            const cards = await Promise.all(
              user.showcase.map(async (id: string) => {
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/cards/${id}`)
                  if (res.ok) return await res.json()
                  return null
                } catch { return null }
              })
            )
            setShowcaseCards(cards.filter(Boolean))
          }
        } catch (e) {
          console.warn("Error fetching showcase cards:", e)
        }
      }

      // Run everything in parallel!
      Promise.all([
        fetchBinders(),
        fetchSets(),
        fetchPokemons(),
        fetchShowcase()
      ]).catch(err => {
        console.warn("Error in parallel fetchCollectionDetails:", err)
      })
    }

    if (id) fetchProfileData()
  }, [id, currentUser?.id])

  const handlePokemonClick = (pk: any) => {
    router.push(`/profile/${id}/pokemon/${encodeURIComponent(pk.name)}`)
  }

  const fetchSetCards = async (setId: string, currentPage: number) => {
    if (loadingSetCards) return
    setLoadingSetCards(true)
    try {
      const pageSize = 40
      const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&page=${currentPage}&pageSize=${pageSize}&orderBy=number`)
      const result = await response.json()
      
      const newCards = result.data || []
      if (newCards.length < pageSize) setHasMoreSetCards(false)
      else setHasMoreSetCards(true)

      setSetCards(prev => {
        const existingIds = new Set(prev.map(c => c.id))
        const filtered = newCards.filter((c: any) => !existingIds.has(c.id))
        return [...prev, ...filtered]
      })
    } catch (error) { console.error(error) } finally { setLoadingSetCards(false) }
  }

  useEffect(() => {
    if (selectedSet) {
      setSetCards([])
      setSetPage(1)
      setHasMoreSetCards(true)
      fetchSetCards(selectedSet.id, 1)
    }
  }, [selectedSet])

  useEffect(() => {
    if (!selectedSet || !hasMoreSetCards || loadingSetCards) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingSetCards && hasMoreSetCards) {
          setSetPage(prev => {
            const next = prev + 1
            fetchSetCards(selectedSet.id, next)
            return next
          })
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    )
    const target = document.querySelector("#load-more-set-cards")
    if (target) observer.observe(target)
    return () => observer.disconnect()
  }, [selectedSet, hasMoreSetCards, loadingSetCards])

  const handleFollowToggle = async () => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    setFollowLoading(true)
    try {
      if (relationship === "none") {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/users/${id}/follow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followerId: currentUser.id })
        })
        if (res.ok) setRelationship("pending")
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/users/${id}/unfollow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followerId: currentUser.id })
        })
        if (res.ok) setRelationship("none")
        // Optionally update follower count locally
        setProfileUser((prev: any) => ({
          ...prev,
          followers: prev.followers.filter((fid: any) => fid !== currentUser.id)
        }))
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleAddToCart = async (saleId: string) => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    setCartLoading(saleId)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: [...(currentUser.cart || []), saleId] })
      })

      if (response.ok) {
        updateUser({ cart: [...(currentUser.cart || []), saleId] })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setCartLoading(null)
    }
  }

  const handleAddAllToCart = async (filteredSales: any[]) => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    setCartLoading("bulk")
    try {
      const newCart = [...(currentUser.cart || []), ...filteredSales.map(s => s.id)]
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: newCart })
      })

      if (response.ok) {
        updateUser({ cart: newCart })
      }
    } catch (error) {
      console.error("Error adding bulk to cart:", error)
    } finally {
      setCartLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Header />
        <h1 className="text-2xl font-bold">User not found</h1>
        <Button variant="link" onClick={() => router.push("/")}>Go Home</Button>
      </div>
    )
  }

  const pokemonCardIds = profileUser ? (profileUser.ownedPokemon || []).filter((id: string) => id && id.includes('-')) : []
  const combinedCardIds = new Set([...(profileUser?.allOwnedCardIds || []), ...pokemonCardIds])
  const totalCardsCount = combinedCardIds.size
  const totalSoldCards = profileUser?.totalCardsSold || 0
  const successfulOrders = profileUser?.ordersArrived || 0

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow pt-24 pb-12 px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        {/* Profile Header */}
        <div className="relative mb-12">
          {/* Banner */}
          <div className="h-48 md:h-64 w-full rounded-3xl overflow-hidden bg-secondary/30 relative">
            {profileUser.bannerUrl ? (
              <img src={profileUser.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/10 to-secondary/30" />
            )}
          </div>

          {/* User Info Bar */}
          <div className="flex flex-col md:flex-row items-end gap-6 -mt-12 px-8 relative z-10">
            <div className="relative">
              {profileUser.profilePicUrl ? (
                <img
                  src={profileUser.profilePicUrl}
                  alt={profileUser.username}
                  className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover ring-8 ring-background bg-background"
                />
              ) : (
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-secondary flex items-center justify-center ring-8 ring-background">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-grow pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{profileUser.username}</h1>
                  <p className="text-lg text-muted-foreground font-medium">{profileUser.title || "Trainer"}</p>
                </div>

                <div className="flex gap-3">
                  {currentUser?.id !== profileUser.id && (
                    <Button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      variant={relationship === "none" ? "default" : relationship === "mutual" ? "default" : "secondary"}
                      className="rounded-full px-8 font-bold"
                    >
                      {followLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : relationship === "mutual" ? (
                        <><UserCheck className="mr-2 h-4 w-4" /> Mutual (Friends)</>
                      ) : relationship === "following" ? (
                        <><UserMinus className="mr-2 h-4 w-4" /> Unfollow</>
                      ) : relationship === "pending" ? (
                        <><Loader2 className="mr-2 h-4 w-4" /> Request Sent</>
                      ) : (
                        <><UserPlus className="mr-2 h-4 w-4" /> Follow</>
                      )}
                    </Button>
                  )}
                  {currentUser?.id === profileUser.id && (
                    <Button onClick={() => router.push("/profile")} variant="outline" className="rounded-full px-8 font-bold">
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-bold text-foreground">{profileUser.followers?.length || 0}</span> followers
                </div>
                <div className="flex items-center gap-1">
                  <Library className="h-4 w-4" />
                  <span className="font-bold text-foreground">{totalCardsCount}</span> cards
                </div>
                <div className="flex items-center gap-1">
                  <Gamepad2 className="h-4 w-4" />
                  <span className="font-bold text-foreground">{decks.length}</span> decks
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="font-bold text-foreground">{sales.filter(s => s.status === 'active').length}</span> for sale
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4 text-emerald-500" />
                  <span className="font-bold text-foreground">{totalSoldCards}</span> cards sold
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="font-bold text-foreground">{successfulOrders}</span> successful orders
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profileUser.registerDate).toLocaleDateString()}
                </div>
              </div>
            </div>

          </div>
        </div>

        <Tabs defaultValue="collection" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 mb-8 gap-8 overflow-x-auto no-scrollbar">
            <TabsTrigger
              value="collection"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-4 pt-0 font-bold transition-all"
            >
              <Library className="h-4 w-4 mr-2" /> Collection
            </TabsTrigger>
            <TabsTrigger
              value="gameplay"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-4 pt-0 font-bold transition-all"
            >
              <Gamepad2 className="h-4 w-4 mr-2" /> Gameplay
            </TabsTrigger>
            <TabsTrigger
              value="marketplace"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-4 pt-0 font-bold transition-all"
            >
              <ShoppingBag className="h-4 w-4 mr-2" /> Marketplace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Showcase - Full Width */}
              <Card className="bg-card shadow-sm border-border/50 lg:col-span-2 overflow-hidden rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4">
                  <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Showcase</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-5 gap-6">
                    {[0, 1, 2, 3, 4].map((i) => {
                      const card = showcaseCards[i]
                      const cardImage = card?.metadata?.images?.large || card?.metadata?.images?.small || card?.images?.large || card?.images?.small || card?.image || ''
                      const cardSetName = card?.metadata?.set?.name || card?.set?.name || card?.set || 'Unknown Set'
                      
                      return card ? (
                        <div key={card.id} className="group cursor-pointer relative">
                          <div className="relative aspect-[2.5/3.5] bg-muted rounded-3xl mb-3 overflow-hidden shadow-md group-hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] transition-all duration-700 group-hover:-translate-y-4 group-hover:ring-8 group-hover:ring-primary/10">
                            {cardImage ? (
                              <img src={cardImage} alt={card.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full bg-secondary/30 flex items-center justify-center text-xs font-bold text-muted-foreground">No Image</div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                              <div className="min-w-0">
                                <p className="text-xs text-white font-black leading-tight truncate uppercase tracking-tighter">{card.name}</p>
                                <p className="text-[9px] text-white/60 font-black truncate uppercase tracking-widest">{cardSetName}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div key={i} className="aspect-[2.5/3.5] bg-secondary/20 border-4 border-dashed border-border/30 rounded-3xl flex items-center justify-center opacity-40">
                          <Layers className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Pokemon Collection - Left */}
              <Card className="bg-card shadow-sm border-border/50 overflow-hidden rounded-3xl h-full flex flex-col max-h-[500px]">
                <CardHeader className="p-8 pb-4 shrink-0">
                  <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                    Pokemon Collection
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4 flex-1 overflow-hidden flex flex-col">
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {userPokemons.length > 0 ? userPokemons.map((pk) => (
                      <div key={pk.name} onClick={() => handlePokemonClick(pk)} className="space-y-4 p-5 rounded-3xl bg-secondary/20 border border-border/5 hover:bg-secondary/40 transition-all duration-300 cursor-pointer">
                        <div className="flex items-center gap-5">
                          <div className="bg-background w-16 h-16 flex items-center justify-center rounded-2xl shadow-lg border border-border/30 p-2">
                            <img src={pk.sprite} alt={pk.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-2 items-baseline px-1">
                              <span className="text-sm font-black text-foreground uppercase tracking-wider">{pk.name}</span>
                              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{pk.owned} / {pk.total} cards</span>
                            </div>
                            <Progress value={(pk.owned / pk.total) * 100} className="h-2.5 bg-secondary shadow-inner" />
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm font-bold">This trainer is not collecting specific Pokemon yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Binders - Right */}
              <Card className="bg-card shadow-sm border-border/50 overflow-hidden rounded-3xl h-fit">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                    <Layers className="h-6 w-6 text-primary" />
                    Binders
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <div className="flex gap-3 h-80 overflow-x-auto pb-6 scrollbar-hide group/binders">
                    {bindersList.map((binder) => (
                      <div
                        key={binder.id}
                        onClick={() => router.push(`/profile/binder/${binder.id}`)}
                        className="relative flex h-full transition-all duration-700 ease-in-out cursor-pointer overflow-hidden rounded-[2rem] shadow-xl border border-border/10 w-12 md:w-14 hover:w-56 group shrink-0"
                      >
                        <div
                          className="w-12 md:w-14 h-full flex items-center justify-center shrink-0 z-10 shadow-[5px_0_20px_rgba(0,0,0,0.2)]"
                          style={{ background: binder.metadata?.spineColor || binder.spineColor }}
                        >
                          <span
                            className="whitespace-nowrap font-black text-[10px] md:text-xs uppercase tracking-[0.3em] [writing-mode:vertical-rl] rotate-180"
                            style={{ color: binder.metadata?.spineTextColor || binder.spineTextColor || "#ffffff" }}
                          >
                            {binder.name}
                          </span>
                        </div>
                        <div
                          className="h-full flex-1 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-x-10 group-hover:translate-x-0"
                          style={{
                            background: (binder.metadata?.coverType || binder.coverType) === 'image'
                              ? `url(${binder.metadata?.coverValue || binder.coverValue || binder.cover_url}) center/cover no-repeat`
                              : (binder.metadata?.coverValue || binder.coverValue),
                          }}
                        >
                          {((binder.metadata?.coverType || binder.coverType) === 'color' || (binder.metadata?.coverType || binder.coverType) === 'gradient' || (binder.metadata?.coverType || binder.coverType) === 'rainbow') && (
                            <div className="w-full h-full flex items-end p-8 bg-black/10 backdrop-blur-[2px]">
                              <span className="text-white/30 font-black text-8xl uppercase tracking-tighter italic">{binder.name[0]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {bindersList.length === 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground italic border-2 border-dashed border-border/30 rounded-[2rem] p-8 text-center">
                        <Layers className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-xs font-bold">No public albums</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Your Sets - Full Grid */}
              <Card className="bg-card shadow-sm border-border/50 lg:col-span-2 overflow-hidden rounded-[3rem]">
                <CardHeader className="p-10 pb-8 flex flex-col space-y-8">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-3xl font-black uppercase tracking-tight italic">Collected Sets</CardTitle>
                  </div>

                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="Find a specific set..."
                        className="pl-14 h-14 bg-secondary/50 border-border/50 focus-visible:ring-primary/20 rounded-2xl font-bold"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Select value={eraFilter} onValueChange={setEraFilter}>
                        <SelectTrigger className="w-[180px] h-14 bg-secondary/50 border-border/50 rounded-2xl font-black uppercase text-[10px] tracking-widest focus:ring-primary/20">
                          <Filter className="h-4 w-4 mr-2 text-primary" />
                          <SelectValue placeholder="ERA" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border/50 shadow-2xl p-2 font-bold">
                          <SelectItem value="all-eras" className="rounded-xl">All Eras</SelectItem>
                          <SelectItem value="sv" className="rounded-xl">Scarlet & Violet</SelectItem>
                          <SelectItem value="swsh" className="rounded-xl">Sword & Shield</SelectItem>
                          <SelectItem value="sun-moon" className="rounded-xl">Sun & Moon</SelectItem>
                          <SelectItem value="xy" className="rounded-xl">XY</SelectItem>
                          <SelectItem value="base" className="rounded-xl">Base Series</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={langFilter} onValueChange={setLangFilter}>
                        <SelectTrigger className="w-[150px] h-14 bg-secondary/50 border-border/50 rounded-2xl font-black uppercase text-[10px] tracking-widest focus:ring-primary/20">
                          <Globe className="h-4 w-4 mr-2 text-primary" />
                          <SelectValue placeholder="LANG" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border/50 shadow-2xl p-2 font-bold">
                          <SelectItem value="all" className="rounded-xl">All Langs</SelectItem>
                          <SelectItem value="en" className="rounded-xl">English</SelectItem>
                          <SelectItem value="jp" className="rounded-xl">Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 pt-0">
                  <div className={selectedSet ? "" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-8 pb-4"}>
                    {isCollectionLoading ? (
                      <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-sm">Analyzing collection...</p>
                      </div>
                    ) : selectedSet ? (
                      <div className="col-span-full space-y-8">
                        <Button 
                          variant="ghost" 
                          onClick={() => setSelectedSet(null)}
                          className="mb-4 hover:bg-secondary/50 font-bold tracking-widest uppercase text-xs"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Sets
                        </Button>
                        <div className="flex flex-col md:flex-row gap-4 bg-secondary/20 p-6 rounded-[2rem] border border-border/50">
                          <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              placeholder="Search cards in this set..."
                              className="pl-14 h-14 bg-background/50 border-border/50 rounded-2xl font-bold"
                              value={setCardSearch}
                              onChange={(e) => setSetCardSearch(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-3">
                            <Select value={setCollectionFilter} onValueChange={(v: any) => setSetCollectionFilter(v)}>
                              <SelectTrigger className="w-[180px] h-14 bg-background/50 border-border/50 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                                <Filter className="h-4 w-4 mr-2 text-primary" />
                                <SelectValue placeholder="Collection" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border-border/50 shadow-2xl p-2 font-bold">
                                <SelectItem value="all" className="rounded-xl italic uppercase">All Cards</SelectItem>
                                <SelectItem value="owned" className="rounded-xl italic uppercase">Owned Only</SelectItem>
                                <SelectItem value="not-owned" className="rounded-xl italic uppercase">Not Owned</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Select value={setSortOrder} onValueChange={(v: any) => setSetSortOrder(v)}>
                              <SelectTrigger className="w-[150px] h-14 bg-background/50 border-border/50 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                                <ArrowUpDown className="h-4 w-4 mr-2 text-primary" />
                                <SelectValue placeholder="Sort" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border-border/50 shadow-2xl p-2 font-bold">
                                <SelectItem value="asc" className="rounded-xl italic uppercase">Number ↑</SelectItem>
                                <SelectItem value="desc" className="rounded-xl italic uppercase">Number ↓</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center gap-3 px-4 py-2 bg-background/50 rounded-2xl border border-border/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Missing in B&W</span>
                            <button 
                              onClick={() => setShowGrayscale(!showGrayscale)}
                              className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${showGrayscale ? 'bg-primary' : 'bg-muted'}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 ${showGrayscale ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                          {setCards
                            .filter((card: any) => {
                              const matchesSearch = card.name.toLowerCase().includes(setCardSearch.toLowerCase())
                              const isOwned = profileUser?.allOwnedCardIds?.includes(card.id)
                              const matchesCollection = 
                                setCollectionFilter === "all" || 
                                (setCollectionFilter === "owned" && isOwned) || 
                                (setCollectionFilter === "not-owned" && !isOwned)
                              return matchesSearch && matchesCollection
                            })
                            .sort((a, b) => {
                              const numA = parseInt(a.number.replace(/\D/g, '')) || 0
                              const numB = parseInt(b.number.replace(/\D/g, '')) || 0
                              return setSortOrder === "asc" ? numA - numB : numB - numA
                            })
                            .map((card: any) => {
                              const isOwned = profileUser?.allOwnedCardIds?.includes(card.id)
                              const ownedCount = profileUser?.allOwnedCardIds?.filter((id: string) => id === card.id).length || 0
                              
                              return (
                                <div key={card.id} className="group relative">
                                  <div className={`relative aspect-[2.5/3.5] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${(!isOwned && showGrayscale) ? 'opacity-40 grayscale-[1] hover:opacity-100 hover:grayscale-0' : 'ring-2 ring-primary/20'}`}>
                                    <img 
                                      src={card.images.small} 
                                      alt={card.name}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {isOwned && (
                                      <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-lg ring-2 ring-white/20">
                                        <CheckCircle className="h-4 w-4" />
                                      </div>
                                    )}
                                    {ownedCount > 1 && (
                                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-xs font-black shadow-lg border border-white/10">
                                        x{ownedCount}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                        {hasMoreSetCards && (
                          <div id="load-more-set-cards" className="h-10 w-full flex items-center justify-center">
                            {loadingSetCards && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                          </div>
                        )}
                      </div>
                    ) : (userSets || []).length > 0 ? (
                      userSets
                        .filter((set: any) => {
                          const matchesSearch = set.name.toLowerCase().includes(searchQuery.toLowerCase())
                          const matchesEra = eraFilter === "all-eras" || set.era === eraFilter
                          const matchesLang = langFilter === "all" || set.lang === langFilter
                          return matchesSearch && matchesEra && matchesLang
                        })
                        .slice(0, visibleSetsCount)
                        .map((set: any) => (
                        <div
                          key={set.id}
                          onClick={() => setSelectedSet(set)}
                          className="group cursor-pointer relative h-72 rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 border border-border/10 ring-1 ring-white/5"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-background/50 flex items-center justify-center p-16 overflow-hidden">
                              <img
                                src={set.image}
                                alt={set.name}
                                className="w-full h-full object-contain opacity-10 filter grayscale-100 transition-all duration-1000 group-hover:scale-150 group-hover:opacity-50 group-hover:grayscale-0"
                              />
                              <div className="absolute inset-x-0 bottom-0 h-[85%] bg-gradient-to-t from-black/100 via-black/60 to-transparent" />
                            </div>

                            <div className="absolute inset-x-0 bottom-0 p-8 space-y-6">
                              <div className="flex justify-between items-end">
                                <div className="min-w-0 space-y-1">
                                  <img src={set.symbol} alt={set.name} className="h-10 object-contain mb-4 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:translate-x-2" />
                                  <h4 className="text-white font-black text-2xl leading-tight truncate drop-shadow-2xl tracking-tight italic uppercase">{set.name}</h4>
                                  <div className="flex items-center gap-3 mt-3">
                                    <Badge variant="outline" className="text-[9px] font-black text-white/40 border-white/5 bg-white/5 uppercase tracking-[0.25em] py-0.5 px-3 rounded-full">{set.era}</Badge>
                                    <Badge variant="outline" className="text-[9px] font-black text-primary/60 border-primary/10 bg-primary/5 uppercase tracking-[0.25em] py-0.5 px-3 rounded-full">{set.lang}</Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-white font-black text-3xl leading-none tracking-tighter drop-shadow-xl">
                                    {set.owned}<span className="text-white/30 text-xs font-bold ml-1 tracking-normal italic"> / {set.total}</span>
                                  </p>
                                  <p className="text-[10px] font-black text-primary leading-none mt-3 uppercase tracking-[0.3em] drop-shadow-md">Master Set</p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Mastery Progress</span>
                                  <span className="text-xs font-black text-white tabular-nums drop-shadow-sm">{Math.round((set.owned / set.total) * 100)}%</span>
                                </div>
                                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1 backdrop-blur-sm">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_25px_rgba(var(--primary-rgb),1)] relative overflow-hidden"
                                    style={{ width: `${(set.owned / set.total) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="col-span-full text-center py-12 text-muted-foreground font-bold">No sets collected yet</div>
                    )}
                  </div>
                  {!selectedSet && userSets.length > visibleSetsCount && (
                    <div className="mt-8 flex justify-center">
                      <Button variant="ghost" className="font-black uppercase tracking-widest text-xs gap-2 hover:bg-primary/5" onClick={() => setVisibleSetsCount(prev => prev + 8)}>
                        Show More Sets <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gameplay">
            <div className="flex justify-between items-center mb-10">
              <div className="space-y-2">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-4">
                  <Gamepad2 className="h-10 w-10 text-primary" />
                  Decks
                </h2>
                <p className="text-muted-foreground">Custom decks built by this trainer</p>
              </div>
              <Badge variant="secondary" className="px-4 py-2 font-black text-sm uppercase tracking-widest bg-primary/10 text-primary border-none">
                {decks.length} Decks
              </Badge>
            </div>

            {decks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map((deck) => (
                  <Card key={deck.id} className="group hover:shadow-xl transition-all border-border/50 overflow-hidden bg-secondary/10">
                    <CardHeader className="pb-2">
                      <h4 className="font-bold text-lg uppercase italic">{deck.name}</h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold italic">
                        <Badge variant="outline" className="font-bold text-[10px]">Standard</Badge>
                        <span>{deck.cards?.reduce((acc: number, i: any) => acc + i.count, 0) || 0} cards</span>
                        <span>Created: {new Date(deck.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-bold gap-2 rounded-xl w-full"
                        onClick={() => router.push(`/decks/builder?id=${deck.id}`)}
                      >
                        <Eye className="h-4 w-4" /> View Deck
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center bg-secondary/5 rounded-3xl border border-dashed border-border/50">
                <Gamepad2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold">No decks yet</h3>
                <p className="text-muted-foreground">This trainer hasn't published any decks.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="marketplace">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 shrink-0 space-y-6">
                  <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-6 shadow-sm">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Search className="h-3.5 w-3.5" /> Search Cards
                      </h4>
                      <Input
                        placeholder="e.g. Charizard"
                        className="h-10 bg-secondary/50 border-none rounded-xl text-sm"
                        value={marketplaceFilters.search}
                        onChange={(e) => setMarketplaceFilters(prev => ({ ...prev, search: e.target.value }))}
                      />
                    </div>

                    <Separator className="bg-border/30" />

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Library className="h-3.5 w-3.5" /> Filter by Set
                      </h4>
                      <Select value={marketplaceFilters.setName} onValueChange={(v) => setMarketplaceFilters(prev => ({ ...prev, setName: v }))}>
                        <SelectTrigger className="h-10 bg-secondary/50 border-none rounded-xl text-sm">
                          <SelectValue placeholder="All Sets" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sets</SelectItem>
                          {Array.from(new Set(sales.map(s => s.setName))).filter(Boolean).map(set => (
                            <SelectItem key={set} value={set}>{set}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5" /> Language
                      </h4>
                      <Select value={marketplaceFilters.language} onValueChange={(v) => setMarketplaceFilters(prev => ({ ...prev, language: v }))}>
                        <SelectTrigger className="h-10 bg-secondary/50 border-none rounded-xl text-sm">
                          <SelectValue placeholder="All Languages" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Languages</SelectItem>
                          <SelectItem value="EN">English</SelectItem>
                          <SelectItem value="ES">Spanish</SelectItem>
                          <SelectItem value="FR">French</SelectItem>
                          <SelectItem value="DE">German</SelectItem>
                          <SelectItem value="IT">Italian</SelectItem>
                          <SelectItem value="PT">Portuguese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5" /> Condition
                      </h4>
                      <Select value={marketplaceFilters.condition} onValueChange={(v) => setMarketplaceFilters(prev => ({ ...prev, condition: v }))}>
                        <SelectTrigger className="h-10 bg-secondary/50 border-none rounded-xl text-sm">
                          <SelectValue placeholder="All Conditions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Conditions</SelectItem>
                          <SelectItem value="NM">Near Mint</SelectItem>
                          <SelectItem value="EX">Excellent</SelectItem>
                          <SelectItem value="LP">Light Played</SelectItem>
                          <SelectItem value="PL">Played</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator className="bg-border/30" />

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Heart className="h-3.5 w-3.5" /> Match Wants List
                      </h4>
                      <Select value={selectedWantsList} onValueChange={setSelectedWantsList}>
                        <SelectTrigger className="h-10 bg-secondary/50 border-none rounded-xl text-sm">
                          <SelectValue placeholder="No Wants List" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Show All</SelectItem>
                          {currentUserWantsLists.map(list => (
                            <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </aside>

                {/* Listings Area */}
                <div className="flex-grow space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border/50 rounded-2xl p-4 px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex bg-secondary/50 p-1 rounded-xl">
                        <Button
                          variant={viewMode === "grid" ? "default" : "ghost"}
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => setViewMode("grid")}
                        >
                          <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "default" : "ghost"}
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => setViewMode("list")}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className="text-sm font-bold text-muted-foreground">
                        {sales.filter(s => {
                          const matchesSearch = s.cardName.toLowerCase().includes(marketplaceFilters.search.toLowerCase())
                          const matchesLang = marketplaceFilters.language === "all" || s.language === marketplaceFilters.language
                          const matchesCond = marketplaceFilters.condition === "all" || s.condition === marketplaceFilters.condition
                          const matchesSet = marketplaceFilters.setName === "all" || s.setName === marketplaceFilters.setName

                          let matchesWants = true
                          if (selectedWantsList !== "all") {
                            const list = currentUserWantsLists.find(l => l.id === selectedWantsList)
                            matchesWants = list?.items.some((item: any) => item.id === s.cardId)
                          }

                          return matchesSearch && matchesLang && matchesCond && matchesSet && matchesWants
                        }).length} results found
                      </span>
                    </div>

                    <Button
                      className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
                      onClick={() => {
                        const filtered = sales.filter(s => {
                          const matchesSearch = s.cardName.toLowerCase().includes(marketplaceFilters.search.toLowerCase())
                          const matchesLang = marketplaceFilters.language === "all" || s.language === marketplaceFilters.language
                          const matchesCond = marketplaceFilters.condition === "all" || s.condition === marketplaceFilters.condition
                          const matchesSet = marketplaceFilters.setName === "all" || s.setName === marketplaceFilters.setName

                          let matchesWants = true
                          if (selectedWantsList !== "all") {
                            const list = currentUserWantsLists.find(l => l.id === selectedWantsList)
                            matchesWants = list?.items.some((item: any) => item.id === s.cardId)
                          }

                          return matchesSearch && matchesLang && matchesCond && matchesSet && matchesWants
                        })
                        handleAddAllToCart(filtered)
                      }}
                      disabled={cartLoading === "bulk"}
                    >
                      {cartLoading === "bulk" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                      Add All to Cart
                    </Button>
                  </div>

                  {sales.length > 0 ? (
                    viewMode === "grid" ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sales
                          .filter(s => {
                            const matchesSearch = s.cardName.toLowerCase().includes(marketplaceFilters.search.toLowerCase())
                            const matchesLang = marketplaceFilters.language === "all" || s.language === marketplaceFilters.language
                            const matchesCond = marketplaceFilters.condition === "all" || s.condition === marketplaceFilters.condition
                            const matchesSet = marketplaceFilters.setName === "all" || s.setName === marketplaceFilters.setName

                            let matchesWants = true
                            if (selectedWantsList !== "all") {
                              const list = currentUserWantsLists.find(l => l.id === selectedWantsList)
                              matchesWants = list?.items.some((item: any) => item.id === s.cardId)
                            }

                            return matchesSearch && matchesLang && matchesCond && matchesSet && matchesWants
                          })
                          .map((sale) => (
                            <Card key={sale.id} className="group hover:shadow-xl transition-all border-border/50 overflow-hidden bg-card flex flex-col rounded-3xl shadow-sm">
                              <div className="aspect-[3/4] relative bg-secondary/10 flex items-center justify-center p-4">
                                <img
                                  src={sale.cardImage || "/placeholder.png"}
                                  alt={sale.cardName}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform cursor-pointer"
                                  onClick={() => router.push(`/marketplace/card/${sale.cardId}`)}
                                />
                              </div>
                              <CardContent className="p-4 flex-grow flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-black truncate">{sale.cardName}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold truncate">{sale.setName}</p>
                                  </div>
                                  <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 font-bold">{sale.condition}</Badge>
                                </div>
                                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                                  <span className="font-black text-primary text-lg">{sale.price.toFixed(2)}€</span>
                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-8 w-8 rounded-lg"
                                      onClick={() => handleAddToCart(sale.id)}
                                      disabled={cartLoading === sale.id || currentUser?.cart?.includes(sale.id)}
                                    >
                                      {currentUser?.cart?.includes(sale.id) ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : cartLoading === sale.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <ShoppingCart className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sales
                          .filter(s => {
                            const matchesSearch = s.cardName.toLowerCase().includes(marketplaceFilters.search.toLowerCase())
                            const matchesLang = marketplaceFilters.language === "all" || s.language === marketplaceFilters.language
                            const matchesCond = marketplaceFilters.condition === "all" || s.condition === marketplaceFilters.condition
                            const matchesSet = marketplaceFilters.setName === "all" || s.setName === marketplaceFilters.setName

                            let matchesWants = true
                            if (selectedWantsList !== "all") {
                              const list = currentUserWantsLists.find(l => l.id === selectedWantsList)
                              matchesWants = list?.items.some((item: any) => item.id === s.cardId)
                            }

                            return matchesSearch && matchesLang && matchesCond && matchesSet && matchesWants
                          })
                          .map((sale) => (
                            <div key={sale.id} className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-6 hover:shadow-lg transition-all shadow-sm">
                              <div className="h-16 w-12 shrink-0 bg-secondary/10 rounded-lg flex items-center justify-center p-1">
                                <img src={sale.cardImage} alt={sale.cardName} className="h-full object-contain" />
                              </div>
                              <div className="flex-grow min-w-0">
                                <h4 className="font-black text-sm truncate">{sale.cardName}</h4>
                                <p className="text-xs text-muted-foreground font-bold">{sale.setName}</p>
                              </div>
                              <div className="flex items-center gap-8 px-6">
                                <div className="text-center">
                                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Lang</p>
                                  <p className="text-sm font-bold">{sale.language}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Cond</p>
                                  <p className="text-sm font-bold">{sale.condition}</p>
                                </div>
                                <div className="text-right min-w-[60px]">
                                  <p className="text-lg font-black text-primary">{sale.price.toFixed(2)}€</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="font-bold gap-2 rounded-xl"
                                  onClick={() => handleAddToCart(sale.id)}
                                  disabled={cartLoading === sale.id || currentUser?.cart?.includes(sale.id)}
                                >
                                  {currentUser?.cart?.includes(sale.id) ? (
                                    <><Check className="h-4 w-4 text-green-500" /> In Cart</>
                                  ) : cartLoading === sale.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <><ShoppingCart className="h-4 w-4" /> Add</>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl"
                                  onClick={() => router.push(`/marketplace/card/${sale.cardId}`)}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center bg-secondary/5 rounded-3xl border border-dashed border-border/50">
                      <Tag className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-bold">No listings</h3>
                      <p className="text-muted-foreground">This trainer has no cards for sale at the moment.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
