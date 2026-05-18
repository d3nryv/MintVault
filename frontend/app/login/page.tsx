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
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}'}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        login(data)
        router.push("/")
      } else {
        setError(data.error || "Invalid credentials")
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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 pt-24 relative z-10">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="mb-6 gap-2 hover:bg-secondary/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>

          <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x" />
            <CardHeader className="space-y-1 pb-8">
              <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Enter your credentials to access your PokéVault
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
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold">Username</Label>
                  <Input
                    id="username"
                    placeholder="Your trainer name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    className="bg-background/50 border-border/50 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                    <Link
                      href="#"
                      className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="bg-background/50 border-border/50 focus:ring-primary"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-6 pt-2 pb-10 px-8">
                <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="text-primary font-bold hover:text-primary/80 transition-colors"
                  >
                    Sign up here
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
