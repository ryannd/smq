import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

const rooms = {};
const roomUser = {};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('joinRoom')
  async createRoom(
    @MessageBody('id') id: string,
    @MessageBody('user') user: any,
    @ConnectedSocket()
    client: Socket,
  ) {
    this.logger.log(id);
    await client.join(id);
    const newUser = {
      user,
      score: 0,
      id: client.id,
    };
    if (roomUser[id] == undefined) {
      roomUser[id] = {};
    }
    if (rooms[id] == undefined) {
      rooms[id] = [];
    }
    if (roomUser[id][client.id] !== true) {
      rooms[id].push(newUser);
      roomUser[id][client.id] = true;
      this.server.to(id).emit('playerJoined', rooms[id]);
    }
  }

  @SubscribeMessage('hostTopTracks')
  topTracksMessage(
    @MessageBody('id') id: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log('hostTopTracks message. topTracks message emitted.');
    this.server.to(id).emit('topTracks');
  }

  @SubscribeMessage('tracks')
  getTopTracks(
    @MessageBody('id') id: string,
    @ConnectedSocket() client: Socket,
    @MessageBody('data') data: any,
  ) {
    this.logger.log('tracks message emitted.');
    this.server.to(id).emit('tracks', data);
  }

  @SubscribeMessage('startGame')
  startTimer(@MessageBody('id') id: string) {
    this.server.to(id).emit('gameTimerStart');
    const io = this.server;
    let count = 5;
    const countdown = setInterval(function () {
      io.to(id).emit('timerStartTick', count);
      if (count === 0) {
        clearInterval(countdown);
        io.to(id).emit('startAll');
      }
      count--;
    }, 1000);
  }

  @SubscribeMessage('newSong')
  changeSong(@MessageBody('song') song: any, @MessageBody('id') id: string) {
    let count = 19;
    const io = this.server;
    this.logger.log('New song.');
    this.server.to(id).emit('changeSong', song);
    this.server.to(id).emit('newRound');
    io.to(id).emit('roundStartTick', 20);
    const countdown = setInterval(function () {
      io.to(id).emit('roundStartTick', count);
      if (count === 0) {
        clearInterval(countdown);
        io.to(id).emit('roundDone');
        io.to(id).emit('showTitle');
      }
      count--;
    }, 1000);
  }

  @SubscribeMessage('roundAnswer')
  savePoints(
    @MessageBody('user') user,
    @MessageBody('id') id: string,
    @MessageBody('answer') answer,
    @ConnectedSocket() client: Socket,
  ) {
    const found = rooms[id].findIndex((element) => element.id == client.id);
    const score = rooms[id][found].score + (answer ? 10 : 0);
    const updatedUser = { user, score, id: rooms[id][found].id };
    console.log(answer);
    console.log(rooms[id][found]);
    rooms[id][found] = updatedUser;
    this.server.to(id).emit('updateScore', rooms[id]);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
