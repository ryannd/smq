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

    const tracks = await this.spotifyService
      .getMyTopTracks()
      .then((data) => {
        return data.body.items
          .filter((track) => track.preview_url !== null)
          .map((track) => {
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
      })
      .catch((err) => {
        console.log(err);
      });
    console.log(tracks);
    if (!tracks) {
      throw new HttpException('Error fetching tracks.', HttpStatus.BAD_REQUEST);
    }

    return tracks;
  }

  async getPlaylistFromId(playlistId: string, userId: string) {
    await this.userService.setSpotifyUserToken(userId);
    let title;
    const tracks = await this.spotifyService
      .getPlaylist(playlistId)
      .then((data) => {
        title = data.body.name;
        return data.body.tracks.items
          .filter((track) => track.track.preview_url !== null)
          .map((obj) => {
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
            } = obj.track;
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
      })
      .catch((err) => {
        throw new HttpException(
          'Error fetching playlist tracks.',
          HttpStatus.BAD_REQUEST,
        );
      });
    return {
      title,
      tracks,
    };
  }
}
