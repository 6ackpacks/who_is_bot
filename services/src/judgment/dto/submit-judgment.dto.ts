export class SubmitJudgmentDto {
  contentId: string;
  userChoice: 'ai' | 'human';
  isCorrect: boolean;
  userId?: string;
  guestId?: string;
}
