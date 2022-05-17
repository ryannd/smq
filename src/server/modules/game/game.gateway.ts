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
import { SocketRoom } from './types/SocketRoom';
import { SocketUser } from './types/SocketUser';
import { TracksService } from '../tracks/tracks.service';

// hold room data
const rooms = new Map<string, SocketRoom>();
// get host room
const hostToRoomId = new Map<string, string>();
// only allow user to be in 1 room at a time
const spotifyIdToRoomId = new Map<string, string>();
// map socketio client id to spotify user id
const socketToSpotifyId = new Map<string, string>();
// timer countdown interval
let roundCountdown;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');
  constructor(private tracksClient: TracksService) {}

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody('id') id: string,
    @MessageBody('user') user: any,
    @ConnectedSocket()
    client: Socket,
  ) {
    if (!rooms.has(id)) {
      this.server.to(client.id).emit('roomDoesNotExist');
    } else {
      await client.join(id);
      const newUser: SocketUser = {
        user,
        score: 0,
        voteSkip: false,
        isAnswerCorrect: false,
        answer: '',
        id: user.id,
      };
      if (!spotifyIdToRoomId.has(user.id)) {
        rooms.get(id).users[user.id] = newUser;
      }
      spotifyIdToRoomId.set(user.id, id);
      socketToSpotifyId.set(client.id, user.id);
      this.server.to(id).emit('updateRoom', rooms.get(id));
    }
  }

  @SubscribeMessage('hostSkip')
  skipSong(@MessageBody('id') id: string) {
    this.server.to(id).emit('roundDone');
    this.server.to(id).emit('showTitle');
    clearInterval(roundCountdown);
  }

  @SubscribeMessage('hostJoinRoom')
  async createRoom(
    @MessageBody('id') id: string,
    @MessageBody('user') user: any,
    @ConnectedSocket()
    client: Socket,
  ) {
    await client.join(id);
    const newUser: SocketUser = {
      user,
      score: 0,
      voteSkip: false,
      isAnswerCorrect: false,
      answer: '',
      id: user.id,
    };
    console.log('Host join room.');
    if (!spotifyIdToRoomId.has(user.id)) {
      rooms.set(id, {
        host: user.id,
        users: {},
        tracks: [],
        allTrackTitles: [],
      });
      rooms.get(id).users[user.id] = newUser;
      spotifyIdToRoomId.set(user.id, id);
      socketToSpotifyId.set(client.id, user.id);
      hostToRoomId.set(user.id, id);
      console.log('User added.');
    }

    this.server.to(id).emit('updateRoom', rooms.get(id));
  }

  @SubscribeMessage('hostTopTracks')
  async topTracksMessage(@MessageBody('id') id: string) {
    const room = rooms.get(id);
    const tracks = await Promise.all(
      Object.keys(room.users).map(async (userId) => {
        return await this.tracksClient.getUserTopTracksAll(userId);
      }),
    );
    room.tracks = tracks.flat();
    room.tracks = room.tracks.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.id === value.id),
    );
    room.allTrackTitles = room.tracks.map((v) => v.name);
    this.server.to(id).emit('topTracks');
    this.server.to(id).emit('updateRoom', rooms.get(id));
  }

  @SubscribeMessage('hostPlaylist')
  async playlistMessage(
    @MessageBody('id') id: string,
    @MessageBody('playlistId') playlistId: string,
    @ConnectedSocket()
    client: Socket,
  ) {
    const tracks = await this.tracksClient.getPlaylistFromId(
      playlistId,
      socketToSpotifyId.get(client.id),
    );
    this.server.to(id).emit('playlist', tracks.title);
    const room = rooms.get(id);
    room.tracks = tracks.tracks;
    room.allTrackTitles = room.tracks.map((v) => v.name);
    this.server.to(id).emit('updateRoom', rooms.get(id));
  }

  @SubscribeMessage('tracks')
  getTopTracks(
    @MessageBody('id') id: string,
    @MessageBody('tracks') tracks: any,
  ) {
    const room = rooms.get(id);
    room.tracks = room.tracks.concat(tracks);
    room.tracks = room.tracks.filter((value, index, self) => {
      index ===
        self.findIndex((t) => {
          t.id === value.id;
        });
    });
    this.server.to(id).emit('updateRoom', rooms.get(id));
  }

  @SubscribeMessage('startGame')
  startTimer(@MessageBody('id') id: string) {
    const io = this.server;
    const room = rooms.get(id);
    this.server.to(id).emit('tracks', room.tracks);
    this.server.to(id).emit('gameTimerStart');

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
  changeSong(@MessageBody('id') id: string) {
    const io = this.server;
    let count = 19;
    const tracks = rooms.get(id).tracks;
    const users = rooms.get(id).users;
    const index = Math.floor(Math.random() * tracks.length);
    const nextSong = tracks[index];
    rooms.get(id).tracks.splice(index, 1);

    this.server.to(id).emit('changeSong', nextSong);
    this.server.to(id).emit('newRound');

    Object.entries(users).forEach((entry) => {
      const [key, val]: any = entry;
      rooms.get(id).users[key] = {
        ...val,
        isAnswerCorrect: false,
        answer: '',
      };
    });
    this.server.to(id).emit('updateRoom', rooms.get(id));

    io.to(id).emit('roundStartTick', 20);
    roundCountdown = setInterval(function () {
      io.to(id).emit('roundStartTick', count);
      if (count === 0) {
        clearInterval(roundCountdown);
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
    @MessageBody('isAnswerCorrect') isAnswerCorrect,
    @MessageBody('answer') answer,
    @ConnectedSocket() client: Socket,
  ) {
    const foundUser = rooms.get(id).users[user.id];
    const newScore = foundUser.score + (isAnswerCorrect ? 10 : 0);
    foundUser.score = newScore;
    foundUser.answer = answer;
    foundUser.isAnswerCorrect = isAnswerCorrect;
    this.server.to(id).emit('updateRoom', rooms.get(id));
  }

  @SubscribeMessage('endGame')
  endGame(@MessageBody('id') id: string) {
    this.server.to(id).emit('endGame');
    const users = rooms.get(id).users;
    Object.entries(users).forEach((entry) => {
      const [key, val]: any = entry;
      rooms.get(id).users[key] = {
        ...val,
        answer: '',
      };
    });
    this.server.to(id).emit('updateRoom', rooms.get(id));
    clearInterval(roundCountdown);
  }

  @SubscribeMessage('newGame')
  newGame(@MessageBody('id') id: string) {
    const users = rooms.get(id).users;
    Object.entries(users).forEach((entry) => {
      const [key, val]: any = entry;
      rooms.get(id).users[key] = {
        ...val,
        score: 0,
      };
    });

    this.server.to(id).emit('updateRoom', rooms.get(id));
    this.server.to(id).emit('newGame');
    clearInterval(roundCountdown);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    const spotify = socketToSpotifyId.get(client.id);
    if (hostToRoomId.has(spotify)) {
      const room = hostToRoomId.get(spotify);
      const users = rooms.get(room).users;
      Object.keys(users).forEach((user) => spotifyIdToRoomId.delete(user));
      this.server.to(room).emit('hostDisconnect');
      hostToRoomId.delete(spotify);
      rooms.delete(room);
    } else {
      const room = spotifyIdToRoomId.get(spotify);
      delete rooms.get(room).users[spotify];
      this.server.to(room).emit('updateRoom', rooms.get(room));
      spotifyIdToRoomId.delete(spotify);
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
