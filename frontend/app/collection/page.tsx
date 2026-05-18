"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SetsSection } from "@/components/sections/sets-section"
import { PokedexSection } from "@/components/sections/pokedex-section"
import { ProfileSection } from "@/components/sections/profile-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Layers, BookOpen, User } from "lucide-react"
import { useAuth } from "@/context/auth-context"

function CollectionTabs() {
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState("sets")

    useEffect(() => {
        const tab = searchParams.get("tab")
        if (tab) {
            setActiveTab(tab)
        }
    }, [searchParams])

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="sets" className="gap-2">
                    <Layers className="h-4 w-4" />
                    <span className="hidden sm:inline">Sets</span>
                </TabsTrigger>
                <TabsTrigger value="pokedex" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Pokédex</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="sets">
                <SetsSection />
            </TabsContent>

            <TabsContent value="pokedex">
                <PokedexSection />
            </TabsContent>

            <TabsContent value="profile">
                <ProfileSection />
            </TabsContent>
        </Tabs>
    )
}

export default function CollectionPage() {
    const { user } = useAuth()
    
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-20">
                <div className="mx-auto max-w-[1700px] px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="font-sans text-4xl font-bold tracking-tight text-foreground">
                            Your Collection
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Browse sets, explore the Pokédex, and manage your profile
                        </p>
                    </div>

                    <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
                        <CollectionTabs />
                    </Suspense>
                </div>
            </main>
            <Footer />
        </div>
    )
}