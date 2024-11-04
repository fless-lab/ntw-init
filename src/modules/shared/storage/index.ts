import { DiskStorageService } from './disk';
import { MinioStorageService } from './minio';

class StorageModule {
  public disk: DiskStorageService;
  public minio: MinioStorageService;

  constructor() {
    this.disk = new DiskStorageService();
    this.minio = new MinioStorageService();
  }
}

export const Storage = new StorageModule();
