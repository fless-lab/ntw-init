import { Router } from 'express';
import multer from 'multer';
import { FileController } from '../controllers';

const router = Router();

const upload = multer();

router.post('/', upload.single('file'), FileController.createFile);

router.get('/:fileId', FileController.getFileById);

router.get('/:fileId/download', FileController.downloadFile);

router.delete('/:fileId', FileController.deleteFile);

export default router;
