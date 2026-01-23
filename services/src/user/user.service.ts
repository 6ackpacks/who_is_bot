import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['contents', 'comments'],
    });
  }

  async findByUid(uid: string): Promise<User> {
    return this.userRepository.findOne({
      where: { uid },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async updateStats(id: string, accuracy: number, totalJudged: number, streak: number): Promise<User> {
    await this.userRepository.update(id, { accuracy, totalJudged, streak });
    return this.findOne(id);
  }
}
