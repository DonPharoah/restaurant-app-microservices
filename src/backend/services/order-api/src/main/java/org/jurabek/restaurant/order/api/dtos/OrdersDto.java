package org.jurabek.restaurant.order.api.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class OrdersDto {
   private List<OrderDto> orders;
   private Long total;
   private Integer offset;
   private Integer limit;
}
