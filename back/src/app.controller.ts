// src/app.controller.ts

import { Controller, Get, Post, Body, Param, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { OpenViduService } from './openvidu.service';
import { AppGateway } from './app.gateway'; // AppGateway 추가

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly openViduService: OpenViduService,
    private readonly appGateway: AppGateway, // AppGateway 주입
  ) {}

  @Get()
  getHello(): string {
    return 'Video Chat App';
  }

  @Get('rooms')
  async getRooms(@Res() res) {
    const rooms = await this.openViduService.getSessionNames();
    res.send(rooms);
  }

  @Post('sessions')
  async createSession(@Body() body: any) {
    return this.openViduService.createSession(body);
  }

  @Post('sessions/:sessionId/connections')
  async createConnection(
    @Param('sessionId') sessionId: string,
    @Body() body: any,
    @Req() req: any, // @Req() 데코레이터 추가
  ) {
    const token = await this.openViduService.createConnection(
      sessionId,
      body,
      req.client,
    );
    // 새로운 사용자가 세션에 참가했음을 모든 참가자들에게 알림
    this.appGateway.joinSession(sessionId, req.client);
    return token;
  }

  @Post('sessions/:sessionId/connections/:clientId/disconnect')
  async disconnectParticipant(
    @Param('sessionId') sessionId: string,
    @Param('clientId') clientId: string,
    @Req() req: any, // @Req() 데코레이터 추가
  ) {
    // 사용자가 세션에서 나갔음을 모든 참가자들에게 알림
    this.appGateway.leaveSession(sessionId, req.client);
    // 사용자 연결 종료 처리
    await this.openViduService.removeParticipantFromSession(
      sessionId,
      clientId,
    );
  }
}
