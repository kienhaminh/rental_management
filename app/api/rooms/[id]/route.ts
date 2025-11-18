import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockRooms } from '@/lib/mockData'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        tenants: {
          include: {
            payments: {
              orderBy: {
                dueDate: 'desc'
              },
              take: 5
            }
          }
        }
      }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('Database not available, using mock data:', error)
    const { id } = await params
    const room = mockRooms.find(r => r.id === id)

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(room)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const room = await prisma.room.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        address: body.address,
        rent: body.rent ? parseFloat(body.rent) : undefined,
        deposit: body.deposit ? parseFloat(body.deposit) : undefined,
        size: body.size ? parseFloat(body.size) : undefined,
        bedrooms: body.bedrooms ? parseInt(body.bedrooms) : undefined,
        bathrooms: body.bathrooms ? parseInt(body.bathrooms) : undefined,
        status: body.status,
        amenities: body.amenities,
        images: body.images
      }
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error('Database not available, simulating room update:', error)
    const { id } = await params
    const body = await request.json()

    const mockRoom = mockRooms.find(r => r.id === id)
    if (!mockRoom) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    const updatedRoom = {
      ...mockRoom,
      ...body,
      rent: body.rent ? parseFloat(body.rent) : mockRoom.rent,
      deposit: body.deposit ? parseFloat(body.deposit) : mockRoom.deposit,
      size: body.size ? parseFloat(body.size) : mockRoom.size,
      bedrooms: body.bedrooms ? parseInt(body.bedrooms) : mockRoom.bedrooms,
      bathrooms: body.bathrooms ? parseInt(body.bathrooms) : mockRoom.bathrooms,
      updatedAt: new Date()
    }

    return NextResponse.json(updatedRoom)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.room.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database not available, simulating room deletion:', error)
    // Simulate success
    return NextResponse.json({ success: true })
  }
}
