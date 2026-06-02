import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  HealthIndicatorFunction
} from '@nestjs/terminus'
import { AppHealthCheckException } from '@common/exception'

@ApiTags('System')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    operationId: 'healthCheck',
    summary: 'Health check'
  })
  check() {
    const modules: HealthIndicatorFunction[] = []

    modules.push(() => this.db.pingCheck('postgresql'))

    return this.health.check(modules).catch(error => {
      const healthErrorMessage =
        error?.response ??
        error?.message ??
        'Health check failed'

      throw new AppHealthCheckException({ message: healthErrorMessage })
    })
  }
}
