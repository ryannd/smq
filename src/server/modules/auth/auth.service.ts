import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Profile } from 'passport-spotify';
import { AuthInfo, ProfileJson } from '../../types/passport-spotify';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  login(user: Profile) {
    const payload = {
      name: user.username,
      sub: user.id,
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(profile: Profile, authInfo: AuthInfo): Promise<User> {
    const { accessToken, refreshToken, expires_in } = authInfo;
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      external_urls,
      followers,
      images,
      ...profileJson
    } = profile._json as ProfileJson;

    const imagesUrl = images.map((object) => object.url);

    const userData: CreateUserDto = {
      external_url: external_urls.spotify,
      followers: followers.total,
      images: imagesUrl,
      accessToken,
      refreshToken,
      expiresAt,
      ...profileJson,
    };

    return this.userService.create(userData);
  }
}
