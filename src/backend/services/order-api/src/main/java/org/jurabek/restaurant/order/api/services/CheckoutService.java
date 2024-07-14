package org.jurabek.restaurant.order.api.services;

import java.util.UUID;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import org.jurabek.restaurant.order.api.events.UserCheckoutEvent;
import org.jurabek.restaurant.order.api.mappers.OrdersMapper;
import org.jurabek.restaurant.order.api.models.Order;
import org.jurabek.restaurant.order.api.repositories.OrdersRepository;

@ApplicationScoped
public class CheckoutService {

    private final OrdersRepository ordersRepository;
    private final OrdersMapper mapper;

    @Inject
    public CheckoutService(OrdersRepository ordersRepository, OrdersMapper mapper) {
        this.ordersRepository = ordersRepository;
        this.mapper = mapper;
    }

    public Order CreateOrderFromCheckout(UserCheckoutEvent checkoutInfo) {
        var order = mapper.mapDtoToOrder(checkoutInfo.getCustomerBasket());
        order.setTransactionId(checkoutInfo.getTransactionId());
        order.setBuyerId(UUID.fromString(checkoutInfo.getCheckOutInfo().getUserId()));
        order.setCheckoutId(checkoutInfo.getCheckoutId());

        for (var orderItems : order.getOrderItems()) {
            orderItems.setOrder(order);
        }
        ordersRepository.persist(order);
        return order;
    }
}
