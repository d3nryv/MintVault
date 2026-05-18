"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

/**
 * Defines the available properties and state control methods provided by MarketplaceContext.
 * Used for filtering marketplace listings across the application by card language.
 */
interface MarketplaceContextType {
    language: string
    setLanguage: (lang: string) => void
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined)

/**
 * MarketplaceProvider component that manages language preference state across marketplace modules.
 * Restores previous preference from localStorage upon initialization.
 *
 * @param props.children - Child components requiring marketplace filter context.
 */
export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<string>("all")

    useEffect(() => {
        // Retrieve saved language preference from localStorage on initial load
        const savedLanguage = localStorage.getItem('marketplace_language')
        if (savedLanguage) {
            setLanguageState(savedLanguage)
        }
    }, [])

    /**
   * Updates the marketplace language state and saves preference to localStorage.
   *
   * @param lang - The language code to apply (e.g. 'all', 'EN', 'ES').
   */
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

/**
 * Custom hook to consume the MarketplaceContext.
 * Ensures that calling components are nested inside a MarketplaceProvider hierarchy.
 *
 * @returns The current marketplace context containing language state and setters.
 * @throws Error if called outside of a MarketplaceProvider component tree.
 */
export function useMarketplace() {
    const context = useContext(MarketplaceContext)
    if (context === undefined) {
        throw new Error('useMarketplace must be used within a MarketplaceProvider hierarchy')
    }
    return context
}
