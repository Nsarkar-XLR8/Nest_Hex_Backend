import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersRepositoryAdapter } from './adapters/outbound/mongoose/users.repository';
import { UserEntity, UserSchema } from './adapters/outbound/mongoose/user.schema';
import { UsersController } from './adapters/inbound/users.controller';
import { GetProfileService } from './application/services/get-profile.service';
import { USERS_REPOSITORY, USERS_SERVICE } from './users.tokens';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [
    {
      provide: USERS_REPOSITORY,
      useClass: UsersRepositoryAdapter,
    },
    {
      provide: USERS_SERVICE,
      useClass: GetProfileService,
    },
  ],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
