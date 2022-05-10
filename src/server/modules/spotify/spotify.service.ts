import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SpotifyWebApi = require('spotify-web-api-node');

@Injectable()
export class SpotifyService extends SpotifyWebApi {
  constructor() {
    super({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.CALLBACK_URL,
    });
  }
}
