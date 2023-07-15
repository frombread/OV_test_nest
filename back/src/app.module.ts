// src/app.module.ts
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
    { provide: 'hostname', useValue: 'http://localhost:4443' }, // Replace with your OpenVidu hostname
    { provide: 'secret', useValue: 'MY_SECRET' }, // Replace with your OpenVidu secret
    // Provide the dependencies for OpenViduService
    {
      provide: OpenViduService,
      useFactory: (hostname: string, secret: string) => new OpenViduService(hostname, secret),
      inject: ['hostname', 'secret'],
    },
    AppGateway,
  ],
})
export class AppModule {}