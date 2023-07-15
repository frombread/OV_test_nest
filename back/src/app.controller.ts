// src/app.controller.ts
import { Controller, Get, Post, Body, Param, Req, Res } from '@nestjs/common';
import { OpenViduRole } from 'openvidu-node-client';
import { AppService } from './app.service';
import { OpenViduService } from './openvidu.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly openViduService: OpenViduService) {}

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
  async createSession(@Body() body: { sessionName: string }) {
    const sessionId = body.sessionName;
    await this.openViduService.createSession(sessionId);
    const token = await this.openViduService.generateToken(sessionId, OpenViduRole.PUBLISHER, 'user-data');
    return token;
  }

  @Post('sessions/:sessionId/connections')
  async createConnection(@Req() req, @Res() res, @Param('sessionId') sessionId: string) {
    const role = OpenViduRole.PUBLISHER;
    const data = req.body.data || '';
    try {
      const token = await this.openViduService.generateToken(sessionId, role, data);
      res.send(token);
    } catch (error) {
      res.status(404).send(error.message);
    }
  }
}