import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SpotifyService } from '../spotify/spotify.service';
import { UserService } from '../user/user.service';

@Injectable()
export class TracksService {
  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly userService: UserService,
  ) {}

  async getUserTopTracks(userId: string) {
    await this.userService.setSpotifyUserToken(userId);

    const tracks = await this.spotifyService.getMyTopTracks().then((data) => {
      return data.body.items.map((track) => {
        const {
          href,
          id,
          is_local,
          name,
          popularity,
          preview_url,
          track_number,
          type,
          uri,
          album: { images },
          artists,
        } = track;
        return {
          href,
          id,
          is_local,
          name,
          popularity,
          preview_url,
          track_number,
          type,
          uri,
          images,
          artists,
        };
      });
    });

    if (!tracks) {
      throw new HttpException('Error fetching tracks.', HttpStatus.BAD_REQUEST);
    }

    return tracks;
  }
}
