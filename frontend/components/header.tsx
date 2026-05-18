"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, User, Sun, Moon, LogOut, Search, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useAuth } from "@/context/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMarketplace } from "@/context/marketplace-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Globe } from "lucide-react"

const navigation = [
  { name: "Collection", href: "/collection" },
  { name: "Gameplay", href: "/gameplay" },
  { name: "Marketplace", href: "/marketplace" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, logout } = useAuth()

  const { language, setLanguage } = useMarketplace()
  const router = useRouter()
  const pathname = usePathname()
  const [friendSearchQuery, setFriendSearchQuery] = useState("")
  const [isSearchVisible, setIsSearchVisible] = useState(false)

  const handleFriendSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (friendSearchQuery.trim()) {
      router.push(`/friends/search?q=${encodeURIComponent(friendSearchQuery.trim())}`)
      setFriendSearchQuery("")
      setIsSearchVisible(false)
    }
  }

  const isMarketplace = pathname?.startsWith('/marketplace')

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="mx-auto flex max-w-[1700px] items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'Georgia, serif' }}>
              MintVault
            </span>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-12 items-center">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          ))}
          
          <div className="relative flex items-center ml-4">
            {isSearchVisible ? (
              <form onSubmit={handleFriendSearch} className="flex items-center animate-in slide-in-from-right-4 duration-300">
                <Input
                  autoFocus
                  placeholder="Search friends..."
                  value={friendSearchQuery}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                  className="w-40 h-8 bg-secondary/50 border-none rounded-full text-xs pl-8"
                />
                <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 ml-1" 
                  onClick={() => setIsSearchVisible(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-full hover:bg-secondary transition-all"
                onClick={() => setIsSearchVisible(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 items-center">
          {isMarketplace && (
            <div className="flex items-center gap-2 mr-2 border-r border-border pr-4">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[130px] h-8 text-xs bg-transparent border-none hover:bg-secondary transition-colors">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="EN">🇺🇸 English</SelectItem>
                  <SelectItem value="ES">🇪🇸 Spanish</SelectItem>
                  <SelectItem value="FR">🇫🇷 French</SelectItem>
                  <SelectItem value="DE">🇩🇪 German</SelectItem>
                  <SelectItem value="IT">🇮🇹 Italian</SelectItem>
                  <SelectItem value="PT">🇵🇹 Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative overflow-hidden"
          >
            {mounted && (
              <>
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </>
            )}
            {!mounted && <Sun className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {mounted && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary transition-all">
                    {user.profilePicUrl ? (
                      <img src={user.profilePicUrl} alt={user.username} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 backdrop-blur-xl bg-background/80 border-border/50">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/friends")} className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    Friends
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push("/login")}
                  className="hidden sm:flex font-semibold hover:bg-secondary"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => router.push("/register")}
                  className="shadow-lg shadow-primary/20 font-bold px-6"
                >
                  Sign Up
                </Button>
              </div>
            )
          )}
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-6 pb-6 pt-2">
            {/* Mobile Friend Search */}
            <form onSubmit={handleFriendSearch} className="px-3 py-2 relative mb-2">
              <Input
                placeholder="Search friends..."
                value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
                className="w-full h-10 bg-secondary/50 border-none rounded-xl text-sm pl-10 focus-visible:ring-1 focus-visible:ring-primary"
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>

            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-base font-medium text-foreground/80 hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {mounted ? (
                  theme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )
                ) : (
                  <Sun className="mr-2 h-4 w-4" />
                )}
                {mounted ? (theme === "dark" ? "Light Mode" : "Dark Mode") : "Mode"}
              </Button>
              {mounted && (
                user ? (
                  <Button variant="destructive" className="w-full justify-start" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout ({user.username})
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button className="w-full" onClick={() => router.push("/login")}>Sign In</Button>
                    <Button variant="outline" className="w-full" onClick={() => router.push("/register")}>Sign Up</Button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
