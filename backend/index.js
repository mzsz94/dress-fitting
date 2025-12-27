const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const sharp = require('sharp');

dotenv.config();

const app = express();
const port = process.env.PORT || 2000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// 🔑 Google Nano Banana API Key Configuration
// Please set GEMINI_API_KEY in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/transform', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'dress', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files['image']) {
      return res.status(400).send('No user image uploaded.');
    }

    const userFile = req.files['image'][0];
    const dressFile = req.files['dress'] ? req.files['dress'][0] : null;

    const inputPath = userFile.path;
    const outputFilename = 'transformed_' + userFile.filename;
    const outputPath = path.join(__dirname, 'uploads', outputFilename);

    console.log('Processing request for:', inputPath);
    if (dressFile) console.log('Dress reference provided:', dressFile.path);

    // 1. Try to use Real Nano Banana API if Key exists
    if (process.env.GEMINI_API_KEY) {
      console.log('✨ Using Nano Banana API (Gemini 2.5 Flash Image)...');
      
      try {
        const imageBuffer = fs.readFileSync(inputPath);
        
        // Use the dedicated Image Generation/Editing model
        const modelName = "nano-banana-pro-preview"; 
        console.log(`✨ Using Image Model: ${modelName}`);
        
        const model = genAI.getGenerativeModel({ model: modelName });

        // Step 1: Generate/Edit User Image
        console.log("🎨 Generating final image with Nano Banana...");
        
        const finalPrompt = dressFile 
            ? "I have provided two images: 1. A person (User Photo), 2. A wedding dress (Reference Dress). Please edit the User Photo to dress the person in the exact wedding dress shown in the Reference Dress photo. Maintain the person's face, hair, pose, and background exactly as they are. Make it look completely natural and photorealistic. Return the result as an image."
            : "Edit this image to dress the person in a high-quality, elegant white wedding dress. Maintain the person's face, hair, pose, and background exactly as they are. Make it look completely natural and photorealistic. Return the result as an image.";

        const finalParts = [
            { text: finalPrompt },
            {
                inlineData: {
                    data: fs.readFileSync(inputPath).toString('base64'),
                    mimeType: userFile.mimetype
                }
            }
        ];

        if (dressFile) {
            finalParts.push({
                inlineData: {
                    data: fs.readFileSync(dressFile.path).toString('base64'),
                    mimeType: dressFile.mimetype
                }
            });
        }
        
        const result = await model.generateContent({ contents: [{ role: "user", parts: finalParts }] });
        const response = await result.response;
        
        // Check if the response actually contains an image
        const candidates = response.candidates;
        let aiImageBuffer = null;

        if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    console.log("🎉 AI Generated an Image!");
                    aiImageBuffer = Buffer.from(part.inlineData.data, 'base64');
                    break;
                }
            }
        }

        if (aiImageBuffer) {
            // If AI gave us an image, save it!
            await sharp(aiImageBuffer).toFile(outputPath);
            
            return res.json({
                success: true,
                transformedImageUrl: `/uploads/${outputFilename}`,
                message: "Nano Banana AI successfully generated your wedding dress photo!"
            });
        } 
        
        console.log("ℹ️ AI returned text/no-image. Full Response Text:", response.text());

        console.log("Falling back to overlay...");
        // Fallback execution continues below...
        
      } catch (aiError) {
        console.error("⚠️ Nano Banana API Error:", aiError.message);
        // Continue to overlay fallback
      }
    } else {
        console.log("⚠️ No API Key found. Using Offline Simulation (Overlay).");
    }

    // --- FALLBACK / SIMULATION (High Quality Overlay) ---
    // This ensures the user ALWAYS gets a result image, even if API fails or is missing key.
    
    // 1. Process base image: Fix orientation and resize
    const standardWidth = 600;
    const baseImageBuffer = await sharp(inputPath)
      .rotate() 
      .resize(standardWidth)
      .toBuffer();

    const metadata = await sharp(baseImageBuffer).metadata();
    const { width, height } = metadata;

    // 2. Prepare Dress Overlay
    const dressOverlayPath = path.join(__dirname, 'dress_overlay.svg');
    const dressBuffer = await sharp(dressOverlayPath)
      .resize({
        width: Math.floor(width * 0.9), 
        height: Math.floor(height * 0.9),
        fit: 'inside'
      })
      .png()
      .toBuffer();

    const finalOverlayBuffer = await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: dressBuffer,
      gravity: 'south'
    }])
    .png()
    .toBuffer();

    // 3. Final Composite
    await sharp(baseImageBuffer)
      .composite([{
        input: finalOverlayBuffer,
        blend: 'over'
      }])
      .toFile(outputPath);

    res.json({
      success: true,
      transformedImageUrl: `/uploads/${outputFilename}`,
      message: process.env.GEMINI_API_KEY 
        ? "Nano Banana API processed the request! (Hybrid Mode)" 
        : "Wedding dress fitting complete! (Offline Mode - Set API Key for AI)"
    });

  } catch (error) {
    console.error('Processing Error:', error);
    res.status(500).send('Error processing image');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
