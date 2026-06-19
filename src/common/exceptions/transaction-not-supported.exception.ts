import { DomainException } from './domain.exception';

export class TransactionNotSupportedException extends DomainException {
  constructor() {
    super({
      type: 'https://docs.nest-hex.local/problems/transactions/not-supported',
      title: 'Transactions not supported',
      status: 500,
      detail: 'MongoDB transactions require a replica set or sharded cluster',
    });
  }
}
