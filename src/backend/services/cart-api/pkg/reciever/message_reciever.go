package reciever

import (
	"context"

	"github.com/IBM/sarama"
	"github.com/dnwe/otelsarama"
	"github.com/rs/zerolog/log"
)

type MessageReciever struct {
	consumer sarama.ConsumerGroup
	topic    string
}

func NewMessageReciever(consumer sarama.ConsumerGroup, topic string) *MessageReciever {
	return &MessageReciever{
		consumer: consumer,
		topic:    topic,
	}
}

type Message struct {
	Value      []byte
	Attributes map[string]string
}

type MessageHandler interface {
	Handle(ctx context.Context, message *Message) error
}

// Recieve starts consuming messages from all partitions and sends message as channel
func (k *MessageReciever) Recieve(ctx context.Context, handler MessageHandler) error {
	for {
		// `Consume` should be called inside an infinite loop, when a
		// server-side rebalance happens, the consumer session will need to be
		// recreated to get the new claims
		consumerGroupHandler := otelsarama.WrapConsumerGroupHandler(&consumerGroupHandler{handler: handler})
		err := k.consumer.Consume(ctx, []string{k.topic}, consumerGroupHandler)
		if err != nil {
			return err
		}

		// check if context was cancelled, signaling that the consumer should stop
		if ctx.Err() != nil {
			return err
		}
	}
}

type consumerGroupHandler struct {
	handler MessageHandler
}

func (c *consumerGroupHandler) Setup(session sarama.ConsumerGroupSession) error {
	return nil
}

func (c *consumerGroupHandler) Cleanup(session sarama.ConsumerGroupSession) error {
	return nil
}

func (c *consumerGroupHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	// NOTE:
	// Do not move the code below to a goroutine.
	// The `ConsumeClaim` itself is called within a goroutine, see:
	// https://github.com/IBM/sarama/blob/main/consumer_group.go#L27-L29
	for {
		select {
		case message, ok := <-claim.Messages():
			if !ok {
				log.Info().Msg("message channel was closed")
				return nil
			}
			log.Debug().
				Str("topic", message.Topic).
				Time("timestamp", message.Timestamp).
				Str("value", string(message.Value)).
				Msg("message claimed")

			if err := c.handler.Handle(context.Background(), &Message{Value: message.Value}); err != nil {
				log.Error().Err(err).Str("topic", message.Topic).Msg("failed to consume message")
			}
			session.MarkMessage(message, "")

		// Should return when `session.Context()` is done.
		// If not, will raise `ErrRebalanceInProgress` or `read tcp <ip>:<port>: i/o timeout` when kafka rebalance. see:
		// https://github.com/IBM/sarama/issues/1192
		case <-session.Context().Done():
			return nil
		}
	}
}
