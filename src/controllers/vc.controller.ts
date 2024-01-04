import { Controller, Post, Body, Res, Inject } from '@nestjs/common';
import { Response } from 'express';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { VCService } from '../services/vc.service';
import { IssueDto } from '../dto/vc.dto';
import { ResponseData } from '../dto/response.dto';
import { MyLogger } from '../utils/mylogger';
const logger = new MyLogger();


@Controller('vc')
export class VCController {

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache, private readonly vcService: VCService) { }

  @Post('/issue')
  async issue(@Body() issueDto: IssueDto): Promise<ResponseData> {
    let respData = new ResponseData();

    const {receiver, params} = issueDto;
    // 验证
    await this.vcService.issue(issueDto);
    respData.data = issueDto;

    logger.debug('/vc/issue', respData);
    return respData;
  }
}