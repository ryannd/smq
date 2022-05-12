import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TracksService } from './tracks.service';

@Controller({
  path: 'api/tracks',
})
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @UseGuards(JwtAuthGuard)
  @Get('top')
  async getUserTopTracks(@Request() req) {
    return await this.tracksService.getUserTopTracks(req.user.name);
  }
}
