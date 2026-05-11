"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface MarketplaceContextType {
    language: string
    setLanguage: (lang: string) => void
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined)

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<string>("all")

    useEffect(() => {
        const savedLanguage = localStorage.getItem('marketplace_language')
        if (savedLanguage) {
            setLanguageState(savedLanguage)
        }
    }, [])

    const setLanguage = (lang: string) => {
        setLanguageState(lang)
        localStorage.setItem('marketplace_language', lang)
    }

    return (
        <MarketplaceContext.Provider value={{ language, setLanguage }}>
            {children}
        </MarketplaceContext.Provider>
    )
}

export function useMarketplace() {
    const context = useContext(MarketplaceContext)
    if (context === undefined) {
        throw new Error('useMarketplace must be used within a MarketplaceProvider')
    }
    return context
}
