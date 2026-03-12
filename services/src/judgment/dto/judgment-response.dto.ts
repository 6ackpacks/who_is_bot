export class JudgmentResponseDto {
  id: string;
  userId: string;
  contentId: string;
  userChoice: string;
  isCorrect: boolean;
  guestId?: string;
  createdAt: Date;
  content?: {
    id: string;
    title: string;
    type: string;
    url?: string;
  };
}

export class JudgmentListResponseDto {
  data: JudgmentResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class JudgmentStatsDto {
  totalVotes: number;
  aiVotes: number;
  humanVotes: number;
  correctVotes: number;
  aiPercentage: number;
  humanPercentage: number;
  correctPercentage: number;
}

export class SubmitJudgmentResponseDto {
  success: boolean;
  message: string;
  code?: string;
  stats?: JudgmentStatsDto;
}
