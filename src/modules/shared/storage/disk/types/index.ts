export interface FileMetadata {
  name?: string;
  size: number;
  type: string;
  extension: string;
  hash: string;
  path: string;
  mimetype?: string;
}
