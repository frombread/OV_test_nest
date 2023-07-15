import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class OpenViduGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@MessageBody() data: { roomName: string; username: string }) {
        this.server.to(data.roomName).emit('userJoined', data.username);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@MessageBody() data: { roomName: string; username: string }) {
        this.server.to(data.roomName).emit('userLeft', data.username);
    }

    // Add more WebSocket event handlers for your video chat application
    // For example, handling WebRTC signaling, managing room participants, etc.
}
