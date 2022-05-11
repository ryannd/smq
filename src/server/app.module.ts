import { Module } from '@nestjs/common';
import { ViewModule } from './modules/view/view.module';
import { SpotifyModule } from './modules/spotify/spotify.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/smq'),
    AuthModule,
    UserModule,
    SpotifyModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ViewModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
