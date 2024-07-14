import { fetchOrders } from "@/lib/fetch";
import { OrdersTable } from "./orders-table";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { q: string; offset: string };
}) {
  const search = searchParams.q ?? "";
  const offset = searchParams.offset ?? 0;
  const productsPerPage = 10;

  const {
    orders,
    total,
    offset: currOffset,
  } = await fetchOrders(Number(offset), productsPerPage);

  const newOffset = currOffset + productsPerPage;

  return (
    <div>
      <OrdersTable
        orders={orders}
        offset={newOffset}
        totalProducts={total}
        productsPerPage={productsPerPage}
      />
    </div>
  );
}
