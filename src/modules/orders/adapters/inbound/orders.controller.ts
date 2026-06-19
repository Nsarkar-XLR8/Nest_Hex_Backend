import { Body, Controller, Headers, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderUseCase } from '../../ports/inbound/create-order.usecase';
import { CreateOrderDto } from './dto/create-order.dto';
import { CREATE_ORDER_USE_CASE } from '../../orders.tokens';
import { IdempotencyKeyRequiredException } from '../../application/exceptions/idempotency-key-required.exception';
import { buildResponse, createLink } from '../../../common/hateoas/hateoas';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(CREATE_ORDER_USE_CASE)
    private readonly createOrder: CreateOrderUseCase,
  ) {}

  @Post()
  async create(
    @Body() body: CreateOrderDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<ReturnType<typeof buildResponse>> {
    if (!idempotencyKey) {
      throw new IdempotencyKeyRequiredException();
    }

    const result = await this.createOrder.execute({
      customerId: body.customerId,
      items: body.items,
      idempotencyKey,
    });

    return buildResponse(result, [
      createLink({ rel: 'self', href: '/api/v1/orders', method: 'POST' }),
      createLink({ rel: 'orders', href: '/api/v1/orders', method: 'GET' }),
    ]);
  }
}
