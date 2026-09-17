"use client"

import { useState } from "react"
import {
  Tractor,
  Cog,
  Truck,
  Plane,
  CalendarDays,
  Clock,
  MapPin,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { vehicles, timeSlots } from "@/lib/data"
import type { Vehicle } from "@/lib/data"
import { useOrders } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { startRazorpayCheckout } from "@/lib/razorpay"
import { toast } from "sonner"

const vehicleIcons: Record<string, React.ElementType> = {
  Tractor: Tractor,
  Cog: Cog,
  Truck: Truck,
  Plane: Plane,
}

const vehicleEmoji: Record<string, string> = {
  Tractor: "\u{1F69C}",
  Cog: "\u2699\uFE0F",
  Truck: "\u{1F69B}",
  Plane: "\u{1F681}",
}

export default function VehiclesPage() {
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null)
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined)
  const [timeSlot, setTimeSlot] = useState("")
  const [durationType, setDurationType] = useState<"hourly" | "daily">("daily")
  const [hours, setHours] = useState("8")
  const [location, setLocation] = useState("")
  const [paying, setPaying] = useState(false)
  const { addOrder, orders } = useOrders()
  const { user } = useAuth()

  const activeBookings = orders.filter(
    (o) => o.type === "vehicle" && o.status !== "delivered"
  )

  const calculateTotal = () => {
    if (!bookingVehicle) return 0
    if (durationType === "daily") return bookingVehicle.dailyRate
    return bookingVehicle.hourlyRate * parseInt(hours || "1")
  }

  const handleBook = async () => {
    if (!bookingVehicle || !bookingDate || !timeSlot || !location.trim()) {
      toast.error("Please fill in all booking details")
      return
    }
    if (!user) {
      toast.error("Please log in before booking a vehicle.")
      window.location.href = "/login"
      return
    }

    setPaying(true)
    try {
      const createResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "vehicle",
          vehicleId: bookingVehicle.id,
          bookingDate: bookingDate.toISOString().split("T")[0],
          timeSlot,
          durationType,
          hours: durationType === "hourly" ? Number(hours || 1) : undefined,
          location,
        }),
      })
      const createData = await createResponse.json()
      if (!createResponse.ok) throw new Error(createData.error || "Unable to start payment.")

      await startRazorpayCheckout({
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        name: "FarmKart",
        description: `Vehicle booking - ${bookingVehicle.name}`,
        order_id: createData.razorpayOrderId,
        prefill: { name: createData.name, email: createData.email, contact: createData.phone },
        theme: { color: "#16a34a" },
        handler: async (result) => {
          try {
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(result),
            })
            const verifyData = await verifyResponse.json()
            if (!verifyResponse.ok) throw new Error(verifyData.error || "Payment verification failed.")

            const saved = verifyData.order
            addOrder({ ...saved, id: saved.id || saved.appOrderId })
            setBookingVehicle(null)
            setBookingDate(undefined)
            setTimeSlot("")
            setLocation("")
            setHours("8")
            toast.success("Payment successful!", { description: `${saved.vehicleName} booking ${saved.id} is confirmed.` })
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Payment verification failed.")
          } finally {
            setPaying(false)
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      })
    } catch (error) {
      setPaying(false)
      toast.error(error instanceof Error ? error.message : "Unable to start payment.")
    }
  }

  const resetDialog = () => {
    setBookingVehicle(null)
    setBookingDate(undefined)
    setTimeSlot("")
    setLocation("")
    setHours("8")
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Book Farm Vehicles
        </h1>
        <p className="mt-1 text-muted-foreground">
          Rent tractors, harvesters, and more - delivered to your farm
        </p>
      </div>

      {/* Vehicle Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => {
          const IconComponent = vehicleIcons[vehicle.icon] || Tractor
          return (
            <Card
              key={vehicle.id}
              className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <CardContent className="p-6">
                {/* Vehicle Image Area */}
                <div className="mb-4 flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-dashed border-primary/20">
                  <span className="text-7xl" role="img" aria-label={vehicle.name}>
                    {vehicleEmoji[vehicle.icon] || "\u{1F69C}"}
                  </span>
                </div>

                {/* Availability Badge */}
                <div className="mb-3 flex items-center justify-between">
                  <Badge
                    variant={vehicle.available ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {vehicle.available ? (
                      <>
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Available
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1 h-3 w-3" /> Booked
                      </>
                    )}
                  </Badge>
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                </div>

                <h3 className="text-lg font-bold text-foreground">
                  {vehicle.name}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {vehicle.description}
                </p>

                {/* Specs */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {vehicle.specs.map((spec) => (
                    <Badge key={spec} variant="outline" className="text-[10px]">
                      {spec}
                    </Badge>
                  ))}
                </div>

                {/* Pricing */}
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-primary">
                        Rs {vehicle.hourlyRate}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        /hr
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-foreground">
                        Rs {vehicle.dailyRate}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        /day
                      </span>
                    </div>
                  </div>
                  <Button
                    disabled={!vehicle.available}
                    onClick={() => setBookingVehicle(vehicle)}
                  >
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Active Bookings */}
      {activeBookings.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Active Bookings
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      {booking.vehicleName}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>Booked for: {booking.bookingDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{booking.timeSlot}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 font-semibold text-primary">
                    <IndianRupee className="h-3.5 w-3.5" />
                    Rs {booking.total}
                  </div>
                  {booking.payment && (
                    <div className="mt-1 rounded-md bg-primary/5 px-2.5 py-2 text-xs">
                      <span className="font-semibold text-primary">Payment: {booking.payment.status === "paid" ? "Paid" : booking.payment.status}</span>
                      <span className="text-muted-foreground"> · {booking.payment.method}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog
        open={!!bookingVehicle}
        onOpenChange={(open) => {
          if (!open) resetDialog()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Book {bookingVehicle?.name}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to book this vehicle for your farm.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-2">
            {/* Date Picker */}
            <div className="flex flex-col gap-2">
              <Label className="font-medium">Select Date</Label>
              <div className="flex justify-center rounded-lg border p-2">
                <Calendar
                  mode="single"
                  selected={bookingDate}
                  onSelect={setBookingDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md"
                />
              </div>
            </div>

            {/* Time Slot */}
            <div className="flex flex-col gap-2">
              <Label className="font-medium">Time Slot</Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.label} ({slot.time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-2">
              <Label className="font-medium">Duration</Label>
              <div className="flex gap-2">
                <Button
                  variant={durationType === "daily" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDurationType("daily")}
                >
                  Full Day
                </Button>
                <Button
                  variant={durationType === "hourly" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDurationType("hourly")}
                >
                  By Hours
                </Button>
              </div>
              {durationType === "hourly" && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">hours</span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <Label className="font-medium">Farm Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter your farm address or village name"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Price Summary */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Price Breakdown</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {bookingVehicle?.name} (
                  {durationType === "daily"
                    ? "Full Day"
                    : `${hours} hours`}
                  )
                </span>
                <span className="text-lg font-bold text-primary">
                  Rs {calculateTotal()}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>
            <Button onClick={handleBook} disabled={paying}>
              {paying ? "Opening payment..." : `Proceed to Payment - Rs ${calculateTotal()}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
