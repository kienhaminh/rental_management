import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const tenantId = searchParams.get('tenantId')

    const payments = await prisma.payment.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(tenantId ? { tenantId } : {})
      },
      include: {
        tenant: {
          include: {
            room: true
          }
        }
      },
      orderBy: {
        dueDate: 'desc'
      }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const payment = await prisma.payment.create({
      data: {
        tenantId: body.tenantId,
        amount: parseFloat(body.amount),
        dueDate: new Date(body.dueDate),
        date: body.date ? new Date(body.date) : new Date(),
        status: body.status || 'PENDING',
        method: body.method,
        notes: body.notes
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
