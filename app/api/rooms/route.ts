import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const rooms = await prisma.room.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        tenants: {
          where: {
            status: 'ACTIVE'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const room = await prisma.room.create({
      data: {
        name: body.name,
        description: body.description,
        address: body.address,
        rent: parseFloat(body.rent),
        deposit: body.deposit ? parseFloat(body.deposit) : null,
        size: body.size ? parseFloat(body.size) : null,
        bedrooms: parseInt(body.bedrooms),
        bathrooms: parseInt(body.bathrooms),
        status: body.status || 'AVAILABLE',
        amenities: body.amenities || [],
        images: body.images || []
      }
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
