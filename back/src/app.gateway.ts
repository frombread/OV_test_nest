// src/app.gateway.ts

import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class AppGateway {
  @WebSocketServer()
  server: Server;

  private activeSessions: Map<string, any[]> = new Map();

  handleConnection(client: any) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
    // 연결이 끊긴 클라이언트를 activeSessions에서 제거
    this.activeSessions.forEach((participants, sessionId) => {
      this.activeSessions.set(
        sessionId,
        participants.filter((p) => p.id !== client.id),
      );
    });
  }

  // 새로운 사용자를 세션에 추가
  joinSession(sessionId: string, client: any) {
    const participants = this.activeSessions.get(sessionId) || [];
    participants.push(client);
    this.activeSessions.set(sessionId, participants);

    // 기존 참가자들에게 새로운 참가자의 정보 전달
    this.sendToSession(sessionId, 'newParticipant', client.id);
  }

  // 세션에서 사용자 제거
  leaveSession(sessionId: string, client: any) {
    const participants = this.activeSessions.get(sessionId) || [];
    this.activeSessions.set(
      sessionId,
      participants.filter((p) => p.id !== client.id),
    );

    // 나머지 참가자들에게 사용자의 떠남을 알림
    this.sendToSession(sessionId, 'participantLeft', client.id);
  }

  // 세션에 연결된 모든 사용자에게 이벤트 전달
  sendToSession(sessionId: string, event: string, payload: any) {
    const participants = this.activeSessions.get(sessionId) || [];
    participants.forEach((client) => {
      this.server.to(client.id).emit(event, payload);
    });
  }
}
