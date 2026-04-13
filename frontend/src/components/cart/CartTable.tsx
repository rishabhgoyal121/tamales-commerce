import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/currency'
import type { CartItem } from '@/lib/auth-api'
import { QuantityEditor } from '@/components/cart/QuantityEditor'

type CartTableProps = {
  items: CartItem[]
  loading: boolean
  updating: boolean
  removing: boolean
  onCommitQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
}

export function CartTable({
  items,
  loading,
  updating,
  removing,
  onCommitQuantity,
  onRemoveItem,
}: CartTableProps) {
  const columnHelper = createColumnHelper<CartItem>()

  const columns = useMemo(
    () => [
      columnHelper.accessor((item) => item.product.title, {
        id: 'title',
        header: 'Product',
      }),
      columnHelper.display({
        id: 'quantity',
        header: 'Quantity',
        cell: (info) => (
          <QuantityEditor
            initialQuantity={info.row.original.quantity}
            onCommit={(quantity) => onCommitQuantity(info.row.original.id, quantity)}
            disabled={updating}
          />
        ),
      }),
      columnHelper.display({
        id: 'price',
        header: 'Unit Price',
        cell: (info) => formatCurrency(info.row.original.product.priceCents),
      }),
      columnHelper.display({
        id: 'lineTotal',
        header: 'Line Total',
        cell: (info) =>
          formatCurrency(info.row.original.product.priceCents * info.row.original.quantity),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemoveItem(info.row.original.id)}
            disabled={removing}
          >
            Remove
          </Button>
        ),
      }),
    ],
    [columnHelper, onCommitQuantity, onRemoveItem, removing, updating],
  )

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto rounded border border-slate-200">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border-b px-3 py-2 text-left font-medium">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="px-3 py-4 text-slate-500" colSpan={5}>
                Loading cart...
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td className="px-3 py-4 text-slate-500" colSpan={5}>
                Cart is empty.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b last:border-b-0">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
