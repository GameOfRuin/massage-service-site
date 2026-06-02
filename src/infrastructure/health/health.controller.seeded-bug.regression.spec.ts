import {
  HealthCheckService,
  TypeOrmHealthIndicator
} from '@nestjs/terminus'
import { AppHealthCheckException } from '@common/exception'

import { HealthController } from './health.controller'

describe('HealthController seeded bug regression', () => {
  let controller: HealthController
  let healthCheckService: { check: jest.Mock }

  beforeEach(() => {
    healthCheckService = {
      check: jest.fn()
    }

    controller = new HealthController(
      healthCheckService as unknown as HealthCheckService,
      { pingCheck: jest.fn() } as unknown as TypeOrmHealthIndicator
    )
  })

  it('uses Error.message when response field is missing', async () => {
    healthCheckService.check.mockRejectedValue(new Error('postgres timeout'))

    try {
      await controller.check()
      throw new Error('Expected controller.check() to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(AppHealthCheckException)
      expect(error).toMatchObject({
        status: 503,
        message: 'postgres timeout'
      })
    }
  })
})
