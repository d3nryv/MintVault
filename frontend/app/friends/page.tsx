"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, UserCheck, UserPlus, X, Check, Users } from "lucide-react"

export default function FriendsPage() {
  const { user, login } = useAuth()
  const router = useRouter()
  
  const [following, setFollowing] = useState<any[]>([])
  const [followers, setFollowers] = useState<any[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchUsersData = async () => {
      try {
        const fetchUserById = async (id: string) => {
          const res = await fetch(`http://127.0.0.1:3000/api/users/${id}`)
          if (res.ok) return await res.json()
          return null
        }

        // Mutuals are those who are both in following and followers
        const userFollowing = user.following || []
        const userFollowers = user.followers || []
        
        const mutualIds = userFollowing.filter(id => userFollowers.includes(id))
        const followingIds = userFollowing.filter(id => !mutualIds.includes(id))
        const followersIds = userFollowers.filter(id => !mutualIds.includes(id))
        const requestIds = user.friendRequests || []

        const [mutualData, followingData, followersData, requestsData] = await Promise.all([
          Promise.all(mutualIds.map(fetchUserById)),
          Promise.all(followingIds.map(fetchUserById)),
          Promise.all(followersIds.map(fetchUserById)),
          Promise.all(requestIds.map(fetchUserById))
        ])

        setFriends(mutualData.filter(Boolean))
        setFollowing(followingData.filter(Boolean))
        setFollowers(followersData.filter(Boolean))
        setRequests(requestsData.filter(Boolean))
      } catch (e) {
        console.error("Failed to load users", e)
      } finally {
        setLoading(false)
      }
    }

    fetchUsersData()
  }, [user, router])

  const handleAcceptRequest = async (followerId: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/users/${user?.id}/accept-follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId })
      })
      
      if (res.ok) {
        // Refresh session
        const sessionRes = await fetch(`http://127.0.0.1:3000/api/users/${user?.id}`)
        if (sessionRes.ok) {
          const updatedUser = await sessionRes.json()
          login(updatedUser) // Re-login updates context without actually calling login endpoint if passing user obj
          window.location.reload()
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleRejectRequest = async (followerId: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/users/${user?.id}/reject-follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId })
      })
      if (res.ok) {
        window.location.reload()
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-medium animate-pulse">Loading social network...</p>
      </div>
    )
  }

  const renderUserCard = (u: any, actions?: React.ReactNode) => (
    <div key={u.id} className="bg-secondary/20 p-4 rounded-xl border border-border flex items-center justify-between hover:bg-secondary/40 transition-colors">
      <div 
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => router.push(`/profile/${u.id}`)}
      >
        <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-lg">
          <AvatarImage src={u.profilePicUrl} />
          <AvatarFallback>{u.username.substring(0,2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-foreground text-sm flex items-center gap-1">
            {u.username}
          </h3>
          <p className="text-xs text-muted-foreground">{u.title || "Pokémon Trainer"}</p>
        </div>
      </div>
      <div>{actions}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Social Network</h1>
            <p className="text-sm text-muted-foreground font-medium">Manage your friends and connections</p>
          </div>
        </div>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="w-full bg-secondary/50 p-1 mb-8">
            <TabsTrigger value="friends" className="flex-1 font-bold">
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1 font-bold">
              Following ({following.length})
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex-1 font-bold">
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex-1 font-bold relative">
              Requests
              {requests.length > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-destructive animate-pulse" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            {friends.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="font-bold">You don't have any friends yet</p>
                <p className="text-sm">Follow other users and if they follow you back, they will appear here.</p>
              </div>
            ) : (
              friends.map(u => renderUserCard(u, <Button variant="outline" size="sm" className="font-bold border-primary/50 text-primary pointer-events-none"><UserCheck className="h-4 w-4 mr-2"/> Mutual</Button>))
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            {following.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-bold">You are not following anyone (who isn't already a friend)</p>
              </div>
            ) : (
              following.map(u => renderUserCard(u))
            )}
          </TabsContent>

          <TabsContent value="followers" className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            {followers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-bold">No one is following you (who isn't already a friend)</p>
              </div>
            ) : (
              followers.map(u => renderUserCard(u))
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            {requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Check className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="font-bold">You're all caught up</p>
                <p className="text-sm">You have no pending requests.</p>
              </div>
            ) : (
              requests.map(u => renderUserCard(u, (
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRejectRequest(u.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    className="font-bold text-xs"
                    onClick={() => handleAcceptRequest(u.id)}
                  >
                    Accept
                  </Button>
                </div>
              )))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
