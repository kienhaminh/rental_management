"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoomCard } from "@/components/rooms/room-card"
import { RoomDialog } from "@/components/rooms/room-dialog"
import { Plus, Building2, Users, DollarSign, Home as HomeIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
  tenants?: any[]
}

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [filter, setFilter] = useState<string>("ALL")

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      setRooms(data)
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRoom = async (roomData: Partial<Room>) => {
    try {
      if (editingRoom) {
        // Update existing room
        const response = await fetch(`/api/rooms/${editingRoom.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(roomData),
        })
        const updatedRoom = await response.json()
        setRooms(rooms.map(r => r.id === editingRoom.id ? updatedRoom : r))
      } else {
        // Create new room
        const response = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(roomData),
        })
        const newRoom = await response.json()
        setRooms([newRoom, ...rooms])
      }
      setEditingRoom(null)
    } catch (error) {
      console.error('Error saving room:', error)
    }
  }

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room)
    setDialogOpen(true)
  }

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return

    try {
      await fetch(`/api/rooms/${id}`, { method: 'DELETE' })
      setRooms(rooms.filter(r => r.id !== id))
    } catch (error) {
      console.error('Error deleting room:', error)
    }
  }

  const handleAddNew = () => {
    setEditingRoom(null)
    setDialogOpen(true)
  }

  const filteredRooms = filter === "ALL"
    ? rooms
    : rooms.filter(r => r.status === filter)

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'AVAILABLE').length,
    occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
    totalRevenue: rooms
      .filter(r => r.status === 'OCCUPIED')
      .reduce((sum, r) => sum + r.rent, 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <HomeIcon className="h-8 w-8 text-primary" />
                Rental Management Platform
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your rental properties efficiently
              </p>
            </div>
            <Button onClick={handleAddNew} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Room
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <HomeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.occupied}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${stats.totalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <Badge
              variant={filter === "ALL" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("ALL")}
            >
              All Rooms
            </Badge>
            <Badge
              variant={filter === "AVAILABLE" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("AVAILABLE")}
            >
              Available
            </Badge>
            <Badge
              variant={filter === "OCCUPIED" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("OCCUPIED")}
            >
              Occupied
            </Badge>
            <Badge
              variant={filter === "MAINTENANCE" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("MAINTENANCE")}
            >
              Maintenance
            </Badge>
            <Badge
              variant={filter === "RESERVED" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("RESERVED")}
            >
              Reserved
            </Badge>
          </div>
        </div>

        {filteredRooms.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Rooms Found</CardTitle>
              <CardDescription>
                {filter === "ALL"
                  ? "Get started by adding your first room"
                  : `No rooms with status "${filter}"`
                }
              </CardDescription>
            </CardHeader>
            {filter === "ALL" && (
              <CardContent>
                <Button onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Room
                </Button>
              </CardContent>
            )}
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onEdit={handleEditRoom}
                onDelete={handleDeleteRoom}
              />
            ))}
          </div>
        )}
      </div>

      <RoomDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        room={editingRoom}
        onSave={handleSaveRoom}
      />
    </div>
  )
}
