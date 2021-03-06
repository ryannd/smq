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
import { ClientUser, SocketRoom } from '../../globals/types';
import { SocketUser } from '../../globals/types';
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
  private logger: Logger = new Logger('GameGateway');
  constructor(private tracksClient: TracksService) {
    this.roundPause = this.roundPause.bind(this);
    this.changeSong = this.changeSong.bind(this);
    this.endGame = this.endGame.bind(this);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody('id') id: string,
    @MessageBody('user') user: ClientUser,
    @ConnectedSocket()
    client: Socket,
  ) {
    if (!rooms.has(id)) {
      this.server.to(client.id).emit('roomDoesNotExist');
    } else {
      await client.join(id);
      this.logger.log(`Client joined room: ${id}`);

      if (rooms.get(id).inGame) {
        this.server.to(client.id).emit('roomInGame');
      }

      const newUser: SocketUser = {
        user,
        score: 0,
        voteSkip: false,
        isAnswerCorrect: false,
        answer: '',
        id: user.id,
        isReady: false,
      };

      // only add if user not in a different room already
      if (!spotifyIdToRoomId.has(user.id)) {
        if (rooms.get(id).inGame) {
          // put user in waiting room
          rooms.get(id).waitingRoom.push(newUser);
          this.server.to(client.id).emit('updateRoom', rooms.get(id));
        } else {
          rooms.get(id).users[user.id] = newUser;
          rooms.get(id).numUsers++;
        }

        spotifyIdToRoomId.set(user.id, id);
        socketToSpotifyId.set(client.id, user.id);
        this.server.to(id).emit('updateRoom', rooms.get(id));
      }

      // user in limbo i guess shouldn'tve joined 2 rooms at once bozo
    }
  }

  @SubscribeMessage('skipSong')
  skipSong(@MessageBody('id') id: string, @ConnectedSocket() client: Socket) {
    // get user id and set vote skip to true
    const spotify = socketToSpotifyId.get(client.id);
    const users = rooms.get(id).users;
    const room = rooms.get(id);
    users[spotify].voteSkip = true;

    // send vote to room
    this.server.to(id).emit('updateRoom', rooms.get(id));

    // if everyone in room vote skips, skip the song
    const numUsers = Object.entries(users).length;
    let count = 0;
    for (let i = 0; i < numUsers; i++) {
      if (Object.values(users)[i].voteSkip) {
        count++;
      }
    }

    if (count == numUsers) {
      this.logger.log(`Skipped song in room: ${id}`);
      this.server.to(id).emit('roundDone');
      this.server.to(id).emit('showTitle');
      this.roundPause(
        id,
        room.currentGame.rounds,
        room.currentGame.currentRound,
      );
      clearInterval(roundCountdown);
    }
  }

  @SubscribeMessage('hostJoinRoom')
  async createRoom(
    @MessageBody('id') id: string,
    @MessageBody('user') user: ClientUser,
    @ConnectedSocket()
    client: Socket,
  ) {
    await client.join(id);
    this.logger.log(`Host created room: ${id}`);

    const newUser: SocketUser = {
      user,
      score: 0,
      voteSkip: false,
      isAnswerCorrect: false,
      answer: '',
      id: user.id,
      isReady: false,
    };

    // only create room if host not in another room already
    if (!spotifyIdToRoomId.has(user.id)) {
      rooms.set(id, {
        host: user.id,
        users: {},
        tracks: [],
        allTrackTitles: [],
        waitingRoom: [],
        inGame: false,
        currentGame: {
          rounds: 5,
          currentRound: 0,
          gameMode: '',
          playlistTitle: '',
        },
        numReady: 0,
        numUsers: 1,
      });

      rooms.get(id).users[user.id] = newUser;
      spotifyIdToRoomId.set(user.id, id);
      socketToSpotifyId.set(client.id, user.id);
      hostToRoomId.set(user.id, id);
    }

    this.server.to(id).emit('updateRoom', rooms.get(id));
  }

  @SubscribeMessage('hostTopTracks')
  async topTracksMessage(
    @MessageBody('id') id: string,
    @MessageBody('range') timeRange: string,
    @MessageBody('limit') limit: number,
  ) {
    // get top tracks of all users in the room based on criteria
    const room = rooms.get(id);
    const tracks = await Promise.all(
      Object.keys(room.users).map(async (userId) => {
        if (userId.length == 5) return;
        return await this.tracksClient.getUserTopTracks(
          userId,
          timeRange,
          limit,
        );
      }),
    );
    room.currentGame.gameMode = 'Top Tracks';
    this.server.to(id).emit('updateRoom', rooms.get(id));
    // remove duplicates
    room.tracks = tracks
      .flat()
      .filter((v) => v !== undefined)
      .filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.id === value.id),
      );
    // save track titles for autofill (bc new song takes it out of tracks array so it doesnt get picked twice)
    room.allTrackTitles = room.tracks.map((v) => v.name);

    this.logger.log(
      `Room ${id} selected Top Tracks with time range: ${timeRange} and limit: ${limit}`,
    );
    this.server.to(id).emit('topTracks');
    this.server.to(id).emit('updateRoom', rooms.get(id));
  }

  @SubscribeMessage('hostPlaylist')
  async playlistMessage(
    @MessageBody('id') id: string,
    @MessageBody('playlistId') playlistId: string,
  ) {
    // get playlist tracks and update room with new tracks
    const playlist = await this.tracksClient.getPlaylistFromId(playlistId);
    // send the title before tracks so it looks faster than it is :3
    const room = rooms.get(id);
    room.currentGame.gameMode = 'Playlist';
    room.currentGame.playlistTitle = playlist.title;
    this.server.to(id).emit('updateRoom', rooms.get(id));

    room.tracks = playlist.tracks;
    // save track titles for autofill (bc new song takes it out of tracks array so it doesnt get picked twice)
    room.allTrackTitles = room.tracks.map((v) => v.name);
    this.logger.log(`Room ${id} selected playlist: ${playlist.title}`);
    this.server.to(id).emit('updateRoom', rooms.get(id));
  }

  @SubscribeMessage('startGame')
  startTimer(@MessageBody('id') id: string) {
    const io = this.server;
    const room = rooms.get(id);
    // send tracks again in case someone joined late
    this.server.to(id).emit('updateRoom', room);
    this.logger.log(
      `Room ${id} has begun their game with ${room.currentGame.rounds} rounds.`,
    );
    // prep timer might remove or shorten later tbh
    this.server.to(id).emit('gameTimerStart');
    let count = 5;
    const changeSong = this.changeSong;
    const countdown = setInterval(function () {
      io.to(id).emit('timerStartTick', count);
      if (count === 0) {
        clearInterval(countdown);
        room.inGame = true;
        io.to(id).emit('startAll');
        changeSong(id);
      }
      count--;
    }, 1000);
  }

  roundPause(id: string, roundCount: number, currentRound: number) {
    const endGame = this.endGame;
    const changeSong = this.changeSong;
    let count = 5;
    const countdown = setInterval(function () {
      if (count === 0) {
        clearInterval(countdown);
        if (currentRound < roundCount) {
          changeSong(id);
        } else {
          endGame(id);
        }
      }
      count--;
    }, 1000);
  }

  changeSong(id: string) {
    const io = this.server;
    const room = rooms.get(id);
    const tracks = room.tracks;
    const users = room.users;
    room.currentGame.currentRound++;
    // get random index of tracks array
    const index = Math.floor(Math.random() * tracks.length);
    const nextSong = tracks[index];
    // remove from array to prevent doubles
    room.tracks.splice(index, 1);
    if (nextSong == null) {
      this.endGame(id);
      return;
    }
    this.server.to(id).emit('changeSong', nextSong);
    this.server.to(id).emit('newRound');

    // reset user answers and vote skip for new round
    Object.entries(users).forEach((entry) => {
      const [key, val]: any = entry;
      rooms.get(id).users[key] = {
        ...val,
        isAnswerCorrect: false,
        answer: '',
        voteSkip: false,
      };
    });

    this.server.to(id).emit('updateRoom', rooms.get(id));

    // 20 sec round timer (19 bc of delay at start)
    let count = 19;
    const roundPause = this.roundPause;
    io.to(id).emit('roundStartTick', 20);
    roundCountdown = setInterval(function () {
      io.to(id).emit('roundStartTick', count);
      if (count == 0) {
        clearInterval(roundCountdown);
        roundPause(id, room.currentGame.rounds, room.currentGame.currentRound);
        io.to(id).emit('showTitle');
      }
      if (count < 0) {
        clearInterval(roundCountdown);
      }
      count--;
    }, 1000);
  }

  @SubscribeMessage('roundAnswer')
  savePoints(
    @MessageBody('user') user: ClientUser,
    @MessageBody('id') id: string,
    @MessageBody('isAnswerCorrect') isAnswerCorrect,
    @MessageBody('answer') answer,
  ) {
    // update user score and room to show all user answers
    const foundUser = rooms.get(id).users[user.id];
    const newScore = foundUser.score + (isAnswerCorrect ? 10 : 0);
    foundUser.score = newScore;
    foundUser.answer = answer !== '' ? answer : 'No answer';
    foundUser.isAnswerCorrect = isAnswerCorrect;
    this.server.to(id).emit('updateRoom', rooms.get(id));
  }

  @SubscribeMessage('endGame')
  endGame(@MessageBody('id') id: string) {
    this.server.to(id).emit('endGame');
    const users = rooms.get(id).users;
    const room = rooms.get(id);

    // prevent keeping final answer shown at end screen
    Object.entries(users).forEach((entry) => {
      const [key, val]: any = entry;
      rooms.get(id).users[key] = {
        ...val,
        answer: '',
        voteSkip: false,
        isReady: false,
      };
    });
    rooms.set(id, {
      ...room,
      inGame: false,
      numReady: 0,
      currentGame: {
        ...room.currentGame,
        currentRound: 0,
        playlistTitle: '',
        gameMode: '',
      },
    });
    this.logger.log(`Room ${id} has ended their game.`);
    this.server.to(id).emit('updateRoom', rooms.get(id));
    clearInterval(roundCountdown);
  }

  @SubscribeMessage('newGame')
  newGame(@MessageBody('id') id: string) {
    const users = rooms.get(id).users;

    // TODO: after implementing exp and user enhancements, can put exp logic here probably

    // move users from waiting room to game
    rooms.get(id).waitingRoom.forEach((user) => {
      users[user.id] = user;
      rooms.get(id).numUsers++;
    });
    rooms.get(id).waitingRoom = [];

    // reset user score at end of game
    Object.entries(users).forEach((entry) => {
      const [key, val]: any = entry;
      rooms.get(id).users[key] = {
        ...val,
        score: 0,
      };
    });
    rooms.get(id).currentGame.rounds = 5;
    this.logger.log(`Room ${id} chose to start a new game.`);
    this.server.to(id).emit('updateRoom', rooms.get(id));
    this.server.to(id).emit('newGame');
    clearInterval(roundCountdown);
  }

  @SubscribeMessage('roundCount')
  roundCount(
    @MessageBody('id') id: string,
    @MessageBody('rounds') rounds: number,
  ) {
    const room = rooms.get(id);
    room.currentGame.rounds = rounds;
    this.server.to(id).emit('updateRoom', rooms.get(id));
  }

  @SubscribeMessage('ready')
  ready(@MessageBody('id') id: string, @MessageBody('user') user: ClientUser) {
    const room = rooms.get(id);
    if (room.users[user.id].isReady !== true) {
      room.users[user.id].isReady = true;
      room.numReady++;
    }
    this.server.to(id).emit('updateRoom', room);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    const spotify = socketToSpotifyId.get(client.id);
    let room: string;
    // if disconnected user is a host, delete room. if not, remove user from room
    if (hostToRoomId.has(spotify)) {
      room = hostToRoomId.get(spotify);
      if (rooms.get(room) !== undefined) {
        const users = rooms.get(room).users;
        delete rooms.get(room).users[spotify];
        hostToRoomId.delete(spotify);
        spotifyIdToRoomId.delete(spotify);

        this.server.to(room).emit('updateRoom', rooms.get(room));
        rooms.get(room).numUsers--;
        if (Object.keys(rooms.get(room).users).length === 0) {
          rooms.delete(room);
          this.server.to(room).emit('hostDisconnect');
        } else {
          const newHost = Object.keys(users)[0];
          hostToRoomId.set(users[newHost].id, room);
          for (const [k, v] of socketToSpotifyId.entries()) {
            if (v === newHost) {
              this.server.to(k).emit('newHost');
            }
          }
        }
      }
    } else {
      room = spotifyIdToRoomId.get(spotify);
      if (rooms.get(room) !== undefined) {
        delete rooms.get(room).users[spotify];
        rooms.get(room).numUsers--;
        this.server.to(room).emit('updateRoom', rooms.get(room));
        spotifyIdToRoomId.delete(spotify);
      }
    }

    this.logger.log(`Client ${client.id} disconnected from room ${room}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
