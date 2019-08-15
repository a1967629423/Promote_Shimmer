import * as fs from 'fs';
import * as path from 'path';
import { Service } from 'typedi';

@Service()
export class ConfigService {
  private configs: any
  public config: any

  constructor() {
    if (process.env['CONFIG_FILE']) {
      this.configs = this.loadConfig(process.env['CONFIG_FILE']!)
    } else if (fs.existsSync(path.join(__dirname, '..', '..', 'config.js'))) {
      this.configs = this.loadConfig(path.join(__dirname, '..', '..', 'config.js'))
    } else if (fs.existsSync(path.join(__dirname, '..', '..', 'config.default.js'))) {
      this.configs = this.loadConfig(path.join(__dirname, '..', '..', 'config.default.js'))
    } else {
      this.configs = {};
    }

    this.config = this.configs;
  }

  loadConfig(fileName: string) {
    return require(fileName);
  }
}
