"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Room {
  id: string
  name: string
  description: string | null
  address: string
  rent: number
  deposit: number | null
  size: number | null
  bedrooms: number
  bathrooms: number
  status: string
  amenities: string[]
  images: string[]
}

interface RoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room?: Room | null
  onSave: (room: Partial<Room>) => void
}

export function RoomDialog({ open, onOpenChange, room, onSave }: RoomDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    rent: "",
    deposit: "",
    size: "",
    bedrooms: "1",
    bathrooms: "1",
    status: "AVAILABLE",
    amenities: "",
  })

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        description: room.description || "",
        address: room.address,
        rent: room.rent.toString(),
        deposit: room.deposit?.toString() || "",
        size: room.size?.toString() || "",
        bedrooms: room.bedrooms.toString(),
        bathrooms: room.bathrooms.toString(),
        status: room.status,
        amenities: room.amenities.join(", "),
      })
    } else {
      setFormData({
        name: "",
        description: "",
        address: "",
        rent: "",
        deposit: "",
        size: "",
        bedrooms: "1",
        bathrooms: "1",
        status: "AVAILABLE",
        amenities: "",
      })
    }
  }, [room, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const roomData: Partial<Room> = {
      name: formData.name,
      description: formData.description || null,
      address: formData.address,
      rent: parseFloat(formData.rent),
      deposit: formData.deposit ? parseFloat(formData.deposit) : null,
      size: formData.size ? parseFloat(formData.size) : null,
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      status: formData.status,
      amenities: formData.amenities
        ? formData.amenities.split(",").map(a => a.trim()).filter(Boolean)
        : [],
      images: [],
    }

    onSave(roomData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{room ? "Edit Room" : "Add New Room"}</DialogTitle>
          <DialogDescription>
            {room ? "Update the room details below" : "Fill in the details for the new room"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Room Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="OCCUPIED">Occupied</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="RESERVED">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rent">Monthly Rent ($) *</Label>
                <Input
                  id="rent"
                  type="number"
                  step="0.01"
                  value={formData.rent}
                  onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit">Deposit ($)</Label>
                <Input
                  id="deposit"
                  type="number"
                  step="0.01"
                  value={formData.deposit}
                  onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size (sq ft)</Label>
                <Input
                  id="size"
                  type="number"
                  step="0.01"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms *</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="1"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms *</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="1"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="WiFi, Parking, Air Conditioning"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {room ? "Update Room" : "Add Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
