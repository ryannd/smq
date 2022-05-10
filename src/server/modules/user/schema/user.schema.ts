import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  country: string;

  @Prop()
  display_name: string;

  @Prop()
  email: string;

  @Prop()
  external_url: string;

  @Prop()
  followers: number;

  @Prop()
  href: string;

  @Prop({ unique: true, required: true })
  id: string;

  @Prop()
  images: string[];

  @Prop()
  product: string;

  @Prop()
  type: string;

  @Prop()
  uri: string;

  @Prop()
  refreshToken: string;

  @Prop()
  accessToken: string;

  @Prop({ type: Date })
  expiresAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
