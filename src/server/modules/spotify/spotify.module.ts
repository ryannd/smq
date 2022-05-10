import { Module } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyController } from './spotify.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SpotifyWebApi = require('spotify-web-api-node');

const SpotifyProvider = {
  provide: 'SpotifyClient',
  useFactory: (configService: ConfigService) => {
    const spotifyClient = new SpotifyWebApi({
      clientId: configService.get('SPOTIFY_CLIENT_ID'),
      clientSecret: configService.get('SPOTIFY_CLIENT_SECRET'),
      redirectUri: configService.get('REDIRECT_URL'),
    });
    return spotifyClient;
  },
  inject: [ConfigService],
};

@Module({
  controllers: [SpotifyController],
  providers: [SpotifyService, SpotifyProvider],
  imports: [ConfigModule],
})
export class SpotifyModule {}
