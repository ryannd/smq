import { Controller, Get, Inject } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import { SpotifyService } from './spotify.service';

@Controller({
  path: 'api/spotify',
})
export class SpotifyController {
  constructor(
    private readonly spotifyService: SpotifyService,
    @Inject('SpotifyClient') private spotifyClient: SpotifyWebApi,
  ) {}

  @Get('/url')
  getSpotifyUrl() {
    const scopes = ['user-library-read', 'user-top-read'];
    const authorizeUrl = this.spotifyClient.createAuthorizeURL(scopes, '');
    return authorizeUrl;
  }
}
