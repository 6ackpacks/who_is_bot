import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  findAll(@Query('type') type?: string) {
    if (type) {
      return this.leaderboardService.findByType(type);
    }
    return this.leaderboardService.findAll();
  }

  @Post()
  create(@Body() createLeaderboardDto: CreateLeaderboardDto) {
    return this.leaderboardService.create(createLeaderboardDto);
  }
}
