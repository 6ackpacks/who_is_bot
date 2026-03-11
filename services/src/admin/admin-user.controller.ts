import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { AdminGuard } from './guards/admin.guard';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('admin/users')
@UseGuards(AdminGuard)
export class AdminUserController {
  private readonly logger = new Logger(AdminUserController.name);

  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  async findAll(@Query() query: QueryUsersDto) {
    try {
      return await this.adminUserService.findAll(query);
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw new HttpException(
        error.message || 'Failed to fetch user list',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.adminUserService.findOne(id);
    } catch (error) {
      this.logger.error(`Error in findOne for id ${id}:`, error);
      throw new HttpException(
        error.message || 'Failed to fetch user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.adminUserService.update(id, updateUserDto);
    } catch (error) {
      this.logger.error(`Error in update for id ${id}:`, error);
      throw new HttpException(
        error.message || 'Failed to update user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.adminUserService.create(createUserDto);
    } catch (error) {
      this.logger.error('Error in create:', error);
      throw new HttpException(
        error.message || 'Failed to create user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/recalculate')
  async recalculateStats(@Param('id') id: string) {
    try {
      return await this.adminUserService.recalculateStats(id);
    } catch (error) {
      this.logger.error(`Error in recalculateStats for id ${id}:`, error);
      throw new HttpException(
        error.message || 'Failed to recalculate user stats',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
