import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class ExceptionsLoggerFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(ExceptionsLoggerFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.log(`Exception Logger thrown ${exception}`);
    super.catch(exception, host);
  }
}
