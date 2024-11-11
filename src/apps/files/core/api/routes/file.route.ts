import { Router } from 'express';
import multer from 'multer';
import { FileController } from '../controllers';

const router = Router();

const upload = multer();

router.post('/', upload.single('file'), FileController.createFile);

router.get('/', FileController.getFilesDB);

router.get('/:fileId', FileController.getFileById);

router.delete('/:fileId', FileController.deleteFileAll);

export default router;
