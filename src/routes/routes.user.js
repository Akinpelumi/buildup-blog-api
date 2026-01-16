import multer from "multer";
import { Router } from "express";
import * as userController from '../controllers/controllers.user.js';

const router = Router();

// save on server using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'mediaUpload/'),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// save on memory using multer
const memoryStorage = multer.memoryStorage()
const memoryUpload = multer({ storage: memoryStorage });

router.use('/upload/express-upload', userController.expressFileUploadSingleFile);
router.use('/upload/multer/single', 
    upload.single('media'), 
    userController.multerFileUploadSingleFile
);
router.use('/upload/multer/multiple', 
    upload.array('media', 12),
    userController.multerFileUploadMultipleFiles
);
router.use('/upload/multer/memory-single',
    memoryUpload.single('media'),
    userController.multerFileUploadMemorySingleFile
);

export default router;