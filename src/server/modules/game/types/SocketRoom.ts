import { SocketUser } from './SocketUser';

export type SocketRoom = {
  host: string;
  users: {
    [key: string]: SocketUser;
  };
  waitingRoom: SocketUser[];
  tracks: any[];
  allTrackTitles: string[];
  inGame: boolean;
};
