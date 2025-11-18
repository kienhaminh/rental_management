"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, Loader2 } from "lucide-react"
import { useReactToPrint } from "react-to-print"

interface ReceiptDialogProps {
  roomId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ReceiptData {
  room: {
    id: string
    name: string
    description: string | null
    address: string
    rent: number
    deposit: number | null
    size: number | null
    bedrooms: number
    bathrooms: number
    status: string
    amenities: string[]
  }
  tenant: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    moveInDate: string
    moveOutDate: string | null
  } | null
  payments: Array<{
    id: string
    amount: number
    date: string
    dueDate: string
    status: string
    method: string | null
    notes: string | null
  }>
  statistics: {
    totalPaid: number
    pendingCount: number
    overdueCount: number
  }
  generatedAt: string
}

const statusColors: Record<string, string> = {
  PAID: "bg-green-500",
  PENDING: "bg-yellow-500",
  OVERDUE: "bg-red-500",
  CANCELLED: "bg-gray-500",
}

export function ReceiptDialog({ roomId, open, onOpenChange }: ReceiptDialogProps) {
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [loading, setLoading] = useState(false)
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Receipt-${receiptData?.room.name || 'Room'}-${new Date().toISOString().split('T')[0]}`,
  })

  useEffect(() => {
    if (open && roomId) {
      fetchReceiptData()
    }
  }, [open, roomId])

  const fetchReceiptData = async () => {
    if (!roomId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/rooms/${roomId}/receipt`)
      if (!response.ok) throw new Error('Failed to fetch receipt data')
      const data = await response.json()
      setReceiptData(data)
    } catch (error) {
      console.error('Error fetching receipt data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Room Receipt</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : receiptData ? (
          <>
            <div className="flex gap-2 mb-4 print:hidden">
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
            </div>

            <div ref={componentRef} className="p-8 bg-white text-black">
              {/* Header */}
              <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
                <h1 className="text-3xl font-bold mb-2">Rental Receipt</h1>
                <p className="text-gray-600">Generated on {formatDate(receiptData.generatedAt)}</p>
              </div>

              {/* Room Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Property Information</h2>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div>
                    <p className="text-sm text-gray-600">Property Name</p>
                    <p className="font-semibold">{receiptData.room.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold">{receiptData.room.status}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold">{receiptData.room.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="font-semibold">{receiptData.room.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                    <p className="font-semibold">{receiptData.room.bathrooms}</p>
                  </div>
                  {receiptData.room.size && (
                    <div>
                      <p className="text-sm text-gray-600">Size</p>
                      <p className="font-semibold">{receiptData.room.size} sq ft</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Monthly Rent</p>
                    <p className="font-semibold text-lg">{formatCurrency(receiptData.room.rent)}</p>
                  </div>
                  {receiptData.room.deposit && (
                    <div>
                      <p className="text-sm text-gray-600">Security Deposit</p>
                      <p className="font-semibold">{formatCurrency(receiptData.room.deposit)}</p>
                    </div>
                  )}
                </div>

                {receiptData.room.amenities.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {receiptData.room.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tenant Information */}
              {receiptData.tenant && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Tenant Information</h2>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">
                        {receiptData.tenant.firstName} {receiptData.tenant.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{receiptData.tenant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold">{receiptData.tenant.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Move-in Date</p>
                      <p className="font-semibold">{formatDate(receiptData.tenant.moveInDate)}</p>
                    </div>
                    {receiptData.tenant.moveOutDate && (
                      <div>
                        <p className="text-sm text-gray-600">Move-out Date</p>
                        <p className="font-semibold">{formatDate(receiptData.tenant.moveOutDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment History */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Payment History</h2>
                {receiptData.payments.length > 0 ? (
                  <>
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2 text-left">Date</th>
                          <th className="border border-gray-300 p-2 text-left">Due Date</th>
                          <th className="border border-gray-300 p-2 text-left">Amount</th>
                          <th className="border border-gray-300 p-2 text-left">Method</th>
                          <th className="border border-gray-300 p-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receiptData.payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="border border-gray-300 p-2">
                              {formatDate(payment.date)}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {formatDate(payment.dueDate)}
                            </td>
                            <td className="border border-gray-300 p-2 font-semibold">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {payment.method || 'N/A'}
                            </td>
                            <td className="border border-gray-300 p-2">
                              <span
                                className={`px-2 py-1 rounded text-white text-sm ${
                                  statusColors[payment.status] || 'bg-gray-500'
                                }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Payment Statistics */}
                    <div className="mt-6 bg-gray-50 p-4 rounded">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Paid</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(receiptData.statistics.totalPaid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pending Payments</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {receiptData.statistics.pendingCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Overdue Payments</p>
                          <p className="text-2xl font-bold text-red-600">
                            {receiptData.statistics.overdueCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">No payment records available.</p>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-600 border-t-2 border-gray-300 pt-4">
                <p>This is an automatically generated receipt.</p>
                <p className="mt-1">For any questions, please contact the property management.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-600">
            Failed to load receipt data.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
