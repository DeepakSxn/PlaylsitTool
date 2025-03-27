import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube,
  Mail,
  Phone,
  MapPin
} from "lucide-react"

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 md:px-8 border-b border-neutral-200 dark:border-neutral-800">
        <Link href="/" className="flex items-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-iZKjcWij4vfxfUuaJ19T8bUqjZrXoP.jpeg"
            alt="EOXS Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </Link>
        <nav className="flex gap-4 sm:gap-6 items-center">
          <Link href="/admin-login">
            <Button variant="outline">Admin</Button>
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="text-center w-full max-w-3xl px-4">
          <h1 className="text-4xl font-bold mb-6">Welcome to EOXS Video Tool</h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
            A powerful platform for managing and sharing video content in the steel industry
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">About EOXS</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Revolutionizing video content management in the steel industry with cutting-edge technology.
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com/eoxs" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                  <Facebook size={20} />
                </a>
                <a href="https://twitter.com/eoxs" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                  <Twitter size={20} />
                </a>
                <a href="https://linkedin.com/company/eoxs" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                  <Linkedin size={20} />
                </a>
                <a href="https://instagram.com/eoxs" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                  <Instagram size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">Home</Link></li>
                <li><Link href="/about" className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">About Us</Link></li>
                <li><Link href="/services" className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">Services</Link></li>
                <li><Link href="/features" className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">Features</Link></li>
                <li><Link href="/contact" className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">Contact</Link></li>
              </ul>
            </div>

            {/* Services Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">Our Services</h4>
              <ul className="space-y-2">
                <li><Link href="/video-management" className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">Video Management</Link></li>
                <li><Link href="/content-sharing" className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">Content Sharing</Link></li>
                <li><Link href="/analytics" className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">Analytics</Link></li>
                <li><Link href="/integrations" className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">Integrations</Link></li>
                <li><Link href="/support" className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">Support</Link></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">Contact Us</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail size={20} className="text-neutral-500 dark:text-neutral-400" />
                  <a href="mailto:info@eoxs.com" className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">info@eoxs.com</a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={20} className="text-neutral-500 dark:text-neutral-400" />
                  <a href="tel:+1234567890" className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">+1 (234) 567-890</a>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin size={20} className="text-neutral-500 dark:text-neutral-400 mt-1" />
                  <address className="text-neutral-600 dark:text-neutral-400 not-italic">
                    123 Tech Lane, 
                    Innovation Park, 
                    Silicon Valley, CA 94000
                  </address>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright and Legal Links */}
          <div className="mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 md:mb-0">
              &copy; {new Date().getFullYear()} EOXS. All Rights Reserved.
            </p>
            <div className="flex space-x-4">
              <Link href="/privacy-policy" className="text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}