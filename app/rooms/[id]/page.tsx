'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Building2, MapPin, DollarSign, Bed, Bath } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UtilityConsumptionDialog } from '@/components/rooms/utility-consumption-dialog';
import { UtilityConsumptionList } from '@/components/rooms/utility-consumption-list';

interface Room {
  id: string;
  name: string;
  address: string;
  rent: number;
  deposit?: number;
  size?: number;
  bedrooms: number;
  bathrooms: number;
  status: string;
  amenities: string[];
  description?: string;
  tenants?: any[];
}

interface UtilityConsumption {
  id: string;
  roomId: string;
  month: number;
  year: number;
  electricNumber: number;
  waterNumber: number;
  previousElectricNumber?: number;
  previousWaterNumber?: number;
  electricCost?: number;
  waterCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function RoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [consumptions, setConsumptions] = useState<UtilityConsumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConsumption, setEditingConsumption] = useState<UtilityConsumption | null>(null);

  useEffect(() => {
    fetchRoomData();
    fetchConsumptions();
  }, [roomId]);

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`);
      if (response.ok) {
        const data = await response.json();
        setRoom(data);
      }
    } catch (error) {
      console.error('Error fetching room:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsumptions = async () => {
    try {
      const response = await fetch(`/api/utility-consumption?roomId=${roomId}`);
      if (response.ok) {
        const data = await response.json();
        setConsumptions(data);
      }
    } catch (error) {
      console.error('Error fetching consumptions:', error);
    }
  };

  const handleAddConsumption = () => {
    setEditingConsumption(null);
    setIsDialogOpen(true);
  };

  const handleEditConsumption = (consumption: UtilityConsumption) => {
    setEditingConsumption(consumption);
    setIsDialogOpen(true);
  };

  const handleConsumptionSaved = () => {
    fetchConsumptions();
    setIsDialogOpen(false);
    setEditingConsumption(null);
  };

  const handleDeleteConsumption = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/utility-consumption/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchConsumptions();
      }
    } catch (error) {
      console.error('Error deleting consumption:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: 'bg-green-500',
      OCCUPIED: 'bg-blue-500',
      MAINTENANCE: 'bg-yellow-500',
      RESERVED: 'bg-purple-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p>Room not found</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Room Information */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  {room.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <MapPin className="h-4 w-4" />
                  {room.address}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(room.status)}>
                {room.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Monthly Rent</p>
                  <p className="font-semibold">${room.rent.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="font-semibold">{room.bedrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                  <p className="font-semibold">{room.bathrooms}</p>
                </div>
              </div>
              {room.size && (
                <div>
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="font-semibold">{room.size} sqft</p>
                </div>
              )}
            </div>

            {room.amenities && room.amenities.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {room.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-sm">{room.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Utility Consumption Tracking */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Monthly Utility Consumption</CardTitle>
                <CardDescription>
                  Track electric and water meter readings for this room
                </CardDescription>
              </div>
              <Button onClick={handleAddConsumption}>
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <UtilityConsumptionList
              consumptions={consumptions}
              onEdit={handleEditConsumption}
              onDelete={handleDeleteConsumption}
            />
          </CardContent>
        </Card>

        {/* Utility Consumption Dialog */}
        <UtilityConsumptionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          roomId={roomId}
          consumption={editingConsumption}
          onSaved={handleConsumptionSaved}
        />
      </div>
    </div>
  );
}
