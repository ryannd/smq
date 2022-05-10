import { Module } from '@nestjs/common';
import { ViewModule } from './modules/view/view.module';
import { SpotifyModule } from './modules/spotify/spotify.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [SpotifyModule, ConfigModule.forRoot(), ViewModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
