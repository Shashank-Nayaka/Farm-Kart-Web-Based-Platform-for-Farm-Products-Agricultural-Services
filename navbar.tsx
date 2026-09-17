"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ShoppingCart,
  Menu,
  Leaf,
  Home,
  Store,
  Truck,
  ClipboardList,
  User,
  LogIn,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet"
import { useCart } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { toast } from "sonner"

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/vehicles", label: "Vehicles", icon: Truck },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/profile", label: "Profile", icon: User },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems } = useCart()
  const { user, loading, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    const success = await logout()
    setLoggingOut(false)

    if (success) {
      toast.success("You have been logged out.")
      setMobileOpen(false)
      router.push("/")
    } else {
      toast.error("Could not log out.")
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Farm<span className="text-primary">Kart</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={isActive ? "" : "text-muted-foreground hover:text-foreground"}
                >
                  <link.icon className="mr-1.5 h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/shop">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary p-0 text-xs text-secondary-foreground">
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>
          </Link>

          {!loading && (
            <>
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden gap-2 sm:flex"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? "Logging out..." : "Logout"}
                </Button>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="hidden gap-2 sm:flex">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
              )}
            </>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Leaf className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold">
                    Farm<span className="text-primary">Kart</span>
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          isActive ? "" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                      </Button>
                    </Link>
                  )
                })}

                <div className="my-3 border-t" />

                {user ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {loggingOut ? "Logging out..." : `Logout ${user.name.split(" ")[0]}`}
                  </Button>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full justify-start">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login / Create account
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
