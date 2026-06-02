import {
  HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator
} from '@nestjs/terminus'
import { AppHealthCheckException } from '@common/exception'

import { HealthController } from './health.controller'

describe('HealthController smoke', () => {
  let controller: HealthController
  let healthCheckService: { check: jest.Mock }
  let typeOrmHealthIndicator: { pingCheck: jest.Mock }

  beforeEach(() => {
    healthCheckService = {
      check: jest.fn()
    }
    typeOrmHealthIndicator = {
      pingCheck: jest.fn()
    }

    controller = new HealthController(
      healthCheckService as unknown as HealthCheckService,
      typeOrmHealthIndicator as unknown as TypeOrmHealthIndicator
    )
  })

  it('returns healthy response and checks postgres', async () => {
    typeOrmHealthIndicator.pingCheck.mockResolvedValue({
      postgresql: { status: 'up' }
    })
    healthCheckService.check.mockImplementation(async indicators => {
      await Promise.all(indicators.map(indicator => indicator()))

      return { status: 'ok' } as HealthCheckResult
    })

    await expect(controller.check()).resolves.toEqual({ status: 'ok' })
    expect(typeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith('postgresql')
  })

  it('throws AppHealthCheckException on health check failure', async () => {
    healthCheckService.check.mockRejectedValue({
      response: 'postgres unavailable'
    })

    try {
      await controller.check()
      throw new Error('Expected controller.check() to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(AppHealthCheckException)
      expect(error).toMatchObject({
        status: 503
      })
    }
  })
})
