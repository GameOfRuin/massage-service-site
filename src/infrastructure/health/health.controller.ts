import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  HealthIndicatorFunction
} from '@nestjs/terminus'
import { AppHealthCheckException } from '@common/exception'

type HealthCheckError = {
  response?: unknown
  message?: string
}

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
      const healthErrorMessage = this.getHealthErrorMessage(error)

      throw new AppHealthCheckException({ message: healthErrorMessage })
    })
  }

  private getHealthErrorMessage(error: unknown): string {
    const normalizedError = error as HealthCheckError | undefined

    if (typeof normalizedError?.response === 'string' && normalizedError.response.trim()) {
      return normalizedError.response
    }

    if (normalizedError?.response && typeof normalizedError.response === 'object') {
      return JSON.stringify(normalizedError.response)
    }

    if (typeof normalizedError?.message === 'string' && normalizedError.message.trim()) {
      return normalizedError.message
    }

    return 'Health check failed'
  }
}
