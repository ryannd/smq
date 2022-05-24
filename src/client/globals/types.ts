export type User = {
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
export type GameRoom = {
  host: string;
  users: {
    [key: string]: GameUser;
  };
  waitingRoom: GameUser[];
  tracks: Track[];
  allTrackTitles: string[];
  inGame: boolean;
};

export type GameUser = {
  user: {
    name: string;
    pic?: {
      url: string;
      height: number;
      width: number;
    };
    url: string;
    id: string;
  };
  id: string;
  voteSkip: boolean;
  isAnswerCorrect: boolean;
  answer: string;
  score: number;
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
  images: string[];
  artists: string[];
};
