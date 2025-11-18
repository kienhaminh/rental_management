import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock data for development when database is not available
const mockUtilityConsumptions: any[] = [];

// GET - List utility consumptions (optionally filtered by roomId)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get('roomId');

    const where = roomId ? { roomId } : {};

    const consumptions = await prisma.utilityConsumption.findMany({
      where,
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ],
      include: {
        room: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    });

    return NextResponse.json(consumptions);
  } catch (error) {
    console.error('Error fetching utility consumptions:', error);

    // Return mock data on error
    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get('roomId');
    const filtered = roomId
      ? mockUtilityConsumptions.filter(c => c.roomId === roomId)
      : mockUtilityConsumptions;

    return NextResponse.json(filtered);
  }
}

// POST - Create new utility consumption record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      roomId,
      month,
      year,
      electricNumber,
      waterNumber,
      previousElectricNumber,
      previousWaterNumber,
      electricCost,
      waterCost,
      notes
    } = body;

    // Validate required fields
    if (!roomId || !month || !year || electricNumber === undefined || waterNumber === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: roomId, month, year, electricNumber, waterNumber' },
        { status: 400 }
      );
    }

    // Validate month
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    const consumption = await prisma.utilityConsumption.create({
      data: {
        roomId,
        month,
        year,
        electricNumber,
        waterNumber,
        previousElectricNumber,
        previousWaterNumber,
        electricCost,
        waterCost,
        notes
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    });

    return NextResponse.json(consumption, { status: 201 });
  } catch (error: any) {
    console.error('Error creating utility consumption:', error);

    // Handle unique constraint violation (duplicate month/year for room)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A record for this room, month, and year already exists' },
        { status: 409 }
      );
    }

    // Fallback: create mock data
    const body = await request.json();
    const mockConsumption = {
      id: `mock-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      room: {
        id: body.roomId,
        name: 'Mock Room',
        address: 'Mock Address'
      }
    };
    mockUtilityConsumptions.push(mockConsumption);

    return NextResponse.json(mockConsumption, { status: 201 });
  }
}
