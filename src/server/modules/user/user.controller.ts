import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';

@Controller({
  path: 'api/user',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getCurrentUser(@Request() req) {
    return await this.userService.getCurrentUser(req.user.name);
  }
}
