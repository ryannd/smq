export type SocketUser = {
  user: {
    name: string;
    pic?: string;
    url: string;
    id: string;
  };
  id: string;
  voteSkip: boolean;
  isAnswerCorrect: boolean;
  answer: string;
  score: number;
};
