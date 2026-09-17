import { Leaf, Phone, Mail, MapPin } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Farm<span className="text-primary">Kart</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your one-stop destination for all farming needs. Quality products
              and reliable equipment at your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li><Link href="/shop" className="transition-colors hover:text-primary">Shop Products</Link></li>
              <li><Link href="/vehicles" className="transition-colors hover:text-primary">Book Vehicles</Link></li>
              <li><Link href="/orders" className="transition-colors hover:text-primary">Track Orders</Link></li>
              <li><Link href="/profile" className="transition-colors hover:text-primary">My Profile</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Categories</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li><Link href="/shop?category=seeds" className="transition-colors hover:text-primary">Seeds & Plants</Link></li>
              <li><Link href="/shop?category=fertilizers" className="transition-colors hover:text-primary">Fertilizers & Pesticides</Link></li>
              <li><Link href="/shop?category=tools" className="transition-colors hover:text-primary">Tools & Equipment</Link></li>
              <li><Link href="/shop?category=animal-feed" className="transition-colors hover:text-primary">Animal Feed & Care</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Contact Us</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                +91 1800-FARM-KART
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                support@farmkart.in
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                New Delhi, India
              </li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <p className="text-center text-xs text-muted-foreground">
          2026 FarmKart. All rights reserved. Built for Indian Farmers.
        </p>
      </div>
    </footer>
  )
}
