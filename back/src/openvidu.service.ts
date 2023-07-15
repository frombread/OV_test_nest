import { Injectable } from '@nestjs/common';
import { Connection, OpenVidu, OpenViduRole, Session } from 'openvidu-node-client';

@Injectable()
export class OpenViduService {
    private openVidu: OpenVidu;
    private sessions: Map<string, Session>;

    constructor(private hostname: string, private secret: string) {
        this.openVidu = new OpenVidu(hostname, secret);
        this.sessions = new Map();
    }

    async createSession(sessionName: string): Promise<Session> {
        const session = await this.openVidu.createSession({
            customSessionId: sessionName,
        });
        this.sessions.set(sessionName, session);
        return session;
    }

    async generateToken(sessionName: string, role: OpenViduRole, data: string): Promise<string> {
        if (!this.sessions.has(sessionName)) {
            throw new Error('Session not found');
        }
        const session = this.sessions.get(sessionName);
        return session.generateToken({
            role: role,
            data: data,
        });
    }

    async getSessionNames(): Promise<string[]> {
        return Array.from(this.sessions.keys());
    }
}
