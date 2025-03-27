"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signInWithEmailAndPassword, User } from "firebase/auth"
import { auth, db } from "../firebase"
import { ThemeToggle } from "../theme-toggle"
import { collection, getDocs, query, where } from "firebase/firestore"


export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [user, setUser] = useState<any>(null)
  const [hasPlaylists, setHasPlaylists] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      setLoading(false)
     
      
          const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
              setUser(currentUser)
              checkUserPlaylists(currentUser.uid)
            } else {
              // Redirect to login if not authenticated
              router.push("/playlistlog")
            }
          })
          const checkUserPlaylists = async (userId: string) => {
            try {
              const playlistsQuery = query(collection(db, "playlists"), where("userId", "==", userId))
              const playlistsSnapshot = await getDocs(playlistsQuery)
              const hasExistingPlaylists = !playlistsSnapshot.empty
        
              setHasPlaylists(hasExistingPlaylists)
        
              // If user already has a playlist, redirect to feedback
              if (hasExistingPlaylists) {
                router.push("/playlist/[id]")
              } else {
                router.push('/')
              }
            } catch (error) {
              console.error("Error checking playlists:", error)
            }
          }
    } catch (err: any) {
      setLoading(false)
      // Handle specific Firebase auth errors
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password")
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later")
      } else {
        setError("Failed to login. Please try again.")
      }
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-iZKjcWij4vfxfUuaJ19T8bUqjZrXoP.jpeg"
            alt="EOXS Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Login to your account</CardTitle>
            <CardDescription>Enter your email and password to sign in</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#000000] hover:bg-[#0c0e0c]" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          
        </Card>
      </main>

      <footer className="border-t bg-gray-50 dark:bg-gray-900">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">Where Steel Meets Technology</p>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 md:text-left">
            © {new Date().getFullYear()} EOXS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
