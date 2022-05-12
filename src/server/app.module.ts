import { Module } from '@nestjs/common';
import { ViewModule } from './modules/view/view.module';
import { SpotifyModule } from './modules/spotify/spotify.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppGateway } from './app.gateway';
import { TracksModule } from './modules/tracks/tracks.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost/smq',
    ),
    AuthModule,
    UserModule,
    SpotifyModule,
    TracksModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ViewModule,
  ],
  controllers: [],
  providers: [AppGateway],
})
export class AppModule {}
