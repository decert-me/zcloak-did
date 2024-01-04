import { Injectable } from '@nestjs/common';
import { IssueDto } from '../dto/vc.dto';
import { issue as issueVC } from '../utils/vc';

@Injectable()
export class VCService {
  async issue(issueDto: IssueDto): Promise<IssueDto> {
    const ctypeHash = '0x0706df1798e0c59ab3190b948e173b0081105fbf937d2d520b548a9575754d06';
    // TODO: issueDto.params 校验
    const vc = await issueVC(issueDto.receiver, ctypeHash, issueDto.params);
    issueDto.vc = vc;

    return issueDto;
  }
}