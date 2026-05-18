"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          login(data)
          router.push("/")
        }, 2000)
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (err) {
      setError("Failed to connect to the server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated Background Decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 pt-24 relative z-10">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/login")}
            className="mb-6 gap-2 hover:bg-secondary/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>

          <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-accent via-primary to-accent animate-gradient-x" />
            <CardHeader className="space-y-1 pb-8">
              <CardTitle className="text-3xl font-bold tracking-tight">Join PokéVault</CardTitle>
              <CardDescription className="text-base">
                Create your account to manage your collection and decks
              </CardDescription>
            </CardHeader>
            {isSuccess ? (
              <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in duration-500">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Welcome Trainer!</h3>
                  <p className="text-muted-foreground mt-2">Your account has been created successfully. Redirecting...</p>
                </div>
              </CardContent>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="h-5 w-5" />
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-semibold">Username</Label>
                    <Input
                      id="username"
                      placeholder="Trainer Name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-background/50 border-border/50 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50 border-border/50 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-background/50 border-border/50 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-background/50 border-border/50 focus:ring-primary"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-6 pt-4 pb-10 px-8">
                  <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-primary font-bold hover:text-primary/80 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </div>
                </CardFooter>
              </form>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
