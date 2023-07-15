// src/openvidu.service.ts

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OpenVidu, Session } from 'openvidu-node-client';

const OPENVIDU_URL = 'http://localhost:4443';
const OPENVIDU_SECRET = 'MY_SECRET';

// 세션에 참여한 참가자들의 정보를 담기 위한 인터페이스
interface ParticipantInfo {
  id: string;
  // 다른 원하는 참가자 정보가 있다면 여기에 추가하세요
}

@Injectable()
export class OpenViduService {
  private openvidu: OpenVidu;
  private activeSessions: Map<string, ParticipantInfo[]>;

  constructor() {
    this.openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    this.activeSessions = new Map();
  }

  async createSession(body: any) {
    try {
      const session = await this.openvidu.createSession(body);
      this.activeSessions.set(session.sessionId, []); // 세션 생성 시 activeSessions에 빈 배열로 추가
      return session.sessionId;
    } catch (err) {
      console.log('create Session catch');
      console.log('Error stack:', err.stack);
      throw new HttpException(
        'Error Creating session: ' + err.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createConnection(sessionId: string, body: any, client: any) {
    const session = this.openvidu.activeSessions.find(
      (s) => s.sessionId === sessionId,
    );
    if (!session) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    } else {
      try {
        const connection = await session.createConnection(body);
        const participants: ParticipantInfo[] =
          this.activeSessions.get(sessionId) || [];
        participants.push({ id: client.id }); // 사용자 정보 추가
        this.activeSessions.set(sessionId, participants);
        return connection.token;
      } catch (err) {
        throw new HttpException(
          'Error creating connection: ' + err.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async getSessionNames(): Promise<string[]> {
    return Array.from(this.activeSessions.keys());
  }

  async getSessionParticipants(sessionId: string): Promise<ParticipantInfo[]> {
    return this.activeSessions.get(sessionId) || [];
  }

  async removeParticipantFromSession(sessionId: string, clientId: string) {
    const participants: ParticipantInfo[] =
      this.activeSessions.get(sessionId) || [];
    const updatedParticipants = participants.filter(
      (participant) => participant.id !== clientId,
    );
    this.activeSessions.set(sessionId, updatedParticipants);
  }
}
