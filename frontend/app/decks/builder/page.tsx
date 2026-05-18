"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search, Save, Share2, Trash2, Plus, Minus,
  Info, Loader2, Layers, CheckCircle2, AlertCircle,
  ArrowLeft, ArrowUpDown, FileUp, X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { syncWantsListWithDeckUpdate } from "@/utils/wants-sync"

// --- Official Set Abbreviations & Order ---
const SET_ABBREVIATIONS: Record<string, string> = {
  "Perfect Order": "POR",
  "Ascended Heroes": "ASC",
  "Mega Evolution": "MEG",
  "Black Bolt": "BLK",
  "White Flare": "WHT",
  "Destined Rivals": "DRI",
  "Journey Together": "JTG",
  "Prismatic Evolutions": "PRE",
  "Surging Sparks": "SSP",
  "Stellar Crown": "SCR",
  "Shrouded Fable": "SFA",
  "Twilight Masquerade": "TWM",
  "Temporal Forces": "TEF",
  "Paldean Fates": "PAF",
  "Paradox Rift": "PAR",
  "151": "MEW",
  "Obsidian Flames": "OBF",
  "Paldea Evolved": "PAL",
  "Scarlet & Violet": "SVI",
  "Scarlet & Violet Energies": "SVE",
  "Crown Zenith": "CRZ",
  "Silver Tempest": "SIT",
  "Lost Origin": "LOR",
  "Pokémon GO": "PGO",
  "Astral Radiance": "ASR",
  "Brilliant Stars": "BRS",
  "Fusion Strike": "FST",
  "Celebrations": "CEL",
  "Evolving Skies": "EVS",
  "Chilling Reign": "CRE",
  "Battle Styles": "BST",
  "Shining Fates": "SHF",
  "Vivid Voltage": "VIV",
  "Champion's Path": "CPA",
  "Darkness Ablaze": "DAA",
  "Rebel Clash": "RCL",
  "Sword & Shield": "SSH",
  "Cosmic Eclipse": "CEC",
  "Hidden Fates": "HIF",
  "Unified Minds": "UNM",
  "Unbroken Bonds": "UNB",
  "Detective Pikachu": "DET",
  "Team Up": "TEU",
  "Lost Thunder": "LOT",
  "Dragon Majesty": "DRM",
  "Celestial Storm": "CES",
  "Forbidden Light": "FLI",
  "Ultra Prism": "UPR",
  "Crimson Invasion": "CIN",
  "Shining Legends": "SLG",
  "Burning Shadows": "BUS",
  "Guardians Rising": "GRI",
  "Sun & Moon": "SUM",
  "Evolutions": "EVO",
  "Steam Siege": "STS",
  "Fates Collide": "FCO",
  "Generations": "GEN",
  "BREAKpoint": "BKP",
  "BREAKthrough": "BKT",
  "Ancient Origins": "AOR",
  "Roaring Skies": "ROS",
  "Double Crisis": "DCR",
  "Primal Clash": "PRC",
  "Phantom Forces": "PHF",
  "Furious Fists": "FFI",
  "Flashfire": "FLF",
  "XY": "XY",
  "Kalos Starter Set": "KSS",
  "Legendary Treasures": "LTR",
  "Plasma Blast": "PLB",
  "Plasma Freeze": "PLF",
  "Plasma Storm": "PLS",
  "Boundaries Crossed": "BCR",
  "Dragon Vault": "DRV",
  "Dragons Exalted": "DRX",
  "Dark Explorers": "DEX",
  "Next Destinies": "NXD",
  "Noble Victories": "NVI",
  "Emerging Powers": "EPO",
  "Black & White": "BLW",
  "Call of Legends": "CL",
  "Triumphant": "TM",
  "Undaunted": "UD",
  "Unleashed": "UL",
  "HeartGold & SoulSilver": "HS",
  "Arceus": "AR",
  "Supreme Victors": "SV",
  "Rising Rivals": "RR",
  "Platinum": "PL",
  "Stormfront": "SF",
  "Legends Awakened": "LA",
  "Majestic Dawn": "MD",
  "Great Encounters": "GE",
  "Secret Wonders": "SW",
  "Mysterious Treasures": "MT",
  "Diamond & Pearl": "DP",
  "EX Power Keepers": "PK",
  "EX Dragon Frontiers": "DF",
  "EX Crystal Guardians": "CG",
  "EX Holon Phantoms": "HP",
  "EX Legend Maker": "LM",
  "EX Delta Species": "DS",
  "EX Unseen Forces": "UF",
  "EX Emerald": "EM",
  "EX Deoxys": "DX",
  "EX Team Rocket Returns": "TRR",
  "EX FireRed & LeafGreen": "RG",
  "EX Hidden Legends": "HL",
  "EX Team Magma vs Team Aqua": "MA",
  "EX Dragon": "DR",
  "EX Sandstorm": "SS",
  "EX Ruby & Sapphire": "RS",
  "Skyridge": "SK",
  "Aquapolis": "AQ",
  "Expedition Base Set": "EX",
  "Legendary Collection": "LC",
  "Neo Destiny": "N4",
  "Neo Revelation": "N3",
  "Neo Discovery": "N2",
  "Southern Islands": "SI",
  "Neo Genesis": "N1",
  "Gym Challenge": "G2",
  "Gym Heroes": "G1",
  "Team Rocket": "TR",
  "Base Set 2": "B2",
  "Fossil": "FO",
  "Jungle": "JU",
  "Base Set": "BS",
  "Pokémon TCG Classic": "MEE",
  "2022 McDonald's Collection": "MCD",
  "2021 McDonald's Collection": "MCD",
  "2019 McDonald's Collection": "MCD",
  "2018 McDonald's Collection": "MCD",
  "2017 McDonald's Collection": "MCD",
  "2016 McDonald's Collection": "MCD",
  "2015 McDonald's Collection": "MCD",
  "2014 McDonald's Collection": "MCD",
  "2013 McDonald's Collection": "MCD",
  "2012 McDonald's Collection": "MCD",
  "2011 McDonald's Collection": "MCD",
}

const SET_PRIORITY = Object.keys(SET_ABBREVIATIONS)

interface TCGCard {
  id: string
  name: string
  supertype: string
  subtypes: string[]
  types?: string[]
  attacks?: Array<{ name: string; text: string; damage: string; cost: string[] }>
  abilities?: Array<{ name: string; text: string; type: string }>
  images: { small: string; large: string }
  set: { id: string; name: string; series: string; releaseDate: string; ptcgoCode?: string }
  number: string
  text?: string[]
}

interface DeckItem {
  card: TCGCard
  count: number
}

export default function DeckBuilderPage() {
  const [deckName, setDeckName] = useState("New Deck")
  const [deckId, setDeckId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<TCGCard[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [deck, setDeck] = useState<DeckItem[]>([])
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null)
  const [reprints, setReprints] = useState<TCGCard[]>([])
  const [isLoadingReprints, setIsLoadingReprints] = useState(false)
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  // Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importText, setImportText] = useState("")
  const [isImporting, setIsImporting] = useState(false)

  const router = useRouter()
  const { user, updateUser } = useAuth()

  const totalCards = useMemo(() => deck.reduce((acc, item) => acc + item.count, 0), [deck])
  const pokemonCount = useMemo(() => deck.filter(i => i.card.supertype === 'Pokémon').reduce((acc, i) => acc + i.count, 0), [deck])
  const trainerCount = useMemo(() => deck.filter(i => i.card.supertype === 'Trainer').reduce((acc, i) => acc + i.count, 0), [deck])
  const energyCount = useMemo(() => deck.filter(i => i.card.supertype === 'Energy').reduce((acc, i) => acc + i.count, 0), [deck])

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Handle URL import
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const importData = urlParams.get('import')
    const idParam = urlParams.get('id')

    if (idParam) {
      setDeckId(idParam)
      const fetchDeck = async () => {
        try {
          const apiBaseUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://127.0.0.1:3000';
          const response = await fetch(`${apiBaseUrl}/api/decks/${idParam}`)
          if (response.ok) {
            const data = await response.json()
            setDeckName(data.name)
            setDeck(data.cards)
          }
        } catch (error) {
          console.error("Error fetching deck:", error)
        }
      }
      fetchDeck()
    }

    if (importData) {
      setImportText(decodeURIComponent(importData))
      // Use a small delay to ensure the component is fully ready
      setTimeout(() => {
        setIsImportModalOpen(true)
        // The handleImport call will be triggered by the user or we can auto-trigger it
      }, 500)
    }
  }, [])

  const getSetCode = (card: TCGCard) => {
    if (card.set?.ptcgoCode) return card.set.ptcgoCode
    const setName = card.set?.name || ""
    if (!setName) return ""
    if (SET_ABBREVIATIONS[setName]) return SET_ABBREVIATIONS[setName]
    if (setName.includes("McDonald's")) return "MCD"
    const parts = setName.split(/\s+/).filter(p => p.toLowerCase() !== '&' && p.toLowerCase() !== '—')
    if (parts.length >= 2) return (parts[0][0] + parts[1].substring(0, 2)).toUpperCase()
    return setName.substring(0, 3).toUpperCase()
  }

  // Search logic
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.length < 3) {
        setSearchResults([])
        return
      }
      setIsSearching(true)
      try {
        let finalQuery = searchQuery.trim()
        if (finalQuery.includes(' ') && !finalQuery.startsWith('"')) {
          finalQuery = `"${finalQuery}"`
        }

        const apiBaseUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://127.0.0.1:3000';
        const response = await fetch(`${apiBaseUrl}/api/cards/search/${encodeURIComponent(finalQuery)}`)
        const data = await response.json()
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => {
            const indexA = SET_PRIORITY.indexOf(a.set?.name)
            const indexB = SET_PRIORITY.indexOf(b.set?.name)
            if (indexA !== -1 && indexB !== -1) return indexA - indexB
            if (indexA !== -1) return -1
            if (indexB !== -1) return 1
            const dateA = a.set?.releaseDate ? a.set.releaseDate.replace(/\//g, '-') : '0000-00-00'
            const dateB = b.set?.releaseDate ? b.set.releaseDate.replace(/\//g, '-') : '0000-00-00'
            return dateB.localeCompare(dateA)
          })
          setSearchResults(sorted)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsSearching(false)
      }
    }, 500)
    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  const normalize = (name: string) => name.split('(')[0].replace(/['’]/g, '').trim().toLowerCase()

  const handleImport = async () => {
    if (!importText.trim()) return
    setIsImporting(true)
    const lines = importText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    const newDeck: DeckItem[] = []

    const ENERGY_MAP: Record<string, string> = {
      '{G}': 'Grass', '{R}': 'Fire', '{W}': 'Water', '{L}': 'Lightning',
      '{P}': 'Psychic', '{F}': 'Fighting', '{D}': 'Darkness', '{M}': 'Metal',
      '{Y}': 'Fairy', '{C}': 'Colorless'
    }

    for (const line of lines) {
      // Robust regex to parse quantities like: "4 Iono PAL 185" -> count: 4, rest: "Iono PAL 185"
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (!match) continue;

      const count = parseInt(match[1]);
      if (isNaN(count)) continue;

      const rest = match[2];
      const parts = rest.split(/\s+/);
      
      let fullName = rest;
      let setCode = "";
      let number = "";

      if (parts.length >= 2) {
        number = parts[parts.length - 1];
        setCode = parts[parts.length - 2];
        fullName = parts.slice(0, parts.length - 2).join(" ");
      } else {
        fullName = rest;
      }

      // Translate symbols like {G} to names like Grass
      Object.entries(ENERGY_MAP).forEach(([symbol, name]) => {
        fullName = fullName.replace(symbol, name)
      })

      const isEnergy = fullName.toLowerCase().includes("energy")
      const isBasicEnergy = isEnergy && (
        fullName.toLowerCase().includes("basic") ||
        ['grass', 'fire', 'water', 'lightning', 'psychic', 'fighting', 'darkness', 'metal'].includes(fullName.toLowerCase().replace(/energy/g, '').trim())
      )

      // Exact match with quotes for everything
      let searchTerm = `\"${fullName}\"`

      if (isBasicEnergy) {
        const type = fullName.toLowerCase().replace(/basic/g, '').replace(/energy/g, '').trim()
        searchTerm = `\"basic ${type} energy\"`
      }

      try {
        const apiBaseUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://127.0.0.1:3000';
        const apiUrl = `${apiBaseUrl}/api/cards/search/${encodeURIComponent(searchTerm)}`

        await new Promise(r => setTimeout(r, 50))
        const response = await fetch(apiUrl)
        if (!response.ok) continue

        let data;
        try {
          data = await response.json();
        } catch (jsonErr) {
          console.warn("API did not return valid JSON for:", searchTerm);
          continue;
        }

        if (Array.isArray(data) && data.length > 0) {
          let found = null

          // 1. Try strict match first for EVERYTHING (including Energy Switch)
          const targetName = normalize(fullName)
          let finalSetCode = setCode

          // Energy rule: convert MEE to SVE
          if (isEnergy && setCode.toUpperCase() === 'MEE') {
            finalSetCode = 'SVE'
          }

          found = data.find(c => {
            const cSetCode = getSetCode(c) || "";
            const cNumber = c.id?.includes('-') ? c.id.split('-')[1] : c.number;
            return normalize(c.name || "") === targetName &&
              cSetCode.toLowerCase() === finalSetCode.toLowerCase() &&
              cNumber === number
          })

          // 2. Fallback logic only for Basic Energies or if no strict match found
          if (!found) {
            if (isBasicEnergy) {
              found = data.find(c => c.set?.name === 'Scarlet & Violet Energies') || data[0]
            } else if (isEnergy && !fullName.toLowerCase().includes("switch") && !fullName.toLowerCase().includes("retrieval")) {
              // Only fallback if it's likely a real energy card, not a trainer like Energy Switch or Energy Retrieval
              found = data[0]
            } else if (!setCode || !number) {
              // If there was no set code or number provided, just pick the first exact name match
              found = data.find(c => normalize(c.name || "") === targetName) || data[0];
            }
          }

          if (found) {
            setSelectedCard(found)
            newDeck.push({ card: found, count })
          }
        }
      } catch (error) {
        console.error(`Skipping card due to error:`, error)
        continue
      }
    }

    if (newDeck.length > 0) {
      setDeck(newDeck)
      showNotification(`Imported ${newDeck.reduce((acc, i) => acc + i.count, 0)} cards!`)
      setIsImportModalOpen(false) // Close only at the end
      setImportText("")
    } else {
      showNotification("No valid cards found in list", "error")
    }
    setIsImporting(false)
  }

  const fetchReprints = async (card: TCGCard) => {
    setIsLoadingReprints(true)
    setReprints([])

    const normalize = (name: string) => name.split('(')[0].replace(/['’]/g, '').trim().toLowerCase()

    try {
      // Use clean full name with quotes for exact matching
      const cleanName = card.name.split('(')[0].trim()
      const searchTerm = `\"${cleanName}\"`

      const apiBaseUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://127.0.0.1:3000';
      const response = await fetch(`${apiBaseUrl}/api/cards/search/${encodeURIComponent(searchTerm)}`)
      const data = await response.json()

      if (Array.isArray(data)) {
        const cardBaseName = normalize(card.name)
        const versions = data.filter(c => {
          if (c.id === card.id) return false
          const otherBaseName = normalize(c.name)

          if (card.supertype === 'Pokémon') {
            const getTexts = (cd: TCGCard) => {
              const attacks = cd.attacks?.map(a => a.text).join('|') || ''
              const abilities = cd.abilities?.map(a => a.text).join('|') || ''
              return (attacks + abilities).toLowerCase().replace(/\s/g, '')
            }
            return otherBaseName === cardBaseName && getTexts(c) === getTexts(card)
          } else if (card.supertype === 'Trainer') {
            return otherBaseName === cardBaseName
          }
          return false
        })
        setReprints(versions)
      }
    } catch (error) {
      console.error("Reprints error:", error)
    } finally {
      setIsLoadingReprints(false)
    }
  }

  const addToDeck = (card: TCGCard) => {
    if (totalCards >= 60) {
      showNotification("Deck is full (max 60 cards)", "error")
      return
    }
    const totalCopiesWithName = deck.filter(item => item.card.name === card.name).reduce((acc, item) => acc + item.count, 0)
    if (totalCopiesWithName >= 4 && card.supertype !== 'Energy') {
      showNotification(`Maximum 4 copies of ${card.name} allowed`, "error")
      return
    }
    setDeck(prev => {
      const existing = prev.find(item => item.card.id === card.id)
      if (existing) return prev.map(item => item.card.id === card.id ? { ...item, count: item.count + 1 } : item)
      return [...prev, { card, count: 1 }]
    })
  }

  const removeFromDeck = (cardId: string) => {
    setDeck(prev => prev.map(item => item.card.id === cardId ? { ...item, count: item.count - 1 } : item).filter(item => item.count > 0))
  }

  const sortDeck = () => {
    const getTrainerPriority = (subtypes: string[]) => {
      if (subtypes.includes('Supporter')) return 1
      if (subtypes.includes('Item')) return 2
      if (subtypes.includes('Tool')) return 3
      if (subtypes.includes('Stadium')) return 4
      return 5
    }
    const getSupertypePriority = (supertype: string) => {
      if (supertype === 'Pokémon') return 1
      if (supertype === 'Trainer') return 2
      if (supertype === 'Energy') return 3
      return 4
    }
    const sortedDeck = [...deck].sort((a, b) => {
      const pA = getSupertypePriority(a.card.supertype)
      const pB = getSupertypePriority(b.card.supertype)
      if (pA !== pB) return pA - pB
      if (a.card.supertype === 'Trainer' && b.card.supertype === 'Trainer') {
        const subPA = getTrainerPriority(a.card.subtypes)
        const subPB = getTrainerPriority(b.card.subtypes)
        if (subPA !== subPB) return subPA - subPB
      }
      return a.card.name.localeCompare(b.card.name)
    })
    setDeck(sortedDeck)
    showNotification("Deck organized!")
  }

  const handleShare = () => {
    const ENERGY_SYMBOLS: Record<string, string> = {
      'Grass': '{G}', 'Fire': '{R}', 'Water': '{W}', 'Lightning': '{L}',
      'Psychic': '{P}', 'Fighting': '{F}', 'Darkness': '{D}', 'Metal': '{M}',
      'Dark': '{D}'
    }

    const formatLine = (item: DeckItem) => {
      let name = item.card.name
      let setCode = getSetCode(item.card)
      let cardNumber = item.card.id.includes('-') ? item.card.id.split('-')[1] : item.card.number

      if (item.card.supertype === 'Energy' && item.card.subtypes.includes('Basic')) {
        const type = name.replace(/Basic\s+|Energy\s+/gi, '').trim()
        const symbol = ENERGY_SYMBOLS[type] || type
        name = `Basic ${symbol} Energy`
        setCode = 'SVE'
        // Basic energies usually don't need a number in Live or use a default one, but keeping it for now
      }

      return `${item.count} ${name} ${setCode} ${cardNumber}`
    }

    const format = `Pokémon: ${pokemonCount}\n${deck.filter(i => i.card.supertype === 'Pokémon').map(formatLine).join('\n')}\n\nTrainer: ${trainerCount}\n${deck.filter(i => i.card.supertype === 'Trainer').map(formatLine).join('\n')}\n\nEnergy: ${energyCount}\n${deck.filter(i => i.card.supertype === 'Energy').map(formatLine).join('\n')}`
    navigator.clipboard.writeText(format)
    showNotification("Copied to clipboard!")
  }

  const handleSave = async () => {
    if (!user) {
      showNotification("You must be logged in to save a deck", "error")
      return
    }

    if (deck.length === 0) {
      showNotification("The deck is empty", "error")
      return
    }

    try {
      const apiBaseUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://127.0.0.1:3000';
      const url = deckId ? `${apiBaseUrl}/api/decks/${deckId}` : `${apiBaseUrl}/api/decks`
      const method = deckId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId: user.id,
          name: deckName,
          cards: deck,
        }),
      })

      if (response.ok) {
        const savedDeck = await response.json()
        if (!deckId) setDeckId(savedDeck.id)

        if (user && user.wantList) {
          const updatedWantList = syncWantsListWithDeckUpdate(user.wantList, savedDeck.id.toString(), deck)
          if (updatedWantList !== user.wantList) {
            const userUpdateResponse = await fetch(`${apiBaseUrl}/api/users/${user.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ wantList: updatedWantList })
            })
            if (userUpdateResponse.ok) {
              updateUser({ wantList: updatedWantList })
            }
          }
        }

        showNotification("Deck saved successfully!")
      } else {
        const errorData = await response.json()
        showNotification(errorData.error || "Error saving the deck", "error")
      }
    } catch (error) {
      console.error("Save error:", error)
      showNotification("Error de conexión con el servidor", "error")
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      <Header />

      {notification && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
          {notification.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          <span className="text-base font-bold">{notification.message}</span>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b p-6">
              <div>
                <CardTitle className="text-2xl font-serif">Import Deck</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Paste your deck list below (TCG Live format)</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsImportModalOpen(false)} disabled={isImporting}><X className="h-6 w-6" /></Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <textarea
                className={`w-full h-64 bg-secondary/20 rounded-xl p-4 font-mono text-sm border-2 border-border focus:border-primary focus:ring-0 outline-none transition-all resize-none ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="4 Dreepy TWM 128&#10;4 Drakloak TWM 129&#10;..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                disabled={isImporting}
              />
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => {
                  setIsImportModalOpen(false)
                  // Clean up URL if we were importing
                  if (window.location.search.includes('import=')) {
                    router.replace('/decks/builder')
                  }
                }} disabled={isImporting}>Cancel</Button>
                <Button onClick={handleImport} disabled={isImporting || !importText.trim()} className="px-8 font-bold min-w-[120px]">
                  {isImporting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {isImporting ? "Importing..." : "Import Cards"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isImporting && (
        <div className="fixed inset-0 z-[110] flex items-center justify-end bg-background/20 backdrop-blur-sm p-8 pointer-events-none">
          <Card className="w-96 shadow-2xl animate-in slide-in-from-right-8 duration-500 border-primary/20 pointer-events-auto">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing deck...
                </div>
                <p className="text-muted-foreground text-sm font-medium">Synchronizing with the official database</p>
              </div>

              {selectedCard && (
                <div className="relative">
                  <img
                    src={selectedCard.images.small}
                    alt=""
                    className="w-56 h-auto rounded-xl shadow-2xl border-4 border-background animate-in zoom-in-90 duration-300"
                  />
                  <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full -z-10 animate-pulse" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <main className="pt-24 flex flex-col lg:flex-row lg:h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden">
        {/* Detail Panel (Ordered Last on Mobile) */}
        <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-r border-border bg-card/20 p-4 sm:p-8 order-3 lg:order-none h-fit lg:h-auto overflow-y-auto">
          {selectedCard ? (
            <div className="space-y-8">
              <div className="rounded-2xl overflow-hidden shadow-xl border bg-background"><img src={selectedCard.images.large} className="w-full h-auto" /></div>
              <div className="space-y-6">
                <div className="flex gap-3">
                  <Button onClick={() => addToDeck(selectedCard)} className="flex-1 h-14 gap-3 font-bold text-xl shadow-lg shadow-primary/20"><Plus className="h-6 w-6" /> Add</Button>
                  <Button variant="outline" onClick={() => fetchReprints(selectedCard)} className="flex-1 h-14 gap-3 font-bold text-lg border-2" disabled={isLoadingReprints}>
                    {isLoadingReprints ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Layers className="h-6 w-6 text-primary" />}
                    Other versions
                  </Button>
                </div>

                {reprints.length > 0 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Functional Reprints</h4>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{reprints.length} found</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {reprints.map(r => (
                        <div key={r.id} className="relative group">
                          <img
                            src={r.images.small}
                            onClick={() => setSelectedCard(r)}
                            className="cursor-pointer rounded-lg border-2 border-transparent hover:border-primary transition-all hover:scale-105 shadow-sm"
                            title={`${r.set.name} - ${r.number}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h2 className="font-serif text-3xl font-bold">{selectedCard.name}</h2>
                  <p className="text-base text-muted-foreground">{selectedCard.set.name} • {selectedCard.number}</p>
                </div>
                <div className="text-sm bg-muted/60 p-6 rounded-2xl border border-border/60 space-y-4 shadow-inner">
                  {selectedCard.abilities?.map(a => (<div key={a.name}><span className="font-bold text-primary uppercase text-xs">{a.type}: {a.name}</span><p className="italic mt-2">{a.text}</p></div>))}
                  {selectedCard.attacks?.map(a => (<div key={a.name} className="border-t border-border/40 pt-4 first:border-0 first:pt-0"><div className="flex justify-between items-center mb-1"><span className="font-bold text-foreground text-base">{a.name}</span><span className="font-bold text-base">{a.damage}</span></div><p className="italic">{a.text}</p></div>))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40 py-12"><Info className="h-16 w-16 mb-4" /><p className="font-serif text-2xl">Select a card</p></div>
          )}
        </div>

        {/* Visual Deck Panel (Ordered First on Mobile) */}
        <div className="w-full lg:flex-1 flex flex-col bg-background order-1 lg:order-none min-h-[400px] lg:min-h-0" onDrop={(e) => { e.preventDefault(); const d = e.dataTransfer.getData("card"); if (d) addToDeck(JSON.parse(d)) }} onDragOver={(e) => e.preventDefault()}>
          <div className="p-4 sm:p-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 bg-card/5">
            <div className="flex items-center gap-4 sm:gap-6">
              <Button variant="ghost" size="icon" onClick={() => router.push("/gameplay")} className="h-12 w-12"><ArrowLeft className="h-6 w-6" /></Button>
              <div className="flex-1">
                <Input value={deckName} onChange={(e) => setDeckName(e.target.value)} className="font-serif text-2xl sm:text-4xl font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0 w-full" />
                <div className="flex gap-6 mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <span className={totalCards > 60 ? 'text-destructive font-black' : ''}>{totalCards} / 60 Cards</span>
                  <span>{pokemonCount} P • {trainerCount} T • {energyCount} E</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
              <Button variant="outline" size="icon" onClick={sortDeck} title="Sort Deck" className="h-12 w-12 sm:h-14 sm:w-14"><ArrowUpDown className="h-5 w-5 sm:h-6 sm:w-6" /></Button>
              <Button variant="outline" size="icon" onClick={() => setIsImportModalOpen(true)} title="Import Deck" className="h-12 w-12 sm:h-14 sm:w-14"><FileUp className="h-5 w-5 sm:h-6 sm:w-6" /></Button>
              <Button onClick={handleSave} className="h-12 sm:h-14 px-6 sm:px-8 font-bold text-base sm:text-lg shadow-lg">Save</Button>
              <Button variant="outline" onClick={handleShare} className="h-12 sm:h-14 px-6 sm:px-8 font-bold text-base sm:text-lg">Share</Button>
            </div>
          </div>
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-4">
              {deck.map(item => (
                <div key={item.card.id} className="relative group">
                  <img src={item.card.images.small} className="w-full h-auto cursor-pointer rounded-lg shadow-md transition-all group-hover:scale-105" onClick={() => setSelectedCard(item.card)} />
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 border-background shadow-lg z-20">{item.count}</div>
                  <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 px-1">
                    <Button size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-2xl bg-emerald-500 hover:bg-emerald-600 border-2 border-background" onClick={(e) => { e.stopPropagation(); addToDeck(item.card); }}><Plus className="h-4 w-4 sm:h-6 sm:w-6 text-white" /></Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-2xl border-2 border-background" onClick={(e) => { e.stopPropagation(); removeFromDeck(item.card.id); }}><Minus className="h-4 w-4 sm:h-6 sm:w-6 text-white" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Panel (Ordered Second on Mobile) */}
        <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-border bg-card/20 flex flex-col order-2 lg:order-none h-[500px] lg:h-auto">
          <div className="p-4 sm:p-8 border-b border-border">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search database..." className="pl-12 h-12 rounded-xl bg-background text-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {isSearching ? <div className="flex justify-center py-12"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div> : (
              <div className="grid grid-cols-3 lg:grid-cols-2 gap-2 sm:gap-4">
                {searchResults.map(card => (
                  <div key={card.id} className="relative group cursor-grab active:cursor-grabbing" draggable onDragStart={(e) => e.dataTransfer.setData("card", JSON.stringify(card))} onClick={() => setSelectedCard(card)}>
                    <img src={card.images.small} className="w-full h-auto rounded-xl shadow-md hover:ring-4 ring-primary/30 transition-all" />
                    <Button size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" onClick={(e) => { e.stopPropagation(); addToDeck(card); }}><Plus className="h-5 w-5" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
