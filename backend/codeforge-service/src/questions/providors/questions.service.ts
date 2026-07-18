import { Injectable } from '@nestjs/common';
import { PostQuestionDto } from '../dtos/post-question.dto';

@Injectable()
export class QuestionsService {
  public createQuestion(postQuestionDto: PostQuestionDto) {
    console.log(postQuestionDto);
  }
}
