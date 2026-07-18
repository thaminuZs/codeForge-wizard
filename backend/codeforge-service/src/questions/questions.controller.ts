import { Body, Controller, Post } from '@nestjs/common';
import { PostQuestionDto } from './dtos/post-question.dto';
import { QuestionsService } from './providors/questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  public postQuestion(@Body() postQuestionDto: PostQuestionDto) {
    this.questionsService.createQuestion(postQuestionDto);
  }
}
