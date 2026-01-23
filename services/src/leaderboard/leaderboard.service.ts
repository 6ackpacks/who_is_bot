import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leaderboard } from './leaderboard.entity';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Leaderboard)
    private leaderboardRepository: Repository<Leaderboard>,
  ) {}

  async findAll(): Promise<Leaderboard[]> {
    return this.leaderboardRepository.find({
      order: { deceptionRate: 'DESC' },
    });
  }

  async findByType(type: string): Promise<Leaderboard[]> {
    return this.leaderboardRepository.find({
      where: { type },
      order: { deceptionRate: 'DESC' },
    });
  }

  async create(createLeaderboardDto: CreateLeaderboardDto): Promise<Leaderboard> {
    const leaderboard = this.leaderboardRepository.create(createLeaderboardDto);
    return this.leaderboardRepository.save(leaderboard);
  }
}
