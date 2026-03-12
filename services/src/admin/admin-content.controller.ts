import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AdminContentService } from './admin-content.service';
import { AdminGuard } from './guards/admin.guard';
import { QueryContentDto } from './dto/query-content.dto';
import { CreateContentDto } from '../content/dto/create-content.dto';
import { UpdateContentStatsDto } from './dto/update-content-stats.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { BatchDeleteDto } from './dto/batch-delete.dto';

@Controller('admin/content')
@UseGuards(AdminGuard)
export class AdminContentController {
  private readonly logger = new Logger(AdminContentController.name);

  constructor(private readonly adminContentService: AdminContentService) {}

  @Get()
  async findAll(@Query() query: QueryContentDto) {
    try {
      return await this.adminContentService.findAll(query);
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw new HttpException(
        error.message || 'Failed to fetch content list',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.adminContentService.findOne(id);
    } catch (error) {
      this.logger.error(`Error in findOne for id ${id}:`, error);
      throw new HttpException(
        error.message || 'Failed to fetch content',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createContentDto: CreateContentDto) {
    try {
      return await this.adminContentService.create(createContentDto);
    } catch (error) {
      this.logger.error('Error in create:', error);
      throw new HttpException(
        error.message || 'Failed to create content',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateContentDto: Partial<CreateContentDto>) {
    try {
      return await this.adminContentService.update(id, updateContentDto);
    } catch (error) {
      this.logger.error(`Error in update for id ${id}:`, error);
      throw new HttpException(
        error.message || 'Failed to update content',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto) {
    try {
      return await this.adminContentService.patch(id, updateContentDto);
    } catch (error) {
      this.logger.error(`Error in patch for id ${id}:`, error);
      throw new HttpException(
        error.message || 'Failed to patch content',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.adminContentService.remove(id);
    } catch (error) {
      this.logger.error(`Error in remove for id ${id}:`, error);
      throw new HttpException(
        error.message || 'Failed to delete content',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('batch-delete')
  async batchDelete(@Body() batchDeleteDto: BatchDeleteDto) {
    try {
      return await this.adminContentService.batchDelete(batchDeleteDto.ids);
    } catch (error) {
      this.logger.error('Error in batchDelete:', error);
      throw new HttpException(
        error.message || 'Failed to batch delete content',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/stats')
  async updateStats(@Param('id') id: string, @Body() updateStatsDto: UpdateContentStatsDto) {
    try {
      return await this.adminContentService.updateStats(id, updateStatsDto);
    } catch (error) {
      this.logger.error(`Error in updateStats for id ${id}:`, error);
      throw new HttpException(
        error.message || 'Failed to update content stats',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
