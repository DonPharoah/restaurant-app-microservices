package org.jurabek.restaurant.order.api.events;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import io.smallrye.common.annotation.Blocking;

import java.util.concurrent.CompletionStage;

import org.eclipse.microprofile.faulttolerance.Retry;
import org.eclipse.microprofile.reactive.messaging.Acknowledgment;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Message;
import org.jboss.logging.Logger;
import org.jurabek.restaurant.order.api.services.CheckoutService;

@ApplicationScoped
public class UserCheckoutEventHandler {

    private static final Logger log = Logger.getLogger(UserCheckoutEventHandler.class);

    private final CheckoutService checkout;

    @Inject
    public UserCheckoutEventHandler(CheckoutService checkout) {
        this.checkout = checkout;
    }

    @Incoming("checkout")
    @Acknowledgment(Acknowledgment.Strategy.MANUAL)
    @Retry(delay = 10, maxRetries = 5)
    @Blocking
    public CompletionStage<Void> Handle(Message<UserCheckoutEvent> message) {
        try {
            log.info("received user checkout event: " + message);
            checkout.Checkout(message.getPayload());
            return message.ack();
        } catch (Exception e) {
            log.error("Error processing user checkout event: " + message, e);
            return message.nack(e);
        }
    }
}
