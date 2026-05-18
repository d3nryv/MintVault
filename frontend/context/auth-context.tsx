"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

/**
 * Represents the structure of an authenticated user entity.
 * Contains core identity fields as well as customizable social and collection lists.
 */
interface User {
  id: string
  username: string
  email: string
  profilePicUrl?: string
  balance?: number
  showcase?: string[]
  albums?: string[]
  ownedEnglishCards?: string[]
  ownedPokemon?: string[]
  wantList?: string[]
  cart?: string[]
  country?: string
  followers?: string[]
  following?: string[]
  friendRequests?: string[]
  sellerInfo?: string
}

/**
 * Defines the available properties and authentication methods provided by AuthContext.
 */
interface AuthContextType {
  /** The currently authenticated user, or null if unauthenticated. */
  user: User | null
  /** Authenticates a user and persists their session data in local storage. */
  login: (userData: User) => void
  /** Clears the active session and removes stored user credentials. */
  logout: () => void
  /** Updates specific fields of the active user session and synchronizes local storage. */
  updateUser: (userData: Partial<User>) => void
  /** Indicates whether the session state is currently being verified on mount. */
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * AuthProvider component that wraps the React tree to provide session management.
 * Handles persistence across browser reloads via localStorage.
 *
 * @param props.children - The child components requiring authentication context.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for saved user session in localStorage on initial mount
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Failed to parse saved user credentials from local storage', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  /**
   * Logs in the specified user by updating React state and storing credentials in localStorage.
   *
   * @param userData - The user object containing full profile and session details.
   */
  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  /**
   * Logs out the active user session, clearing state and localStorage credentials.
   */
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  /**
   * Merges partial updates into the currently authenticated user object.
   * Useful for syncing client state after making profile or collection updates to the API.
   *
   * @param userData - The subset of user properties to update.
   */
  const updateUser = (userData: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to consume the AuthContext.
 * Ensures caller components are wrapped inside an AuthProvider hierarchy.
 *
 * @returns The current authentication context containing user state and control methods.
 * @throws Error if called outside of an AuthProvider component tree.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider hierarchy')
  }
  return context
}
