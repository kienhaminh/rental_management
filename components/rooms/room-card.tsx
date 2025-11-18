"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Bed, Bath, DollarSign, Edit, Trash2 } from "lucide-react"

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

interface RoomCardProps {
  room: Room
  onEdit: (room: Room) => void
  onDelete: (id: string) => void
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-500",
  OCCUPIED: "bg-blue-500",
  MAINTENANCE: "bg-yellow-500",
  RESERVED: "bg-purple-500",
}

export function RoomCard({ room, onEdit, onDelete }: RoomCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{room.name}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {room.address}
            </CardDescription>
          </div>
          <Badge className={statusColors[room.status]}>
            {room.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {room.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {room.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <span>{room.bedrooms} Bedrooms</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <span>{room.bathrooms} Bathrooms</span>
          </div>
        </div>

        {room.size && (
          <div className="text-sm text-muted-foreground">
            Size: {room.size} sq ft
          </div>
        )}

        <div className="flex items-center gap-2 text-lg font-semibold">
          <DollarSign className="h-5 w-5 text-primary" />
          {room.rent.toLocaleString()}/month
        </div>

        {room.deposit && (
          <div className="text-sm text-muted-foreground">
            Deposit: ${room.deposit.toLocaleString()}
          </div>
        )}

        {room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {room.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {room.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{room.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(room)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onClick={() => onDelete(room.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
