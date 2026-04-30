"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2, User, Mail, Save, ArrowLeft } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function ProfilePage() {
  const { user, updateUser, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login")
    }
    if (user) {
      setUsername(user.username)
      setEmail(user.email)
    }
  }, [user, isAuthLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`http://127.0.0.1:3000/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email }),
      })

      const data = await response.json()

      if (response.ok) {
        updateUser({ username, email })
        setSuccess("Profile updated successfully!")
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (err) {
      setError("Failed to connect to the server")
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 pt-24 relative z-10">
        <div className="w-full max-w-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-6 gap-2 hover:bg-secondary/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
            {/* Sidebar / Avatar section */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl h-fit">
              <CardContent className="pt-10 flex flex-col items-center">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 overflow-hidden">
                    {user.profilePicUrl ? (
                      <img src={user.profilePicUrl} alt={user.username} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-primary" />
                    )}
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-bold">{user.username}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                
                <div className="w-full border-t border-border/50 mt-6 pt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Member since April 2026</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main form section */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-primary" />
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
                <CardDescription>
                  Update your personal information and how others see you
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="h-5 w-5" />
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-sm text-emerald-600 animate-in fade-in slide-in-from-top-2">
                      <CheckCircle2 className="h-5 w-5" />
                      {success}
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Username
                      </Label>
                      <Input
                        id="username"
                        placeholder="Your trainer name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="bg-background/50 border-border/50 focus:ring-primary h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background/50 border-border/50 focus:ring-primary h-11"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pt-2 pb-8 px-6">
                  <Button 
                    className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all" 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
