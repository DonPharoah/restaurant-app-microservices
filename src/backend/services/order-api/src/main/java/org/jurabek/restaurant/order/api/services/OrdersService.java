package org.jurabek.restaurant.order.api.services;

import java.util.List;

import org.jurabek.restaurant.order.api.dtos.OrderDto;

/**
 * OrdersService
 */
public interface OrdersService {
    List<OrderDto> getOrderByCustomerId(String customerId);

    OrderDto getOrderByTransactionId(String transactionId);

    List<OrderDto> getAll(Integer offset, Integer limit);

    Long getCount();

    OrderDto getById(String orderId);
    void Delete(String orderId);
}