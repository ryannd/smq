import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { SpotifyModule } from '../spotify/spotify.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [TracksController],
  providers: [TracksService],
  imports: [SpotifyModule, UserModule],
  exports: [TracksService]
})
export class TracksModule {}
