import { Injectable } from '@nestjs/common';
import { IssueDto } from '../dto/vc.dto';
import { ServiceResp } from '../dto/response.dto';
import { issue as issueVC } from '../utils/vc';
import { MyLogger } from '../utils/mylogger';
const logger = new MyLogger();

@Injectable()
export class VCService {
  async issue(issueDto: IssueDto): Promise<ServiceResp> {
    const serviceResp = new ServiceResp();
    try {
      const vc = await issueVC(issueDto.receiver, issueDto.ctypeHash, issueDto.params);
      issueDto.vc = vc;
    } catch (err) {
      logger.error('VCService issue failed', issueDto, err.message);
      serviceResp.succeed = false;
      serviceResp.msg = err.message;
    }

    return serviceResp;
  }
}