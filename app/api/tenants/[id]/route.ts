import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        room: true,
        payments: {
          orderBy: {
            dueDate: 'desc'
          }
        }
      }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error('Error fetching tenant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenant' },
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

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        moveInDate: body.moveInDate ? new Date(body.moveInDate) : undefined,
        moveOutDate: body.moveOutDate ? new Date(body.moveOutDate) : undefined,
        rent: body.rent ? parseFloat(body.rent) : undefined,
        deposit: body.deposit ? parseFloat(body.deposit) : undefined,
        status: body.status
      }
    })

    return NextResponse.json(tenant)
  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json(
      { error: 'Failed to update tenant' },
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
    const tenant = await prisma.tenant.findUnique({
      where: { id }
    })

    if (tenant) {
      // Update room status back to AVAILABLE
      const activeTenantsCount = await prisma.tenant.count({
        where: {
          roomId: tenant.roomId,
          status: 'ACTIVE',
          id: { not: id }
        }
      })

      if (activeTenantsCount === 0) {
        await prisma.room.update({
          where: { id: tenant.roomId },
          data: { status: 'AVAILABLE' }
        })
      }
    }

    await prisma.tenant.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tenant:', error)
    return NextResponse.json(
      { error: 'Failed to delete tenant' },
      { status: 500 }
    )
  }
}
