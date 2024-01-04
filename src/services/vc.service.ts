import { Injectable } from '@nestjs/common';
import { IssueDto } from '../dto/vc.dto';

@Injectable()
export class VCService {
  async issue(issueDto: IssueDto): Promise<IssueDto> {

    issueDto.vc = JSON.stringify({'hello': 'world'});

    return issueDto;
  }
}