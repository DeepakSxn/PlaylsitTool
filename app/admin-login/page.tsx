"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "../theme-toggle"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

const AdminLoginPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }
    setLoading(true)
    setError("")
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const adminQuery = query(collection(db, "admins"), where("userId", "==", userCredential.user.uid))
      const querySnapshot = await getDocs(adminQuery)
      if (querySnapshot.empty) {
        await auth.signOut()
        setError("You do not have admin privileges")
        setLoading(false)
        return
      }
      router.push("/admin-dashboard")
    } catch (err: any) {
      setError(err.code === "auth/user-not-found" || err.code === "auth/wrong-password" 
        ? "Invalid email or password" 
        : "Failed to log in. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="w-full border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-iZKjcWij4vfxfUuaJ19T8bUqjZrXoP.jpeg"
              alt="EOXS Logo"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                User Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-primary/10">
                <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold">Admin Login</CardTitle>
              <p className="text-sm text-muted-foreground">Enter your credentials to access the admin panel</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="w-full border-t bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto">
          <div className="flex flex-col  gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-3 ">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-iZKjcWij4vfxfUuaJ19T8bUqjZrXoP.jpeg"
                alt="EOXS Logo"
                width={80}
                height={30}
                className="object-contain"
              />
              <p className="text-sm text-muted-foreground">Where Steel Meets Technology</p>
            </div>
            <div className="flex items-center pl-11 pr-11 mr-52 ml-40 ">
            <p className="text-sm text-muted-foreground ">
          
            </p>
            </div>
            <div className="flex items-center gap-4 ml-80 pl-40 ">
            <p className="text-sm text-muted-foreground ">
            © {new Date().getFullYear()} EOXS. All rights reserved.
            </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AdminLoginPage