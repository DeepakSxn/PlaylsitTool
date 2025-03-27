"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "../theme-toggle"
import { db } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Eye, EyeOff, Loader2, User, UserPlus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/firebase"
import { toast } from "@/components/ui/use-toast"
import { UserCredential } from "firebase/auth"

export default function SignUp() {
  const router = useRouter()
  const { signup } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Reset error
    setError("")

    // Collect all validation errors
    const errors = []

    if (!name) {
      errors.push("Name is required")
    }

    if (!email) {
      errors.push("Email is required")
    }

    if (!password) {
      errors.push("Password is required")
    } else if (password.length < 6) {
      errors.push("Password must be at least 6 characters")
    }

    if (!confirmPassword) {
      errors.push("Please confirm your password")
    } else if (password !== confirmPassword) {
      errors.push("Passwords do not match")
    }

    if (!termsAccepted) {
      errors.push("You must accept the terms and conditions")
    }

    if (errors.length > 0) {
      setError(errors.join(". "))
      setLoading(false)
      return
    }

    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      // Add user to users collection
      await addDoc(collection(db, "users"), {
        userId: userCredential.user.uid,
        email: userCredential.user.email,
        name: name,
        createdAt: serverTimestamp(),
        role: "user",
      })

      toast({
        title: "Success",
        description: "Account created successfully!",
      })

      router.push("/dashboard")
    } catch (err: any) {
      console.error("Error signing up:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
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
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/admin-login">
              <Button variant="outline" size="sm" className="gap-2">
                <User size={16} />
                <span>Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center space-y-4 pb-0">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold mb-2">Create Account</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enter your details to get started
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-4">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      className="h-10"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-10"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Terms Acceptance */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={() => setTermsAccepted(!termsAccepted)}
                    />
                    <Label 
                      htmlFor="terms" 
                      className="text-sm font-normal text-muted-foreground"
                    >
                      I accept the Terms and Conditions
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-4 text-muted-foreground text-sm">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Signup Button */}
                <Button
                  variant="outline"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="w-full"
                >
                  <svg role="img" viewBox="0 0 24 24" className="mr-2 h-5 w-5">
                    <path
                      fill="currentColor"
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    />
                  </svg>
                  Continue with Google
                </Button>
            </CardContent>

            {/* Footer */}
            <CardFooter className="justify-center text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}