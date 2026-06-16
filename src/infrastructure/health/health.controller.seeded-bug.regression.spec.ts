import {
  HealthCheckService,
  TypeOrmHealthIndicator
} from '@nestjs/terminus'
import { AppHealthCheckException } from '@common/exception'

import { HealthController } from './health.controller'

/**
 * Mirrors pre-fix catch body in HealthController.check():
 *   throw new AppHealthCheckException({ message: error.response })
 */
function mapHealthErrorMessageLegacy(error: Error & { response?: unknown }): unknown {
  return error.response
}

describe('HealthController seeded bug regression', () => {
  const plainHealthCheckError = new Error('postgres timeout')

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

  it('reproduces seeded bug: legacy mapper drops message when response is absent', () => {
    expect(mapHealthErrorMessageLegacy(plainHealthCheckError)).toBeUndefined()
    expect(plainHealthCheckError.message).toBe('postgres timeout')
  })

  it('fixed GET /health maps plain Error to 503 with error.message text', async () => {
    healthCheckService.check.mockRejectedValue(plainHealthCheckError)

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
