'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UtilityConsumption {
  id: string;
  roomId: string;
  month: number;
  year: number;
  electricNumber: number;
  waterNumber: number;
  previousElectricNumber?: number;
  previousWaterNumber?: number;
  electricCost?: number;
  waterCost?: number;
  notes?: string;
}

interface UtilityConsumptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  consumption?: UtilityConsumption | null;
  onSaved: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function UtilityConsumptionDialog({
  open,
  onOpenChange,
  roomId,
  consumption,
  onSaved
}: UtilityConsumptionDialogProps) {
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    electricNumber: 0,
    waterNumber: 0,
    previousElectricNumber: 0,
    previousWaterNumber: 0,
    electricCost: 0,
    waterCost: 0,
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchingPrevious, setFetchingPrevious] = useState(false);
  const [error, setError] = useState('');

  // Fetch previous month's consumption data
  const fetchPreviousConsumption = async (month: number, year: number) => {
    setFetchingPrevious(true);
    try {
      // Calculate previous month
      let prevMonth = month - 1;
      let prevYear = year;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = year - 1;
      }

      const response = await fetch(`/api/utility-consumption?roomId=${roomId}`);
      if (response.ok) {
        const consumptions: UtilityConsumption[] = await response.json();

        // Find consumption for the previous month/year
        const previousRecord = consumptions.find(
          c => c.month === prevMonth && c.year === prevYear
        );

        if (previousRecord) {
          setFormData(prev => ({
            ...prev,
            previousElectricNumber: previousRecord.electricNumber,
            previousWaterNumber: previousRecord.waterNumber
          }));
        } else {
          // No previous record found, set to 0
          setFormData(prev => ({
            ...prev,
            previousElectricNumber: 0,
            previousWaterNumber: 0
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching previous consumption:', error);
      // Keep current values on error
    } finally {
      setFetchingPrevious(false);
    }
  };

  useEffect(() => {
    if (consumption) {
      // Editing existing record - use stored values
      setFormData({
        month: consumption.month,
        year: consumption.year,
        electricNumber: consumption.electricNumber,
        waterNumber: consumption.waterNumber,
        previousElectricNumber: consumption.previousElectricNumber || 0,
        previousWaterNumber: consumption.previousWaterNumber || 0,
        electricCost: consumption.electricCost || 0,
        waterCost: consumption.waterCost || 0,
        notes: consumption.notes || ''
      });
    } else {
      // Reset form for new entry
      const currentDate = new Date();
      const newMonth = currentDate.getMonth() + 1;
      const newYear = currentDate.getFullYear();

      setFormData({
        month: newMonth,
        year: newYear,
        electricNumber: 0,
        waterNumber: 0,
        previousElectricNumber: 0,
        previousWaterNumber: 0,
        electricCost: 0,
        waterCost: 0,
        notes: ''
      });

      // Fetch previous month's data for new records
      if (open) {
        fetchPreviousConsumption(newMonth, newYear);
      }
    }
    setError('');
  }, [consumption, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = consumption
        ? `/api/utility-consumption/${consumption.id}`
        : '/api/utility-consumption';

      const method = consumption ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          ...formData,
          // Convert empty strings to null
          previousElectricNumber: formData.previousElectricNumber || null,
          previousWaterNumber: formData.previousWaterNumber || null,
          electricCost: formData.electricCost || null,
          waterCost: formData.waterCost || null,
          notes: formData.notes || null
        })
      });

      if (response.ok) {
        onSaved();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save record');
      }
    } catch (err) {
      console.error('Error saving consumption:', err);
      setError('Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };

      // Fetch previous consumption when month or year changes (only for new records)
      if (!consumption && (field === 'month' || field === 'year')) {
        const month = field === 'month' ? value : prev.month;
        const year = field === 'year' ? value : prev.year;
        fetchPreviousConsumption(month, year);
      }

      return updated;
    });
  };

  const electricConsumption = formData.electricNumber - (formData.previousElectricNumber || 0);
  const waterConsumption = formData.waterNumber - (formData.previousWaterNumber || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {consumption ? 'Edit Utility Consumption' : 'Add Utility Consumption'}
          </DialogTitle>
          <DialogDescription>
            Enter the current meter readings - previous month's readings are loaded automatically
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Period */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <select
                id="month"
                value={formData.month}
                onChange={(e) => handleChange('month', parseInt(e.target.value))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
                disabled={!!consumption} // Disable month change when editing
              >
                {MONTHS.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleChange('year', parseInt(e.target.value))}
                min="2000"
                max="2100"
                required
                disabled={!!consumption} // Disable year change when editing
              />
            </div>
          </div>

          {/* Electric Numbers */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold">Electric Meter</h4>

            {/* Previous Reading (Read-only display) */}
            {formData.previousElectricNumber > 0 && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  Previous Month's Reading: <span className="font-semibold">{formData.previousElectricNumber.toFixed(2)} kWh</span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentElectric">Current Reading (kWh) *</Label>
              <Input
                id="currentElectric"
                type="number"
                step="0.01"
                value={formData.electricNumber}
                onChange={(e) => handleChange('electricNumber', parseFloat(e.target.value) || 0)}
                required
                disabled={fetchingPrevious}
              />
            </div>

            {formData.previousElectricNumber > 0 && formData.electricNumber > 0 && (
              <p className="text-sm text-blue-600 font-medium">
                Consumption: <span className="font-semibold">{electricConsumption.toFixed(2)} kWh</span>
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="electricCost">Electric Cost ($)</Label>
              <Input
                id="electricCost"
                type="number"
                step="0.01"
                value={formData.electricCost}
                onChange={(e) => handleChange('electricCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Water Numbers */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-semibold">Water Meter</h4>

            {/* Previous Reading (Read-only display) */}
            {formData.previousWaterNumber > 0 && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  Previous Month's Reading: <span className="font-semibold">{formData.previousWaterNumber.toFixed(2)} m³</span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentWater">Current Reading (m³) *</Label>
              <Input
                id="currentWater"
                type="number"
                step="0.01"
                value={formData.waterNumber}
                onChange={(e) => handleChange('waterNumber', parseFloat(e.target.value) || 0)}
                required
                disabled={fetchingPrevious}
              />
            </div>

            {formData.previousWaterNumber > 0 && formData.waterNumber > 0 && (
              <p className="text-sm text-blue-600 font-medium">
                Consumption: <span className="font-semibold">{waterConsumption.toFixed(2)} m³</span>
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="waterCost">Water Cost ($)</Label>
              <Input
                id="waterCost"
                type="number"
                step="0.01"
                value={formData.waterCost}
                onChange={(e) => handleChange('waterCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background"
              placeholder="Add any additional notes..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {fetchingPrevious && (
            <p className="text-sm text-gray-500">Loading previous month's readings...</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || fetchingPrevious}>
              {loading ? 'Saving...' : consumption ? 'Update' : 'Add Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
