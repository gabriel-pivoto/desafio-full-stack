import { Module } from '@nestjs/common';
import { ZonesModule } from './modules/zones.module';

@Module({
  imports: [ZonesModule],
})
export class HttpModule {}
