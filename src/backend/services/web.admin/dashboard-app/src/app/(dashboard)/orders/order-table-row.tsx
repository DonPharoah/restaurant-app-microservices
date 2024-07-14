import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { calculateTotalPrice, Order } from "@/lib/types/order";
import { MoreHorizontal } from "lucide-react";

export function OrderRow({ order }: { order: Order }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{order.orderedDate.toString()}</TableCell>
      <TableCell className="font-medium">{calculateTotalPrice(order)}</TableCell>
      <TableCell className="font-medium">{order.cartId}</TableCell>
      <TableCell className="font-medium">{order.checkoutId}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>
              <form action={() => {}}>
                <button type="submit">Delete</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
