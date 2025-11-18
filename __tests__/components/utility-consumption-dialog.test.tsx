import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UtilityConsumptionDialog } from '@/components/rooms/utility-consumption-dialog';

// Mock fetch
global.fetch = jest.fn();

describe('UtilityConsumptionDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnSaved = jest.fn();
  const roomId = 'room-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <UtilityConsumptionDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        roomId={roomId}
        onSaved={mockOnSaved}
      />
    );

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('should render dialog when open is true', () => {
    render(
      <UtilityConsumptionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roomId={roomId}
        onSaved={mockOnSaved}
      />
    );

    expect(screen.getByText('Add Utility Consumption')).toBeInTheDocument();
    expect(screen.getByText(/Track the monthly electric and water meter readings/)).toBeInTheDocument();
  });

  it('should show edit title when consumption is provided', () => {
    const consumption = {
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
      createdAt: '',
      updatedAt: '',
    };

    render(
      <UtilityConsumptionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roomId={roomId}
        consumption={consumption}
        onSaved={mockOnSaved}
      />
    );

    expect(screen.getByText('Edit Utility Consumption')).toBeInTheDocument();
  });

  it('should populate form with consumption data when editing', () => {
    const consumption = {
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
      notes: 'Test note',
      createdAt: '',
      updatedAt: '',
    };

    render(
      <UtilityConsumptionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roomId={roomId}
        consumption={consumption}
        onSaved={mockOnSaved}
      />
    );

    const yearInput = screen.getByLabelText('Year') as HTMLInputElement;
    expect(yearInput.value).toBe('2024');

    const currentElectricInput = screen.getByLabelText(/Current Reading \(kWh\)/) as HTMLInputElement;
    expect(currentElectricInput.value).toBe('150');

    const currentWaterInput = screen.getByLabelText(/Current Reading \(m³\)/) as HTMLInputElement;
    expect(currentWaterInput.value).toBe('60');
  });

  it('should calculate electric consumption automatically', () => {
    render(
      <UtilityConsumptionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roomId={roomId}
        onSaved={mockOnSaved}
      />
    );

    const previousElectricInput = screen.getByLabelText(/Previous Reading \(kWh\)/) as HTMLInputElement;
    const currentElectricInput = screen.getByLabelText(/Current Reading \(kWh\)/) as HTMLInputElement;

    fireEvent.change(previousElectricInput, { target: { value: '100' } });
    fireEvent.change(currentElectricInput, { target: { value: '150' } });

    const consumptionTexts = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('Consumption:') && element?.textContent?.includes('50.00 kWh');
    });
    expect(consumptionTexts.length).toBeGreaterThan(0);
  });

  it('should calculate water consumption automatically', () => {
    render(
      <UtilityConsumptionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roomId={roomId}
        onSaved={mockOnSaved}
      />
    );

    const previousWaterInput = screen.getByLabelText(/Previous Reading \(m³\)/) as HTMLInputElement;
    const currentWaterInput = screen.getByLabelText(/Current Reading \(m³\)/) as HTMLInputElement;

    fireEvent.change(previousWaterInput, { target: { value: '50' } });
    fireEvent.change(currentWaterInput, { target: { value: '75' } });

    const consumptionTexts = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('Consumption:') && element?.textContent?.includes('25.00 m³');
    });
    expect(consumptionTexts.length).toBeGreaterThan(0);
  });

  it('should submit form and create new record', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-id' }),
    });

    render(
      <UtilityConsumptionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roomId={roomId}
        onSaved={mockOnSaved}
      />
    );

    const currentElectricInput = screen.getByLabelText(/Current Reading \(kWh\)/) as HTMLInputElement;
    const currentWaterInput = screen.getByLabelText(/Current Reading \(m³\)/) as HTMLInputElement;

    fireEvent.change(currentElectricInput, { target: { value: '150' } });
    fireEvent.change(currentWaterInput, { target: { value: '60' } });

    const submitButton = screen.getByText('Add Record');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/utility-consumption',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    await waitFor(() => {
      expect(mockOnSaved).toHaveBeenCalled();
    });
  });

  it('should submit form and update existing record', async () => {
    const consumption = {
      id: 'consumption-1',
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
      createdAt: '',
      updatedAt: '',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => consumption,
    });

    render(
      <UtilityConsumptionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roomId={roomId}
        consumption={consumption}
        onSaved={mockOnSaved}
      />
    );

    const submitButton = screen.getByText('Update');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/utility-consumption/consumption-1',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    await waitFor(() => {
      expect(mockOnSaved).toHaveBeenCalled();
    });
  });

  it('should display error message on failed submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to save' }),
    });

    render(
      <UtilityConsumptionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roomId={roomId}
        onSaved={mockOnSaved}
      />
    );

    const currentElectricInput = screen.getByLabelText(/Current Reading \(kWh\)/) as HTMLInputElement;
    const currentWaterInput = screen.getByLabelText(/Current Reading \(m³\)/) as HTMLInputElement;

    fireEvent.change(currentElectricInput, { target: { value: '150' } });
    fireEvent.change(currentWaterInput, { target: { value: '60' } });

    const submitButton = screen.getByText('Add Record');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save')).toBeInTheDocument();
    });

    expect(mockOnSaved).not.toHaveBeenCalled();
  });

  it('should call onOpenChange when cancel button is clicked', () => {
    render(
      <UtilityConsumptionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roomId={roomId}
        onSaved={mockOnSaved}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should disable buttons during submission', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
    );

    render(
      <UtilityConsumptionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roomId={roomId}
        onSaved={mockOnSaved}
      />
    );

    const currentElectricInput = screen.getByLabelText(/Current Reading \(kWh\)/) as HTMLInputElement;
    const currentWaterInput = screen.getByLabelText(/Current Reading \(m³\)/) as HTMLInputElement;

    fireEvent.change(currentElectricInput, { target: { value: '150' } });
    fireEvent.change(currentWaterInput, { target: { value: '60' } });

    const submitButton = screen.getByText('Add Record');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  it('should reset form when switching from edit to create mode', () => {
    const consumption = {
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
      createdAt: '',
      updatedAt: '',
    };

    const { rerender } = render(
      <UtilityConsumptionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roomId={roomId}
        consumption={consumption}
        onSaved={mockOnSaved}
      />
    );

    expect(screen.getByText('Edit Utility Consumption')).toBeInTheDocument();

    rerender(
      <UtilityConsumptionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        roomId={roomId}
        consumption={null}
        onSaved={mockOnSaved}
      />
    );

    expect(screen.getByText('Add Utility Consumption')).toBeInTheDocument();
  });
});
