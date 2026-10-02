import { Controller, Get } from '@nestjs/common';
import * as packageJSON from '../package.json';

@Controller()
export class AppController {
  @Get('health')
  getHello(): string {
    return 'Ok';
  }

  @Get()
  getApiVersion() {
    return packageJSON.version;
  }
}
