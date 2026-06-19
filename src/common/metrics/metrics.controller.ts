import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@Controller(process.env.METRICS_PATH?.replace(/^\\//, '') ?? 'metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  async metricsEndpoint(@Res() res: Response): Promise<void> {
    const body = await this.metrics.getMetrics();
    res.setHeader('Content-Type', this.metrics.getContentType());
    res.send(body);
  }
}
