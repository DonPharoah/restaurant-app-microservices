import * as z from "zod";

export const OrderItemSchema = z.object({
    "id": z.string(),
    "unitPrice": z.number(),
    "units": z.number(),
    "productId": z.number(),
    "productName": z.null(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
    "id": z.string(),
    "orderedDate": z.coerce.date(),
    "cartId": z.string(),
    "transactionId": z.string(),
    "checkoutId": z.string(),
    "orderItems": z.array(OrderItemSchema),
});
export type Order = z.infer<typeof OrderSchema>;

export const OrdersSchema = z.object({
    "orders": z.array(OrderSchema),
    "total": z.number(),
    "offset": z.number(),
    "limit": z.number(),
});
export type Orders = z.infer<typeof OrdersSchema>;

export function calculateTotalPrice(order: Order): number {
    return order.orderItems.reduce((total, item) => total + item.unitPrice, 0);
}