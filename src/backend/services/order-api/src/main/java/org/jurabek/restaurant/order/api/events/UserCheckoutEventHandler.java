package org.jurabek.restaurant.order.api.events;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import org.eclipse.microprofile.faulttolerance.Retry;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;
import org.jboss.logging.Logger;
import org.jurabek.restaurant.order.api.services.CheckoutService;

@ApplicationScoped
public class UserCheckoutEventHandler {

    private static final Logger log = Logger.getLogger(UserCheckoutEventHandler.class);

    private final CheckoutService checkoutService;

    @Inject
    public UserCheckoutEventHandler(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @Incoming("checkout")
    @Outgoing("order-completed")
    @Retry(maxRetries = 5)
    @Transactional
    public OrderCompleted Handle(UserCheckoutEvent message) {
        log.info("received user checkout event: " + message);
        var order = checkoutService.CreateOrderFromCheckout(message);

        var orderCompleted = new OrderCompleted(order.getId(), order.getCartId(), order.getBuyerId(),
                order.getTransactionId(),
                order.getOrderedDate());

        log.info("order completed: " + orderCompleted);
        return orderCompleted;
    }
}
