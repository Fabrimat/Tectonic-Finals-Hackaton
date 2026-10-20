import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class ListCatalogueDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Matches(/^[a-z0-9-]+$/)
  ecosystem?: string;
}
