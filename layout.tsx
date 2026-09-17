import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
// @ts-expect-error - CSS imports are handled by the Next.js bundler.
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CartProvider, OrderProvider } from "@/lib/store"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/sonner"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "FarmKart - Everything Your Farm Needs",
  description:
    "Buy farming supplies like seeds, fertilizers, tools, and animal feed. Book tractors, harvesters, crushers and more. Built for Indian farmers.",
}

export const viewport: Viewport = {
  themeColor: "#16a34a",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${_inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster richColors position="top-right" />
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
