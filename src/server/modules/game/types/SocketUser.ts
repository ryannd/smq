export type SocketUser = {
    user: {
        name: string;
        pic?: string;
        url: string;
        id: string;
    };
    id: string;
    voteSkip: boolean;
    answer: string;
    score: number;
}