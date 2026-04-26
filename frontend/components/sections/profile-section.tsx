"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Calendar, Globe, Layers, Search, Filter, ChevronRight, Share2, MoreHorizontal, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Button } from "@/components/ui/button"

const languages = [
  {
    name: "English",
    count: 342,
    flag: "🇺🇸",
    sets: ["Scarlet & Violet", "Crown Zenith", "Silver Tempest", "Lost Origin", "Astral Radiance"]
  },
  {
    name: "Japanese",
    count: 156,
    flag: "🇯🇵",
    sets: ["VSTAR Universe", "Paradise Dragona", "Super Electric Breaker", "Shiny Treasure ex"]
  },
]

const showcaseCards = [
  { id: 1, name: "Charizard VMAX", number: "020/189", set: "Darkness Ablaze", img: "https://images.pokemontcg.io/swsh3/20_hires.png" },
  { id: 2, name: "Pikachu VMAX", number: "044/185", set: "Vivid Voltage", img: "https://images.pokemontcg.io/swsh4/44_hires.png" },
  { id: 3, name: "Umbreon VMAX", number: "215/203", set: "Evolving Skies", img: "https://images.pokemontcg.io/swsh7/215_hires.png" },
  { id: 4, name: "Lugia V", number: "186/195", set: "Silver Tempest", img: "https://images.pokemontcg.io/swsh12/186_hires.png" },
  { id: 5, name: "Giratina V", number: "186/196", set: "Lost Origin", img: "https://images.pokemontcg.io/swsh11/186_hires.png" },
]

const binders = [
  {
    id: 1,
    name: "Rare Holos",
    spineColor: "linear-gradient(to bottom, oklch(0.60 0.18 20), oklch(0.40 0.20 20))",
    spineTextColor: "#ffffff",
    coverType: "color",
    coverValue: "oklch(0.55 0.20 25)"
  },
  {
    id: 2,
    name: "Full Arts",
    spineColor: "linear-gradient(to bottom, oklch(0.55 0.15 250), oklch(0.35 0.18 250))",
    spineTextColor: "#ffffff",
    coverType: "image",
    coverValue: "https://images.pokemontcg.io/swsh11/TG24_hires.png"
  },
  {
    id: 3,
    name: "Vintage",
    spineColor: "linear-gradient(to bottom, #795548, #3e2723)",
    spineTextColor: "#ffffff",
    coverType: "color",
    coverValue: "#5d4037"
  },
  {
    id: 4,
    name: "Legendary",
    spineColor: "linear-gradient(180deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 56%, #4b0082 70%, #8b00ff 84%, #ff0000 100%)",
    spineTextColor: "#ffffff",
    coverType: "gradient",
    coverValue: "linear-gradient(135deg, oklch(0.70 0.12 180) 0%, oklch(0.45 0.15 250) 100%)"
  },
  { id: 5, name: "S&V Base", spineColor: "oklch(0.45 0.15 250)", spineTextColor: "#ffffff", coverType: "color", coverValue: "oklch(0.40 0.12 250)" },
  { id: 6, name: "Sword & Shield", spineColor: "#b71c1c", spineTextColor: "#ffffff", coverType: "color", coverValue: "#ef5350" },
  { id: 7, name: "Sun & Moon", spineColor: "#ff9800", spineTextColor: "#ffffff", coverType: "color", coverValue: "#ffb74d" },
  { id: 8, name: "XY Series", spineColor: "#1a237e", spineTextColor: "#ffffff", coverType: "color", coverValue: "#3f51b5" },
  { id: 9, name: "Black & White", spineColor: "#212121", spineTextColor: "#ffffff", coverType: "color", coverValue: "#424242" },
  { id: 10, name: "Promos", spineColor: "#4caf50", spineTextColor: "#ffffff", coverType: "color", coverValue: "#81c784" },
]

const userSets = [
  { id: 1, name: "Scarlet & Violet", owned: 156, total: 198, date: "Mar 2023", era: "sv", lang: "en", image: "https://images.pokemontcg.io/sv1/logo.png" },
  { id: 2, name: "Crown Zenith", owned: 89, total: 160, date: "Jan 2023", era: "swsh", lang: "en", image: "https://images.pokemontcg.io/swsh12pt5/logo.png" },
  { id: 3, name: "Silver Tempest", owned: 67, total: 195, date: "Nov 2022", era: "swsh", lang: "en", image: "https://images.pokemontcg.io/swsh12/logo.png" },
  { id: 4, name: "VSTAR Universe", owned: 120, total: 172, date: "Dec 2022", era: "swsh", lang: "jp", image: "https://images.pokemontcg.io/s12a/logo.png" },
  { id: 5, name: "Lost Origin", owned: 45, total: 196, date: "Sep 2022", era: "swsh", lang: "en", image: "https://images.pokemontcg.io/swsh11/logo.png" },
  { id: 6, name: "Astral Radiance", owned: 112, total: 189, date: "May 2022", era: "swsh", lang: "en", image: "https://images.pokemontcg.io/swsh10/logo.png" },
]

export function ProfileSection() {
  const [hoveredBinder, setHoveredBinder] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [eraFilter, setEraFilter] = useState("all-eras")
  const [langFilter, setLangFilter] = useState("all")
  const [expandedLang, setExpandedLang] = useState<string | null>(null)

  const filteredSets = userSets.filter(set => {
    const matchesSearch = set.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesEra = eraFilter === "all-eras" || set.era === eraFilter
    const matchesLang = langFilter === "all" || set.lang === langFilter
    return matchesSearch && matchesEra && matchesLang
  })

  return (
    <section className="py-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Your Profile</h2>
          <p className="text-muted-foreground mt-1">Manage your collection and connect with friends</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Profile
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="mb-8 bg-card shadow-sm border-border/50 overflow-hidden rounded-3xl">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <Avatar className="h-28 w-28 border-4 border-primary/20 shadow-2xl ring-4 ring-primary/5">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
              <AvatarFallback className="text-4xl bg-muted text-muted-foreground font-black">TC</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <h3 className="text-4xl font-black text-foreground tracking-tight font-sans italic">TrainerCollector</h3>
                <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-1 uppercase tracking-widest text-[10px]">Pro Member</Badge>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-muted-foreground/80 font-sans uppercase tracking-[0.1em]">
                <span className="flex items-center gap-2 bg-secondary/80 px-4 py-1.5 rounded-full border border-border/50 shadow-sm">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Since Jan 2022
                </span>
                <span className="flex items-center gap-2 bg-secondary/80 px-4 py-1.5 rounded-full border border-border/50 shadow-sm">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  24 Friends
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1 shrink-0 self-stretch justify-center border-t md:border-t-0 md:border-l border-border/50 pt-8 md:pt-0 md:pl-12 lg:pl-16">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.25em] mb-1">Total Collection</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-foreground tabular-nums tracking-tighter">521</span>
                <span className="text-sm font-black text-primary uppercase tracking-widest">cards</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Showcase - Full Width */}
        <Card className="bg-card shadow-sm border-border/50 lg:col-span-2 overflow-hidden rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4">
            <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Showcase</CardTitle>
            <Button variant="ghost" size="sm" className="font-black uppercase tracking-widest text-[10px] hover:bg-primary/10 hover:text-primary rounded-full px-6 border border-border/50">Edit Showcase</Button>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-5 gap-6">
              {showcaseCards.map((card) => (
                <div key={card.id} className="group cursor-pointer">
                  <div className="relative aspect-[2.5/3.5] bg-muted rounded-3xl mb-3 overflow-hidden shadow-md group-hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] transition-all duration-700 group-hover:-translate-y-4 group-hover:ring-8 group-hover:ring-primary/10">
                    <img src={card.img} alt={card.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                      <div className="min-w-0">
                        <p className="text-xs text-white font-black leading-tight truncate uppercase tracking-tighter">{card.name}</p>
                        <p className="text-[9px] text-white/60 font-black truncate uppercase tracking-widest">{card.set}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Language Distribution - Left */}
        <Card className="bg-card shadow-sm border-border/50 overflow-hidden rounded-3xl h-fit">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
              <Globe className="h-6 w-6 text-primary" />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="space-y-4">
              {languages.map((lang) => (
                <div key={lang.name} className="space-y-4 p-5 rounded-3xl bg-secondary/20 border border-border/5 hover:bg-secondary/40 transition-all duration-300">
                  <div className="flex items-center gap-5">
                    <div className="text-3xl bg-background w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg border border-border/30">{lang.flag}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-2 items-baseline px-1">
                        <span className="text-sm font-black text-foreground uppercase tracking-wider">{lang.name}</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{lang.count} cards</span>
                      </div>
                      <Progress value={(lang.count / (342 + 156)) * 100} className="h-2.5 bg-secondary shadow-inner" />
                    </div>
                    <button
                      onClick={() => setExpandedLang(expandedLang === lang.name ? null : lang.name)}
                      className="p-3 rounded-full hover:bg-background transition-all shrink-0 shadow-sm border border-border/50"
                    >
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-500 ${expandedLang === lang.name ? "rotate-180 text-primary" : ""}`} />
                    </button>
                  </div>

                  {expandedLang === lang.name && (
                    <div className="pl-1 text-center flex flex-wrap gap-2 animate-in slide-in-from-top-4 duration-500">
                      {lang.sets.map(setName => (
                        <Badge key={setName} variant="secondary" className="text-[9px] bg-background/50 backdrop-blur-md font-black py-1 px-3 border-border/50 uppercase tracking-widest rounded-full hover:bg-primary hover:text-primary-foreground transition-colors cursor-default">
                          {setName}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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
              {binders.map((binder) => (
                <div
                  key={binder.id}
                  className="relative flex h-full transition-all duration-700 ease-in-out cursor-pointer overflow-hidden rounded-[2rem] shadow-xl border border-border/10 w-12 md:w-14 hover:w-56 group shrink-0"
                >
                  <div
                    className="w-12 md:w-14 h-full flex items-center justify-center shrink-0 z-10 shadow-[5px_0_20px_rgba(0,0,0,0.2)]"
                    style={{ background: binder.spineColor }}
                  >
                    <span
                      className="whitespace-nowrap font-black text-[10px] md:text-xs uppercase tracking-[0.3em] [writing-mode:vertical-rl] rotate-180"
                      style={{ color: binder.spineTextColor }}
                    >
                      {binder.name}
                    </span>
                  </div>
                  <div
                    className="h-full flex-1 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-x-10 group-hover:translate-x-0"
                    style={{
                      background: binder.coverType === 'image' ? `url(${binder.coverValue}) center/cover no-repeat` : binder.coverValue,
                    }}
                  >
                    {binder.coverType !== 'image' && (
                      <div className="w-full h-full flex items-end p-8 bg-black/10 backdrop-blur-[2px]">
                        <span className="text-white/30 font-black text-8xl uppercase tracking-tighter italic">{binder.name[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button className="w-14 h-full border-4 border-dashed border-border/50 rounded-[2rem] flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group shrink-0">
                <span className="text-3xl font-black group-hover:scale-125 transition-transform duration-500">+</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Your Sets - Full Grid */}
        <Card className="bg-card shadow-sm border-border/50 lg:col-span-2 overflow-hidden rounded-[3rem]">
          <CardHeader className="p-10 pb-8 flex flex-col space-y-8">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-black uppercase tracking-tight italic">Your Collected Sets</CardTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-8 pb-4">
              {filteredSets.map((set) => (
                <div
                  key={set.id}
                  className="group relative h-72 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-700 border border-border/10 ring-1 ring-white/5"
                >
                  {/* Background Decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-background/50 flex items-center justify-center p-16 overflow-hidden">
                    <img
                      src={set.image}
                      alt={set.name}
                      className="w-full h-full object-contain opacity-10 filter grayscale-100 transition-all duration-1000 group-hover:scale-150 group-hover:opacity-50 group-hover:grayscale-0"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-[85%] bg-gradient-to-t from-black/100 via-black/60 to-transparent" />
                  </div>

                  {/* Info Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-8 space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="min-w-0 space-y-1">
                        <img src={set.image} alt={set.name} className="h-10 object-contain mb-4 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:translate-x-2" />
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
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <Button variant="outline" className="text-muted-foreground hover:text-primary gap-4 text-xs font-black uppercase tracking-[0.4em] group px-16 h-16 border-border/50 hover:border-primary/50 rounded-full bg-card/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all hover:scale-105 active:scale-95">
                Load More Sets
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
