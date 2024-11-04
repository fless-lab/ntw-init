import { ItemBucketMetadata } from 'minio';

export interface FileStats {
  size: number;
  lastModified: Date;
  contentType: string;
  metadata?: ItemBucketMetadata;
}

export interface BucketPolicy {
  Version: string;
  Statement: Array<{
    Effect: 'Allow' | 'Deny';
    Principal: { AWS: string[] };
    Action: string[];
    Resource: string[];
  }>;
}
