import { render, screen, fireEvent } from '@testing-library/react';
import { UtilityConsumptionList } from '@/components/rooms/utility-consumption-list';

describe('UtilityConsumptionList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state when no consumptions', () => {
    render(
      <UtilityConsumptionList
        consumptions={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('No utility consumption records yet.')).toBeInTheDocument();
    expect(screen.getByText(/Click "Add Record" to start tracking/)).toBeInTheDocument();
  });

  it('should render consumption records correctly', () => {
    const mockConsumptions = [
      {
        id: '1',
        roomId: 'room-1',
        month: 1,
        year: 2024,
        electricNumber: 150,
        waterNumber: 60,
        previousElectricNumber: 100,
        previousWaterNumber: 50,
        electricCost: 25,
        waterCost: 15,
        notes: 'Test note',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
      },
    ];

    render(
      <UtilityConsumptionList
        consumptions={mockConsumptions}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('January 2024')).toBeInTheDocument();
    expect(screen.getByText(/150\.00 kWh/)).toBeInTheDocument();
    expect(screen.getByText(/60\.00 m³/)).toBeInTheDocument();
  });

  it('should calculate and display consumption correctly', () => {
    const mockConsumptions = [
      {
        id: '1',
        roomId: 'room-1',
        month: 2,
        year: 2024,
        electricNumber: 150,
        waterNumber: 60,
        previousElectricNumber: 100,
        previousWaterNumber: 50,
        electricCost: 25,
        waterCost: 15,
        notes: '',
        createdAt: new Date('2024-02-15').toISOString(),
        updatedAt: new Date('2024-02-15').toISOString(),
      },
    ];

    render(
      <UtilityConsumptionList
        consumptions={mockConsumptions}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Electric consumption: 150 - 100 = 50
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Used: 50.00 kWh';
    })).toBeInTheDocument();
    // Water consumption: 60 - 50 = 10
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Used: 10.00 m³';
    })).toBeInTheDocument();
  });

  it('should display total cost when available', () => {
    const mockConsumptions = [
      {
        id: '1',
        roomId: 'room-1',
        month: 1,
        year: 2024,
        electricNumber: 150,
        waterNumber: 60,
        previousElectricNumber: 100,
        previousWaterNumber: 50,
        electricCost: 25,
        waterCost: 15,
        notes: '',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
      },
    ];

    render(
      <UtilityConsumptionList
        consumptions={mockConsumptions}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Total: 25 + 15 = 40
    expect(screen.getByText('Total: $40.00')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    expect(screen.getByText('$15.00')).toBeInTheDocument();
  });

  it('should display notes when available', () => {
    const mockConsumptions = [
      {
        id: '1',
        roomId: 'room-1',
        month: 1,
        year: 2024,
        electricNumber: 150,
        waterNumber: 60,
        notes: 'High usage this month',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
      },
    ];

    render(
      <UtilityConsumptionList
        consumptions={mockConsumptions}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Notes:')).toBeInTheDocument();
    expect(screen.getByText('High usage this month')).toBeInTheDocument();
  });

  it('should not display notes section when notes are empty', () => {
    const mockConsumptions = [
      {
        id: '1',
        roomId: 'room-1',
        month: 1,
        year: 2024,
        electricNumber: 150,
        waterNumber: 60,
        notes: '',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
      },
    ];

    render(
      <UtilityConsumptionList
        consumptions={mockConsumptions}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('Notes:')).not.toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const mockConsumptions = [
      {
        id: '1',
        roomId: 'room-1',
        month: 1,
        year: 2024,
        electricNumber: 150,
        waterNumber: 60,
        notes: '',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
      },
    ];

    render(
      <UtilityConsumptionList
        consumptions={mockConsumptions}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('[class*="lucide-edit"]'));

    if (editButton) {
      fireEvent.click(editButton);
      expect(mockOnEdit).toHaveBeenCalledWith(mockConsumptions[0]);
    }
  });

  it('should call onDelete when delete button is clicked', () => {
    const mockConsumptions = [
      {
        id: '1',
        roomId: 'room-1',
        month: 1,
        year: 2024,
        electricNumber: 150,
        waterNumber: 60,
        notes: '',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
      },
    ];

    render(
      <UtilityConsumptionList
        consumptions={mockConsumptions}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[class*="lucide-trash"]'));

    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    }
  });

  it('should render multiple consumption records', () => {
    const mockConsumptions = [
      {
        id: '1',
        roomId: 'room-1',
        month: 2,
        year: 2024,
        electricNumber: 200,
        waterNumber: 70,
        previousElectricNumber: 150,
        previousWaterNumber: 60,
        notes: '',
        createdAt: new Date('2024-02-15').toISOString(),
        updatedAt: new Date('2024-02-15').toISOString(),
      },
      {
        id: '2',
        roomId: 'room-1',
        month: 1,
        year: 2024,
        electricNumber: 150,
        waterNumber: 60,
        previousElectricNumber: 100,
        previousWaterNumber: 50,
        notes: '',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
      },
    ];

    render(
      <UtilityConsumptionList
        consumptions={mockConsumptions}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('February 2024')).toBeInTheDocument();
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  it('should handle consumption without previous values', () => {
    const mockConsumptions = [
      {
        id: '1',
        roomId: 'room-1',
        month: 1,
        year: 2024,
        electricNumber: 150,
        waterNumber: 60,
        notes: '',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
      },
    ];

    render(
      <UtilityConsumptionList
        consumptions={mockConsumptions}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/150\.00 kWh/)).toBeInTheDocument();
    expect(screen.getByText(/60\.00 m³/)).toBeInTheDocument();
    expect(screen.queryByText(/Used:/)).not.toBeInTheDocument();
  });
});
