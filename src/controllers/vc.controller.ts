import { Controller, Post, Body, Res, Inject } from '@nestjs/common';
import { Response } from 'express';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { VCService } from '../services/vc.service';
import { IssueDto } from '../dto/vc.dto';
import { ResponseData, FailedResponse } from '../dto/response.dto';
import { MyLogger } from '../utils/mylogger';
const logger = new MyLogger();


@Controller('vc')
export class VCController {

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache, private readonly vcService: VCService) { }

  @Post('/issue')
  async issue(@Body() issueDto: IssueDto): Promise<ResponseData> {

    const { receiver, params } = issueDto;
    if (!receiver || !params) {
      const resp = new FailedResponse();
      resp.msg = resp.msg || "Invalid paramaters";
      return resp;
    }

    issueDto.ctypeHash = '0x0706df1798e0c59ab3190b948e173b0081105fbf937d2d520b548a9575754d06';// TODO: 暂时固定一个

    // 验证
    const serviceResp = await this.vcService.issue(issueDto);
    if (!serviceResp.succeed) {
      const resp = new FailedResponse();
      resp.msg = serviceResp.msg || "Issue vc failed";
      return resp;
    }

    let respData = new ResponseData();
    respData.data = issueDto;

    logger.debug('/vc/issue', respData);
    return respData;
  }
}