import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenViduService } from './openvidu.service';
import { AppGateway } from './app.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: OpenViduService,
      useClass: OpenViduService,
    },
    AppGateway,
  ],
})
export class AppModule {}
