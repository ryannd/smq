export type AuthInfo = {
  accessToken: string;
  refreshToken: string;
  expires_in: number;
};

export type ProfileJson = {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: {
    spotify: string;
  };
  followers: {
    href: null;
    total: number;
  };
  href: string;
  id: string;
  images: [{ height: null; url: string; width: null }];
  product: string;
  type: string;
  uri: string;
};

export type SocketRoom = {
  host: string;
  users: {
    [key: string]: SocketUser;
  };
  waitingRoom: SocketUser[];
  tracks: any[];
  allTrackTitles: string[];
  inGame: boolean;
  numReady: number;
  numUsers: number;
  currentGame: GameInfo;
};

export type GameInfo = {
  rounds: number;
  currentRound: number;
  gameMode: string;
  playlistTitle?: string;
};

export type SocketUser = {
  user: ClientUser;
  id: string;
  voteSkip: boolean;
  isAnswerCorrect: boolean;
  answer: string;
  score: number;
  isReady: boolean;
};

export type ClientUser = {
  name: string;
  pic?: {
    url: string;
    height: number;
    width: number;
  };
  url: string;
  id: string;
};

export type Track = {
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
  images: [{ height: null; url: string; width: null }];
  artists: string[];
};

export type Playlist = {
  title: string;
  tracks: Track[];
};
