import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoomDetailPage from '@/app/rooms/[id]/page';

// Mock fetch
global.fetch = jest.fn();

// Mock useParams to return test room id
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  useParams() {
    return {
      id: 'test-room-id',
    };
  },
}));

describe('RoomDetailPage', () => {
  const mockRoom = {
    id: 'test-room-id',
    name: 'Room A',
    address: '123 Main St',
    rent: 1000,
    deposit: 500,
    size: 500,
    bedrooms: 2,
    bathrooms: 1,
    status: 'AVAILABLE',
    amenities: ['WiFi', 'Parking', 'AC'],
    description: 'Nice room',
    tenants: [],
  };

  const mockConsumptions = [
    {
      id: '1',
      roomId: 'test-room-id',
      month: 2,
      year: 2024,
      electricNumber: 200,
      waterNumber: 70,
      previousElectricNumber: 150,
      previousWaterNumber: 60,
      electricCost: 30,
      waterCost: 20,
      notes: 'High usage',
      createdAt: new Date('2024-02-15').toISOString(),
      updatedAt: new Date('2024-02-15').toISOString(),
    },
    {
      id: '2',
      roomId: 'test-room-id',
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

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<RoomDetailPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render room information after loading', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoom,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsumptions,
      });

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Room A')).toBeInTheDocument();
    });

    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // bedrooms
    expect(screen.getByText('1')).toBeInTheDocument(); // bathrooms
    expect(screen.getByText('500 sqft')).toBeInTheDocument();
  });

  it('should render amenities', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoom,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsumptions,
      });

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('WiFi')).toBeInTheDocument();
    });

    expect(screen.getByText('Parking')).toBeInTheDocument();
    expect(screen.getByText('AC')).toBeInTheDocument();
  });

  it('should render description when available', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoom,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsumptions,
      });

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Nice room')).toBeInTheDocument();
    });
  });

  it('should render utility consumption records', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoom,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsumptions,
      });

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('February 2024')).toBeInTheDocument();
    });

    expect(screen.getByText('January 2024')).toBeInTheDocument();
    expect(screen.getByText('Monthly Utility Consumption')).toBeInTheDocument();
  });

  it('should show "Room not found" when room does not exist', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Room not found')).toBeInTheDocument();
    });

    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });

  it('should have "Add Record" button', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoom,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsumptions,
      });

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Add Record')).toBeInTheDocument();
    });
  });

  it('should have "Back to Home" button', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoom,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsumptions,
      });

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Back to Home')).toBeInTheDocument();
    });
  });

  it('should open dialog when "Add Record" is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoom,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsumptions,
      });

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Add Record')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Record');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add Utility Consumption')).toBeInTheDocument();
    });
  });

  it('should fetch data on mount', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoom,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsumptions,
      });

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/rooms/test-room-id');
      expect(global.fetch).toHaveBeenCalledWith('/api/utility-consumption?roomId=test-room-id');
    });
  });

  it('should handle fetch errors gracefully', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('should display status badge with correct styling', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoom,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsumptions,
      });

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('AVAILABLE')).toBeInTheDocument();
    });

    const statusBadge = screen.getByText('AVAILABLE');
    expect(statusBadge).toHaveClass('bg-green-500');
  });

  it('should refetch consumptions after saving a new record', async () => {
    const newConsumption = {
      id: 'new-consumption',
      roomId: 'test-room-id',
      month: 3,
      year: 2024,
      electricNumber: 250,
      waterNumber: 80,
      previousElectricNumber: 200,
      previousWaterNumber: 70,
      electricCost: 35,
      waterCost: 25,
      notes: '',
      createdAt: new Date('2024-03-15').toISOString(),
      updatedAt: new Date('2024-03-15').toISOString(),
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoom,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockConsumptions,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => newConsumption,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [newConsumption, ...mockConsumptions],
      });

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Add Record')).toBeInTheDocument();
    });

    // Initial fetch calls
    expect(global.fetch).toHaveBeenCalledTimes(2);

    const addButtons = screen.getAllByText('Add Record');
    const pageAddButton = addButtons[0]; // First one is on the page
    fireEvent.click(pageAddButton);

    await waitFor(() => {
      expect(screen.getByText('Add Utility Consumption')).toBeInTheDocument();
    });

    // Fill in form
    const currentElectricInput = screen.getByLabelText(/Current Reading \(kWh\)/) as HTMLInputElement;
    const currentWaterInput = screen.getByLabelText(/Current Reading \(m³\)/) as HTMLInputElement;

    fireEvent.change(currentElectricInput, { target: { value: '250' } });
    fireEvent.change(currentWaterInput, { target: { value: '80' } });

    const allAddRecordButtons = screen.getAllByText('Add Record');
    const saveButton = allAddRecordButtons[allAddRecordButtons.length - 1]; // Last one is the submit button
    fireEvent.click(saveButton);

    // Should refetch consumptions after save
    // Calls: 1-room, 2-consumptions, 3-previous-month, 4-save, 5-consumptions-refetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(5);
    });
  });
});
