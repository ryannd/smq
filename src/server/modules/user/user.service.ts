import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SpotifyService } from '../spotify/spotify.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private spotifyClient: SpotifyService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { id } = createUserDto;

    const user = await this.userModel.findOne({
      id,
    });

    if (user) {
      console.log('User found.');
      return this.userModel.findOneAndUpdate({ id }, createUserDto);
    }

    const newUser = new this.userModel(createUserDto);
    await newUser.save();
    return newUser;
  }

  async setSpotifyUserToken(id: string): Promise<void> {
    const user = await this.userModel.findOne({
      id,
    });
    const reqTime = new Date();
    if (user) {
      const { accessToken, refreshToken, expiresAt } = user;

      if (reqTime <= expiresAt) {
        console.log('Token still valid.');
        this.spotifyClient.setAccessToken(accessToken);
      } else {
        console.log('Tokens expired. Refreshing...');
        this.spotifyClient.setRefreshToken(refreshToken);

        const newAccessToken = await this.spotifyClient
          .refreshAccessToken()
          .then((data) => {
            this.spotifyClient.setAccessToken(data.body.access_token);
            return data.body.access_token;
          });

        await this.userModel.findOneAndUpdate(
          { id },
          { accessToken: newAccessToken },
        );
      }
    } else {
      throw new HttpException('User does not exist.', HttpStatus.BAD_REQUEST);
    }
  }

  async getCurrentUser(userId: string) {
    await this.setSpotifyUserToken(userId);
    return await this.spotifyClient.getMe();
  }
}
