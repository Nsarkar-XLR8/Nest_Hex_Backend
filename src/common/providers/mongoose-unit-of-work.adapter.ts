import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';
import { UnitOfWorkContext, UnitOfWorkPort } from '../ports/unit-of-work.port';
import { TransactionNotSupportedException } from '../exceptions/transaction-not-supported.exception';

class MongooseUnitOfWorkContext implements UnitOfWorkContext {
  constructor(private readonly session: ClientSession) {}

  getSession(): unknown {
    return this.session;
  }
}

@Injectable()
export class MongooseUnitOfWorkAdapter implements UnitOfWorkPort {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async withTransaction<T>(work: (context: UnitOfWorkContext) => Promise<T>): Promise<T> {
    const session = await this.connection.startSession();

    try {
      let result: T | undefined;
      await session.withTransaction(async () => {
        result = await work(new MongooseUnitOfWorkContext(session));
      });

      if (result === undefined) {
        throw new Error('Transaction completed without a result');
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('Transaction numbers are only allowed on a replica set member or mongos')) {
        throw new TransactionNotSupportedException();
      }
      throw error;
    } finally {
      session.endSession();
    }
  }
}
