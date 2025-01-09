import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  runningProd: boolean;
  app: string;
  port: number;
  clientAuth: {
    enableClientAuth: boolean;
    basicAuthUser: string;
    basicAuthPass: string;
    identifier: string;
  };
  jwt: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpireTime: string;
    refreshTokenExpireTime: string;
    tokenIssuer: string;
  };
  rate: {
    limit: number;
    max: number;
  };
  bruteForce: {
    freeRetries: number;
    minWait: number;
    maxWait: number;
    lifetime: number;
  };
  db: {
    host: string;
    port: number;
    name: string;
    clientPort: number;
    directUrl?: string;
    credentials?: {
      username?: string;
      password?: string;
      authSource?: string;
    };
    options?: {
      replicaSet?: string;
      maxPoolSize?: number;
      minPoolSize?: number;
      serverSelectionTimeoutMS?: number;
      socketTimeoutMS?: number;
      retryWrites?: boolean;
      writeConcern?: {
        w?: number | 'majority';
        wtimeout?: number;
      };
    };
    test?: {
      host: string;
      port: number;
      name: string;
      credentials?: {
        username?: string;
        password?: string;
      };
    };
  };
  redis: {
    host: string;
    port: number;
    serverPort: number;
    tokenExpireTime: number;
    blacklistExpireTime: number;
  };
  minio: {
    host: string;
    accessKey: string;
    secretKey: string;
    apiPort: number;
    consolePort: number;
    useSSL: boolean;
  };
  mail: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    fromName: string;
    templates: {
      path: string;
      cache: boolean;
    };
  };
  bcrypt: {
    saltRounds: number;
  };
  session: {
    secret: string;
  };
  viewEngines: string[];
  defaultViewEngine: string;
  otp: {
    length: number;
    expiration: number;
    purposes: Record<
      string,
      { code: string; title: string; description: string; message: string }
    >;
  };
}

export class ConfigService {
  private static instance: ConfigService;
  private config: Config;

  private constructor() {
    this.config = {
      runningProd: process.env.NODE_ENV === 'production',
      app: process.env.APP_NAME || 'myapp',
      port: parseInt(process.env.PORT || '5095', 10),
      clientAuth: {
        enableClientAuth: process.env.ENABLE_CLIENT_AUTH === 'true',
        basicAuthUser: process.env.BASIC_AUTH_USER || 'admin',
        basicAuthPass: process.env.BASIC_AUTH_PASS || 'secret',
        identifier: process.env.CLIENT_TOKEN_IDENTIFIER || 'x-client-token',
      },
      jwt: {
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || '',
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || '',
        accessTokenExpireTime: process.env.ACCESS_TOKEN_EXPIRE_TIME || '1h',
        refreshTokenExpireTime: process.env.REFRESH_TOKEN_EXPIRE_TIME || '7d',
        tokenIssuer: process.env.TOKEN_ISSUER || 'your-issuer',
      },
      rate: {
        limit: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes in milliseconds
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      },
      bruteForce: {
        freeRetries: parseInt(process.env.BRUTE_FORCE_FREE_RETRIES || '5', 10),
        minWait: parseInt(process.env.BRUTE_FORCE_MIN_WAIT || '300000', 10), // 5 minutes
        maxWait: parseInt(process.env.BRUTE_FORCE_MAX_WAIT || '3600000', 10), // 1 hour
        lifetime: parseInt(process.env.BRUTE_FORCE_LIFETIME || '86400', 10), // 1 day in seconds
      },
      db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '27017', 10),
        name: process.env.DB_NAME || 'mydatabase',
        clientPort: parseInt(process.env.DB_CLIENT_PORT || '5005', 10),
        directUrl: process.env.DB_DIRECT_URL,
        credentials: {
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          authSource: process.env.DB_AUTH_SOURCE,
        },
        options: {
          replicaSet: process.env.DB_REPLICA_SET,
          maxPoolSize: process.env.DB_MAX_POOL_SIZE
            ? parseInt(process.env.DB_MAX_POOL_SIZE, 10)
            : undefined,
          minPoolSize: process.env.DB_MIN_POOL_SIZE
            ? parseInt(process.env.DB_MIN_POOL_SIZE, 10)
            : undefined,
          serverSelectionTimeoutMS: process.env.DB_CONNECTION_TIMEOUT_MS
            ? parseInt(process.env.DB_CONNECTION_TIMEOUT_MS, 10)
            : undefined,
          socketTimeoutMS: process.env.DB_SOCKET_TIMEOUT_MS
            ? parseInt(process.env.DB_SOCKET_TIMEOUT_MS, 10)
            : undefined,
          retryWrites: process.env.DB_RETRY_WRITES === 'true',
          writeConcern: {
            w:
              process.env.DB_WRITE_CONCERN === 'majority'
                ? 'majority'
                : process.env.DB_WRITE_CONCERN
                  ? parseInt(process.env.DB_WRITE_CONCERN, 10)
                  : 'majority',
            wtimeout: process.env.DB_W_TIMEOUT_MS
              ? parseInt(process.env.DB_W_TIMEOUT_MS, 10)
              : undefined,
          },
        },
        test: {
          host: process.env.TEST_DB_HOST || 'localhost',
          port: parseInt(process.env.TEST_DB_PORT || '27017', 10),
          name: process.env.TEST_DB_NAME || 'test-db',
          credentials: {
            username: process.env.TEST_DB_USERNAME,
            password: process.env.TEST_DB_PASSWORD,
          },
        },
      },
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        serverPort: parseInt(process.env.REDIS_EXT_PORT || '5079', 10),
        tokenExpireTime: parseInt(
          process.env.REDIS_TOKEN_EXPIRE_TIME || '31536000',
          10,
        ),
        blacklistExpireTime: parseInt(
          process.env.REDIS_BLACKLIST_EXPIRE_TIME || '2592000',
          10,
        ),
      },
      minio: {
        host: process.env.MINIO_HOST || 'localhost',
        accessKey: process.env.MINIO_ACCESS_KEY || 'minio-access-key',
        secretKey: process.env.MINIO_SECRET_KEY || 'minio-secret-key',
        apiPort: parseInt(process.env.MINIO_API_PORT || '9000', 10),
        consolePort: parseInt(process.env.MINIO_EXT_CONSOLE_PORT || '5050', 10),
        useSSL: process.env.MINIO_USE_SSL === 'true',
      },
      mail: {
        host:
          process.env.NODE_ENV === 'production'
            ? process.env.SMTP_HOST || ''
            : process.env.MAILDEV_HOST || 'localhost',
        port: parseInt(
          process.env.NODE_ENV === 'production'
            ? process.env.SMTP_PORT || '587'
            : process.env.MAILDEV_PORT || '1025',
          10,
        ),
        user:
          process.env.NODE_ENV === 'production'
            ? process.env.SMTP_USER || ''
            : '',
        pass:
          process.env.NODE_ENV === 'production'
            ? process.env.SMTP_PASS || ''
            : '',
        from: process.env.FROM_EMAIL || 'no-reply@myapp.com',
        fromName: process.env.FROM_NAME || 'Your Service Name',
        templates: {
          path: process.env.MAIL_TEMPLATES_PATH || 'views',
          cache: process.env.NODE_ENV === 'production',
        },
      },
      bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
      },
      session: {
        secret: process.env.SESSION_SECRET || 'your-session-secret',
      },
      viewEngines: ['ejs', 'pug', 'handlebars', 'nunjucks'], // Supported view engines
      defaultViewEngine: process.env.VIEW_ENGINE || 'ejs',
      otp: {
        length: parseInt(process.env.OTP_LENGTH || '6', 10),
        expiration: parseInt(process.env.OTP_EXPIRATION || '5') * 60 * 1000,
        purposes: {
          ACCOUNT_VERIFICATION: {
            code: 'ACCOUNT_VERIFICATION',
            title: 'Account Verification OTP',
            description: 'Verify your account',
            message: 'Your OTP code for account verification is:',
          },
          FORGOT_PASSWORD: {
            code: 'FORGOT_PASSWORD',
            title: 'Password Reset OTP',
            description: 'Reset your password',
            message: 'Your OTP code for resetting your password is:',
          },
          TWO_FACTOR_AUTHENTICATION: {
            code: 'TWO_FACTOR_AUTHENTICATION',
            title: 'Two-Factor Authentication OTP',
            description: 'Two-factor authentication',
            message: 'Your OTP code for two-factor authentication is:',
          },
          EMAIL_UPDATE: {
            code: 'EMAIL_UPDATE',
            title: 'Email Update OTP',
            description: 'Update your email address',
            message: 'Your OTP code for updating your email address is:',
          },
          PHONE_VERIFICATION: {
            code: 'PHONE_VERIFICATION',
            title: 'Phone Verification OTP',
            description: 'Verify your phone number',
            message: 'Your OTP code for phone verification is:',
          },
          TRANSACTION_CONFIRMATION: {
            code: 'TRANSACTION_CONFIRMATION',
            title: 'Transaction Confirmation OTP',
            description: 'Confirm your transaction',
            message: 'Your OTP code for transaction confirmation is:',
          },
          ACCOUNT_RECOVERY: {
            code: 'ACCOUNT_RECOVERY',
            title: 'Account Recovery OTP',
            description: 'Recover your account',
            message: 'Your OTP code for account recovery is:',
          },
          CHANGE_SECURITY_SETTINGS: {
            code: 'CHANGE_SECURITY_SETTINGS',
            title: 'Security Settings Change OTP',
            description: 'Change your security settings',
            message: 'Your OTP code for changing security settings is:',
          },
          LOGIN_CONFIRMATION: {
            code: 'LOGIN_CONFIRMATION',
            title: 'Login Confirmation OTP',
            description: 'Confirm your login',
            message: 'Your OTP code for login confirmation is:',
          },
        },
      },
    };
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public getConfig(): Config {
    return this.config;
  }
}
