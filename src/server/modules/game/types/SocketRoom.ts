import { SocketUser } from "./SocketUser";

export type SocketRoom = {
  host: string;
  users: {
    [key: string]: SocketUser;
  };
  tracks: any[];
};
