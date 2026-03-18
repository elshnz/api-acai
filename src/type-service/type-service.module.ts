import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeServiceService } from './type-service.service';
import { TypeServiceController } from './type-service.controller';
import { TypeService } from './entities/type-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TypeService])],
  controllers: [TypeServiceController],
  providers: [TypeServiceService],
  exports: [TypeServiceService],
})
export class TypeServiceModule {}
