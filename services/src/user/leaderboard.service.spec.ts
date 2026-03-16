import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardService, LeaderboardType } from './leaderboard.service';
import { User } from './user.entity';
import { Judgment } from '../judgment/judgment.entity';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let userRepository: Repository<User>;
  let judgmentRepository: Repository<Judgment>;

  const mockUsers: Partial<User>[] = [
    {
      id: 'user-1',
      nickname: 'User 1',
      avatar: 'https://example.com/avatar1.jpg',
      accuracy: 95.5,
      totalJudged: 1000,
      weeklyAccuracy: 96.0,
      weeklyJudged: 100,
      maxStreak: 50,
      totalBotsBusted: 500,
      level: 3,
    },
    {
      id: 'user-2',
      nickname: 'User 2',
      avatar: 'https://example.com/avatar2.jpg',
      accuracy: 90.0,
      totalJudged: 800,
      weeklyAccuracy: 92.0,
      weeklyJudged: 80,
      maxStreak: 40,
      totalBotsBusted: 400,
      level: 2,
    },
    {
      id: 'user-3',
      nickname: 'User 3',
      avatar: 'https://example.com/avatar3.jpg',
      accuracy: 85.0,
      totalJudged: 600,
      weeklyAccuracy: 88.0,
      weeklyJudged: 60,
      maxStreak: 30,
      totalBotsBusted: 300,
      level: 2,
    },
  ];

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
    getRawMany: jest.fn(),
    getCount: jest.fn(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Judgment),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    judgmentRepository = module.get<Repository<Judgment>>(getRepositoryToken(Judgment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLeaderboard', () => {
    it('should return global accuracy leaderboard', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockUsers, mockUsers.length]);

      const result = await service.getLeaderboard({
        type: LeaderboardType.GLOBAL_ACCURACY,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      expect(result).toBeDefined();
      expect(result.users).toHaveLength(3);
      expect(result.users[0].rank).toBe(1);
      expect(result.users[0].score).toBe(95.5);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.hasMore).toBe(false);
    });

    it('should return global judgments leaderboard', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockUsers, mockUsers.length]);

      const result = await service.getLeaderboard({
        type: LeaderboardType.GLOBAL_JUDGMENTS,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      expect(result).toBeDefined();
      expect(result.users).toHaveLength(3);
      expect(result.users[0].totalJudged).toBe(1000);
    });

    it('should return weekly accuracy leaderboard', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockUsers, mockUsers.length]);

      const result = await service.getLeaderboard({
        type: LeaderboardType.WEEKLY_ACCURACY,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      expect(result).toBeDefined();
      expect(result.users).toHaveLength(3);
      expect(result.users[0].weeklyAccuracy).toBe(96.0);
    });

    it('should support pagination', async () => {
      const totalUsers = 100;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockUsers, totalUsers]);

      const result = await service.getLeaderboard({
        type: LeaderboardType.GLOBAL_ACCURACY,
        page: 2,
        limit: 50,
        minJudgments: 5,
      });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
      expect(result.total).toBe(100);
      expect(result.hasMore).toBe(false);
      expect(result.users[0].rank).toBe(51); // 第二页从51开始
    });

    it('should use cache on subsequent calls', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockUsers, mockUsers.length]);

      // 第一次调用
      await service.getLeaderboard({
        type: LeaderboardType.GLOBAL_ACCURACY,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      // 第二次调用应该使用缓存
      await service.getLeaderboard({
        type: LeaderboardType.GLOBAL_ACCURACY,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      // 数据库查询应该只调用一次
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserRank', () => {
    it('should return user rank info', async () => {
      const mockUser = mockUsers[1] as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      mockQueryBuilder.getCount.mockResolvedValue(1); // 1个用户排在前面

      const result = await service.getUserRank('user-2', LeaderboardType.GLOBAL_ACCURACY);

      expect(result).toBeDefined();
      expect(result.userId).toBe('user-2');
      expect(result.rank).toBe(2);
      expect(result.score).toBe(90.0);
    });

    it('should return null for non-existent user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getUserRank('non-existent', LeaderboardType.GLOBAL_ACCURACY);

      expect(result).toBeNull();
    });

    it('should calculate percentile correctly', async () => {
      const mockUser = mockUsers[0] as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      mockQueryBuilder.getCount
        .mockResolvedValueOnce(0) // 0个用户排在前面
        .mockResolvedValueOnce(100); // 总共100个用户

      const result = await service.getUserRank('user-1', LeaderboardType.GLOBAL_ACCURACY);

      expect(result.rank).toBe(1);
      expect(result.total).toBe(100);
      expect(result.percentile).toBe(100); // 第1名，百分位100%
    });
  });

  describe('clearCache', () => {
    it('should clear all cache', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockUsers, mockUsers.length]);

      // 填充缓存
      await service.getLeaderboard({
        type: LeaderboardType.GLOBAL_ACCURACY,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      // 清除缓存
      service.clearAllCache();

      // 再次调用应该重新查询数据库
      await service.getLeaderboard({
        type: LeaderboardType.GLOBAL_ACCURACY,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalledTimes(2);
    });

    it('should clear cache by type', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockUsers, mockUsers.length]);

      // 填充两种类型的缓存
      await service.getLeaderboard({
        type: LeaderboardType.GLOBAL_ACCURACY,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      await service.getLeaderboard({
        type: LeaderboardType.WEEKLY_ACCURACY,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      // 清除全局准确率缓存
      service.clearCacheByType(LeaderboardType.GLOBAL_ACCURACY);

      // 全局准确率应该重新查询
      await service.getLeaderboard({
        type: LeaderboardType.GLOBAL_ACCURACY,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      // 周准确率应该使用缓存
      await service.getLeaderboard({
        type: LeaderboardType.WEEKLY_ACCURACY,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      // 全局准确率查询2次，周准确率查询1次
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalledTimes(3);
    });
  });

  describe('avatar handling', () => {
    it('should generate default avatar for invalid URLs', async () => {
      const usersWithInvalidAvatar = [
        {
          ...mockUsers[0],
          avatar: 'https://example.com/invalid.jpg',
        },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([usersWithInvalidAvatar, 1]);

      const result = await service.getLeaderboard({
        type: LeaderboardType.GLOBAL_ACCURACY,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      expect(result.users[0].avatar).toContain('dicebear.com');
    });

    it('should keep valid avatar URLs', async () => {
      const usersWithValidAvatar = [
        {
          ...mockUsers[0],
          avatar: 'https://cdn.example.com/avatar.jpg',
        },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([usersWithValidAvatar, 1]);

      const result = await service.getLeaderboard({
        type: LeaderboardType.GLOBAL_ACCURACY,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      expect(result.users[0].avatar).toBe('https://cdn.example.com/avatar.jpg');
    });
  });

  describe('score formatting', () => {
    it('should round accuracy scores to one decimal place', async () => {
      const usersWithPreciseAccuracy = [
        {
          ...mockUsers[0],
          accuracy: 95.567,
        },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([usersWithPreciseAccuracy, 1]);

      const result = await service.getLeaderboard({
        type: LeaderboardType.GLOBAL_ACCURACY,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      expect(result.users[0].accuracy).toBe(95.6);
    });

    it('should keep integer scores as integers', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockUsers, mockUsers.length]);

      const result = await service.getLeaderboard({
        type: LeaderboardType.GLOBAL_JUDGMENTS,
        page: 1,
        limit: 50,
        minJudgments: 5,
      });

      expect(result.users[0].totalJudged).toBe(1000);
      expect(Number.isInteger(result.users[0].totalJudged)).toBe(true);
    });
  });
});
