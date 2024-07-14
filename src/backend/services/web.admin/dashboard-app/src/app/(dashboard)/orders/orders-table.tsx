"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order } from "@/lib/types/order";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { OrderRow } from "./order-table-row";

export function OrdersTable({
  orders,
  offset,
  totalProducts,
  productsPerPage,
}: {
  orders: Order[];
  offset: number;
  totalProducts: number;
  productsPerPage: number;
}) {
  let router = useRouter();
  function prevPage() {
    router.back();
  }

  function nextPage() {
    router.push(`/orders?offset=${offset}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>View all orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Date</TableHead>
              <TableHead className="hidden md:table-cell">
                Total Price
              </TableHead>
              <TableHead className="hidden md:table-cell">Cart ID</TableHead>
              <TableHead className="hidden md:table-cell">
                Checkout ID
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{" "}
            <strong>
              {Math.min(offset - productsPerPage, totalProducts) + 1}-{offset}
            </strong>{" "}
            of <strong>{totalProducts}</strong> products
          </div>
          <div className="flex">
            <Button
              formAction={prevPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset === productsPerPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              formAction={nextPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset + productsPerPage > totalProducts}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
