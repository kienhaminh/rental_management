import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockRooms, mockTenants, mockPayments } from '@/lib/mockData'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    try {
      // Try to fetch from database
      const room = await prisma.room.findUnique({
        where: { id },
        include: {
          tenants: {
            include: {
              payments: {
                orderBy: {
                  date: 'desc'
                }
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

      // Calculate payment statistics
      const activeTenant = room.tenants.find(t => t.status === 'ACTIVE')
      const allPayments = room.tenants.flatMap(t => t.payments)
      const totalPaid = allPayments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0)
      const pendingPayments = allPayments.filter(p => p.status === 'PENDING')
      const overduePayments = allPayments.filter(p => p.status === 'OVERDUE')

      return NextResponse.json({
        room: {
          id: room.id,
          name: room.name,
          description: room.description,
          address: room.address,
          rent: room.rent,
          deposit: room.deposit,
          size: room.size,
          bedrooms: room.bedrooms,
          bathrooms: room.bathrooms,
          status: room.status,
          amenities: room.amenities,
        },
        tenant: activeTenant ? {
          id: activeTenant.id,
          firstName: activeTenant.firstName,
          lastName: activeTenant.lastName,
          email: activeTenant.email,
          phone: activeTenant.phone,
          moveInDate: activeTenant.moveInDate,
          moveOutDate: activeTenant.moveOutDate,
        } : null,
        payments: allPayments.map(p => ({
          id: p.id,
          amount: p.amount,
          date: p.date,
          dueDate: p.dueDate,
          status: p.status,
          method: p.method,
          notes: p.notes,
        })),
        statistics: {
          totalPaid,
          pendingCount: pendingPayments.length,
          overdueCount: overduePayments.length,
        },
        generatedAt: new Date().toISOString(),
      })
    } catch (dbError) {
      console.error('Database error, falling back to mock data:', dbError)

      // Fallback to mock data
      const room = mockRooms.find(r => r.id === id)

      if (!room) {
        return NextResponse.json(
          { error: 'Room not found' },
          { status: 404 }
        )
      }

      const tenant = mockTenants.find(t => t.roomId === id && t.status === 'ACTIVE')
      const allPayments = tenant
        ? mockPayments.filter(p => p.tenantId === tenant.id)
        : []

      const totalPaid = allPayments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0)
      const pendingPayments = allPayments.filter(p => p.status === 'PENDING')
      const overduePayments = allPayments.filter(p => p.status === 'OVERDUE')

      return NextResponse.json({
        room: {
          id: room.id,
          name: room.name,
          description: room.description,
          address: room.address,
          rent: room.rent,
          deposit: room.deposit,
          size: room.size,
          bedrooms: room.bedrooms,
          bathrooms: room.bathrooms,
          status: room.status,
          amenities: room.amenities,
        },
        tenant: tenant ? {
          id: tenant.id,
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: tenant.email,
          phone: tenant.phone,
          moveInDate: tenant.moveInDate,
          moveOutDate: tenant.moveOutDate,
        } : null,
        payments: allPayments.map(p => ({
          id: p.id,
          amount: p.amount,
          date: p.date,
          dueDate: p.dueDate,
          status: p.status,
          method: p.method,
          notes: p.notes,
        })),
        statistics: {
          totalPaid,
          pendingCount: pendingPayments.length,
          overdueCount: overduePayments.length,
        },
        generatedAt: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('Error generating receipt:', error)
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    )
  }
}
