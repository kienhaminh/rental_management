import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockRooms } from '@/lib/mockData'

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
    console.error('Database not available, using mock data:', error)
    // Return mock data when database is not available
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    let filteredRooms = mockRooms
    if (status) {
      filteredRooms = mockRooms.filter(room => room.status === status)
    }

    return NextResponse.json(filteredRooms)
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
    console.error('Database not available, simulating room creation:', error)
    // Simulate success when database is not available
    const body = await request.json()
    const newRoom = {
      id: `mock-${Date.now()}`,
      ...body,
      rent: parseFloat(body.rent),
      deposit: body.deposit ? parseFloat(body.deposit) : null,
      size: body.size ? parseFloat(body.size) : null,
      bedrooms: parseInt(body.bedrooms),
      bathrooms: parseInt(body.bathrooms),
      status: body.status || 'AVAILABLE',
      amenities: body.amenities || [],
      images: body.images || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tenants: []
    }
    return NextResponse.json(newRoom, { status: 201 })
  }
}
