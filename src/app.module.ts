import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { VCController } from './controllers/vc.controller';
import { VCService } from './services/vc.service';


@Module({
  imports: [
    CacheModule.register({
      ttl: 1 * 3600 * 1000, // 1 hour
      // max: 10, // maximum number of items in cache
    })
  ],
  controllers: [VCController],
  providers: [VCService],
})
export class AppModule { }