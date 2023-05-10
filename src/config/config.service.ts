import * as dotenv from 'dotenv';

export class ConfigService {
  private readonly envConfig: Record<string, string>;
  constructor() {
    const result = dotenv.config({ path: `.env` });
    if (result.error) {
      this.envConfig = process.env;
    } else {
      this.envConfig = result.parsed;
    }
  }

  public get(key: string): string {
    return this.envConfig[key];
  }

  public async getByString(key: string) {
    return this.get(key);
  }

  public async getPortConfig() {
    return this.get('APP_PORT');
  }

  public async getMongoConfig() {
    return {
      uri: this.get('MONGO_CLOUD_CONNECTION_URL'),
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  }
}
