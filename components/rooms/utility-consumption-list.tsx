'use client';

import { Edit, Trash2, Zap, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
  createdAt: string;
  updatedAt: string;
}

interface UtilityConsumptionListProps {
  consumptions: UtilityConsumption[];
  onEdit: (consumption: UtilityConsumption) => void;
  onDelete: (id: string) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function UtilityConsumptionList({
  consumptions,
  onEdit,
  onDelete
}: UtilityConsumptionListProps) {
  if (consumptions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No utility consumption records yet.</p>
        <p className="text-sm mt-2">Click "Add Record" to start tracking monthly usage.</p>
      </div>
    );
  }

  const getMonthName = (month: number) => {
    return MONTHS[month - 1] || 'Unknown';
  };

  const calculateConsumption = (current: number, previous?: number) => {
    if (!previous) return null;
    return current - previous;
  };

  return (
    <div className="space-y-4">
      {consumptions.map((consumption) => {
        const electricConsumption = calculateConsumption(
          consumption.electricNumber,
          consumption.previousElectricNumber
        );
        const waterConsumption = calculateConsumption(
          consumption.waterNumber,
          consumption.previousWaterNumber
        );
        const totalCost = (consumption.electricCost || 0) + (consumption.waterCost || 0);

        return (
          <Card key={consumption.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold">
                    {getMonthName(consumption.month)} {consumption.year}
                  </h3>
                  {totalCost > 0 && (
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Total: ${totalCost.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Electric */}
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-700">Electric</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          Current: <span className="font-semibold">{consumption.electricNumber.toFixed(2)} kWh</span>
                        </p>
                        {consumption.previousElectricNumber !== undefined && consumption.previousElectricNumber !== null && (
                          <>
                            <p className="text-gray-600">
                              Previous: <span className="font-semibold">{consumption.previousElectricNumber.toFixed(2)} kWh</span>
                            </p>
                            {electricConsumption !== null && (
                              <p className="text-gray-700 font-medium">
                                Used: <span className="text-yellow-700">{electricConsumption.toFixed(2)} kWh</span>
                              </p>
                            )}
                          </>
                        )}
                        {consumption.electricCost && consumption.electricCost > 0 && (
                          <p className="text-gray-700 font-medium">
                            Cost: <span className="text-green-700">${consumption.electricCost.toFixed(2)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Water */}
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Droplet className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-700">Water</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          Current: <span className="font-semibold">{consumption.waterNumber.toFixed(2)} m³</span>
                        </p>
                        {consumption.previousWaterNumber !== undefined && consumption.previousWaterNumber !== null && (
                          <>
                            <p className="text-gray-600">
                              Previous: <span className="font-semibold">{consumption.previousWaterNumber.toFixed(2)} m³</span>
                            </p>
                            {waterConsumption !== null && (
                              <p className="text-gray-700 font-medium">
                                Used: <span className="text-blue-700">{waterConsumption.toFixed(2)} m³</span>
                              </p>
                            )}
                          </>
                        )}
                        {consumption.waterCost && consumption.waterCost > 0 && (
                          <p className="text-gray-700 font-medium">
                            Cost: <span className="text-green-700">${consumption.waterCost.toFixed(2)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {consumption.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {consumption.notes}
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-3">
                  Last updated: {new Date(consumption.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(consumption)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(consumption.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
