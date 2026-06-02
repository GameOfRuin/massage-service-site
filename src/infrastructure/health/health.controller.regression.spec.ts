import {
  HealthCheckService,
  TypeOrmHealthIndicator
} from '@nestjs/terminus'
import { AppHealthCheckException } from '@common/exception'

import { HealthController } from './health.controller'

describe('HealthController regression (seeded bug)', () => {
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

  it('preserves upstream health error payload in AppHealthCheckException message', async () => {
    const seededErrorPayload = {
      status: 'error',
      info: { postgresql: { status: 'down' } }
    }

    healthCheckService.check.mockRejectedValue({
      response: seededErrorPayload
    })

    try {
      await controller.check()
      throw new Error('Expected controller.check() to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(AppHealthCheckException)
      expect(error).toMatchObject({
        status: 503,
        message: seededErrorPayload
      })
    }
  })
})
