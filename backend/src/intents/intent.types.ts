import { CreateIntentDto } from './dto/create-intent.dto';

export interface Intent extends CreateIntentDto {
  reference: string;
  status: 'new';
  createdAt: string;
}
