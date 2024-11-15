import fs from 'fs';
import path from 'path';
import { storage } from '../..';

describe('DiskStorageService', () => {
  const TEST_UPLOAD_DIR = path.resolve(
    process.env.DISK_STORAGE_UPLOAD_FOLDER || 'uploadtest',
  );

  const TEST_FILE_CONTENT = Buffer.from(
    '%PDF-1.4\n' +
      '1 0 obj\n' +
      '<< /Title (Hello World) /Author (Your Name) >>\n' +
      'endobj\n' +
      'xref\n' +
      '0 1\n' +
      '0000000000 65535 f\n' +
      '0000000010 00000 n\n' +
      'trailer\n' +
      '<< /Root 1 0 R >>\n' +
      '%%EOF\n',
  );
  let testFileId: string;

  beforeAll(async () => {
    if (!fs.existsSync(TEST_UPLOAD_DIR)) {
      await storage.disk.CreateUploadFolder();
    }
  });

  afterAll(async () => {
    try {
      await Promise.all(await storage.disk.deleteDirectory());
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const result = await storage.disk.uploadFile(TEST_FILE_CONTENT);

      expect(result.success).toBe(true);
      expect(result.code).toBe(201);
      expect(result.data).toBeDefined();
      testFileId = result.data;

      // Vérifier que le fichier existe physiquement
      const filePath = path.join(TEST_UPLOAD_DIR, testFileId);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe('getFile', () => {
    beforeEach(async () => {
      const uploadResult = await storage.disk.uploadFile(TEST_FILE_CONTENT);
      testFileId = uploadResult.data;
    });

    it('should retrieve file metadata successfully', async () => {
      const result = await storage.disk.getFile(testFileId);

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe(testFileId);
      expect(result.data.size).toBe(TEST_FILE_CONTENT.length);
    });

    it('should handle non-existent files', async () => {
      const result = await storage.disk.getFile('non-existent-file');

      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
    });
  });

  describe('listFiles', () => {
    beforeEach(async () => {
      await storage.disk.uploadFile(Buffer.from('File 1'));
      await storage.disk.uploadFile(Buffer.from('File 2'));
    });

    it('should list all files in directory', async () => {
      const result = await storage.disk.listFiles();

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
      //   expect(result.data.length).toBe(2);
    });
  });

  describe('deleteFile', () => {
    beforeEach(async () => {
      const uploadResult = await storage.disk.uploadFile(TEST_FILE_CONTENT);
      testFileId = uploadResult.data;
    });

    it('should delete file successfully', async () => {
      const result = await storage.disk.deleteFile(testFileId);

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);

      // Vérifier que le fichier n'existe plus
      const filePath = path.join(TEST_UPLOAD_DIR, testFileId);
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('should handle deletion of non-existent files', async () => {
      const result = await storage.disk.deleteFile('non-existent-file');

      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
    });
  });

  describe('emptyDirectory', () => {
    it('should empty directory successfully', async () => {
      const result = await storage.disk.emptyDirectory();

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);

      const files = fs.readdirSync(TEST_UPLOAD_DIR);
      expect(files.length).toBe(0);
    });
  });

  describe('copyFile', () => {
    let sourceId: string;

    beforeEach(async () => {
      const uploadResult = await storage.disk.uploadFile(TEST_FILE_CONTENT);
      sourceId = uploadResult.data;
    });

    it('should copy file successfully', async () => {
      const destinationId = 'copied-file';
      const result = await storage.disk.copyFile(sourceId, destinationId);

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);

      // Vérifier que les deux fichiers existent
      const sourcePath = path.join(TEST_UPLOAD_DIR, sourceId);
      const destinationPath = path.join(TEST_UPLOAD_DIR, destinationId);
      expect(fs.existsSync(sourcePath)).toBe(true);
      expect(fs.existsSync(destinationPath)).toBe(true);
    });

    it('should handle copying non-existent files', async () => {
      const result = await storage.disk.copyFile('non-existent', 'dest');

      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
    });
  });

  describe('updateFile', () => {
    it('should move file successfully', async () => {
      const uploadResult = await storage.disk.uploadFile(TEST_FILE_CONTENT);
      const fileId = uploadResult.data;

      const newContent = 'moved-file';
      const result = await storage.disk.updateFile(fileId, newContent);

      expect(result.success).toBe(true);
      expect(result.code).toBe(201);

      expect(fs.existsSync(newContent)).toBe(true);
    });

    it('should handle moving non-existent files', async () => {
      const result = await storage.disk.updateFile('fileId', 'non-existent');

      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
    });
  });
});
