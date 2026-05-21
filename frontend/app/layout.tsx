import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { MarketplaceProvider } from "@/context/marketplace-context"

/**
 * Global typography configuration loading the Outfit font from Google Fonts.
 * Defines CSS variable `--font-outfit` for application-wide styling.
 */
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

/**
 * Standard Next.js metadata export defining site title, SEO descriptions, and favicon configurations.
 */
export const metadata: Metadata = {
  title: 'MintVault',
  description: 'Manage your Pokémon TCG collection, track your cards, build decks, and connect with other collectors.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

import { Toaster } from "@/components/ui/toaster"

/**
 * RootLayout wrapping the entire Next.js application tree.
 * Injects global theme providers, authentication providers, marketplace providers, and UI toast managers.
 *
 * @param props.children - Child page components rendered within the global layout hierarchy.
 * @returns React functional component representing the HTML document structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <MarketplaceProvider>
              {children}
            </MarketplaceProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
