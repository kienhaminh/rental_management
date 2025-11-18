import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
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
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    )
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
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}
