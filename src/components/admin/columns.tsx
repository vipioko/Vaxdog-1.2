
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AdminTransaction } from "@/hooks/useAllTransactions"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const columns = (onViewDetails: (tx: AdminTransaction) => void): ColumnDef<AdminTransaction>[] => [
  {
    id: "customerName",
    accessorFn: row => row.customer?.name,
    header: "Customer",
    cell: ({ row }) => {
        const name = row.original.customer?.name
        return name ? <div className="font-medium">{name}</div> : <span className="text-muted-foreground">N/A</span>
    }
  },
  {
    accessorKey: "service",
    header: "Service",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string
        const variant = status === 'successful' ? 'default' : 'destructive'
        const text = status === 'successful' ? 'Paid' : 'Failed'
        const bgColor = status === 'successful' ? 'bg-green-600 hover:bg-green-600/90' : ''
        return <Badge variant={variant} className={bgColor}>{text}</Badge>
    }
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "createdAt",
    header: "Booking Date",
    cell: ({ row }) => {
        const date = row.original.createdAt?.toDate()
        return date ? format(date, "PP") : "N/A"
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const transaction = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetails(transaction)}>
              View details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
