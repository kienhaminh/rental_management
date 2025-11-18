import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const roomId = searchParams.get('roomId')

    const tenants = await prisma.tenant.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(roomId ? { roomId } : {})
      },
      include: {
        room: true,
        payments: {
          orderBy: {
            dueDate: 'desc'
          },
          take: 3
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tenants)
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const tenant = await prisma.tenant.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        roomId: body.roomId,
        moveInDate: new Date(body.moveInDate),
        moveOutDate: body.moveOutDate ? new Date(body.moveOutDate) : null,
        rent: parseFloat(body.rent),
        deposit: parseFloat(body.deposit),
        status: body.status || 'ACTIVE'
      }
    })

    // Update room status to OCCUPIED
    await prisma.room.update({
      where: { id: body.roomId },
      data: { status: 'OCCUPIED' }
    })

    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    )
  }
}
