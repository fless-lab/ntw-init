/* eslint-disable no-var */
import { LoggerService } from '@nodesandbox/logger';
import { AsyncStorageService } from '@nodesandbox/async-storage';
import { Config } from 'core/config';
import Redis from 'ioredis';
import { Application } from 'express';
import { Client as MinioClient } from 'minio';

declare global {
  var CONFIG: Config;
  var LOGGER: LoggerService;
  var ASYNC_STORAGE: AsyncStorageService;
  var REDIS: Redis;
  var APP: Application;
  var MONGO_CLIENT: Connection;
  var MINIO: MinioClient;
}

export {};
