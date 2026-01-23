import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('uid/:uid')
  findByUid(@Param('uid') uid: string) {
    return this.userService.findByUid(uid);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Patch(':id/stats')
  updateStats(
    @Param('id') id: string,
    @Body() body: { accuracy: number; totalJudged: number; streak: number },
  ) {
    return this.userService.updateStats(id, body.accuracy, body.totalJudged, body.streak);
  }
}
