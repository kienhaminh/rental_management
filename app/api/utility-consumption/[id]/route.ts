import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get specific utility consumption record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const consumption = await prisma.utilityConsumption.findUnique({
      where: { id },
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

    if (!consumption) {
      return NextResponse.json(
        { error: 'Utility consumption record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(consumption);
  } catch (error) {
    console.error('Error fetching utility consumption:', error);
    return NextResponse.json(
      { error: 'Failed to fetch utility consumption record' },
      { status: 500 }
    );
  }
}

// PUT - Update utility consumption record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      electricNumber,
      waterNumber,
      previousElectricNumber,
      previousWaterNumber,
      electricCost,
      waterCost,
      notes
    } = body;

    const consumption = await prisma.utilityConsumption.update({
      where: { id },
      data: {
        electricNumber,
        waterNumber,
        previousElectricNumber,
        previousWaterNumber,
        electricCost,
        waterCost,
        notes,
        updatedAt: new Date()
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

    return NextResponse.json(consumption);
  } catch (error: any) {
    console.error('Error updating utility consumption:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Utility consumption record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update utility consumption record' },
      { status: 500 }
    );
  }
}

// DELETE - Delete utility consumption record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.utilityConsumption.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Utility consumption record deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting utility consumption:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Utility consumption record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete utility consumption record' },
      { status: 500 }
    );
  }
}
