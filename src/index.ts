import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';

import { S3, PutObjectCommand } from '@aws-sdk/client-s3'; // Import PutObjectCommand from the correct package
import dotenv from 'dotenv';
import { log } from 'console';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure AWS S3
const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    const file = req.file;
    
    

    if (!file) {
         res.status(400).send('No file uploaded.');
         return 
    }

    const params = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    console.log('params indooo?', params);

    try {
        const command = new PutObjectCommand(params);
        const data = await s3.send(command);
        console.log('data: ',data);

        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.originalname}`;
         console.log('Urllll: ', fileUrl);
         
         res.status(200).send({ message: 'File uploaded successfully', data });
         return
    } catch (err) {
         res.status(500).send(err);
         return
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
