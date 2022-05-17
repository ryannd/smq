import { Module } from '@nestjs/common';
import { TracksModule } from '../tracks/tracks.module';
import { GameGateway } from './game.gateway';

@Module({
  providers: [GameGateway],
  imports: [TracksModule],
})
export class GameModule {}
