import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
}
