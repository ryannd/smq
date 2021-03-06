import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Playlist, Track } from '~server/globals/types';
import { SpotifyService } from '../spotify/spotify.service';
import { UserService } from '../user/user.service';

@Injectable()
export class TracksService {
  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly userService: UserService,
  ) {}

  async getUserTopTracksAll(userId: string): Promise<Track[]> {
    await this.userService.setSpotifyUserToken(userId);
    const topTracks = (await this.spotifyService.getMyTopTracks()).body;
    if (topTracks.total > topTracks.limit) {
      for (let i = 1; i < Math.ceil(topTracks.total / topTracks.limit); i++) {
        const trackToAdd = (
          await this.spotifyService.getMyTopTracks({
            offset: topTracks.limit * i,
          })
        ).body;

        trackToAdd.items.forEach((item) => topTracks.items.push(item));
      }
    }
    const tracks: Track[] = topTracks.items
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

    if (!tracks) {
      throw new HttpException('Error fetching tracks.', HttpStatus.BAD_REQUEST);
    }

    return tracks;
  }

  async getUserTopTracks(
    userId: string,
    timeRange: string,
    limit: number,
  ): Promise<Track[]> {
    await this.userService.setSpotifyUserToken(userId);
    const topTracks = await this.spotifyService.getMyTopTracks({
      time_range: timeRange,
      limit,
    });
    const tracks: Track[] = topTracks.body.items
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

    if (!tracks) {
      throw new HttpException('Error fetching tracks.', HttpStatus.BAD_REQUEST);
    }

    return tracks;
  }

  async getPlaylistFromId(
    playlistId: string,
  ): Promise<Playlist> {
    const access = await this.spotifyService.clientCredentialsGrant().then((data) => data.body.access_token);
    this.spotifyService.setAccessToken(access);
    const playlist = (
      await this.spotifyService.getPlaylist(playlistId, { market: 'US' })
    ).body;
    const title = playlist.name;
    if (playlist.tracks.total > playlist.tracks.limit) {
      for (
        let i = 1;
        i < Math.ceil(playlist.tracks.total / playlist.tracks.limit);
        i++
      ) {
        const trackToAdd = (
          await this.spotifyService.getPlaylistTracks(playlistId, {
            offset: playlist.tracks.limit * i,
            market: 'US',
          })
        ).body;

        trackToAdd.items.forEach((item) => playlist.tracks.items.push(item));
      }
    }
    const tracks: Track[] = playlist.tracks.items
      .filter((track) => track.track !== null)
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
    return {
      title,
      tracks,
    };
  }
}
