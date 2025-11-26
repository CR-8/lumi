import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { processImage, bufferToDataURL } from '@/lib/image';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image with Sharp
    const processed = await processImage(buffer);

    // Upload to Cloudinary
    const dataURL = bufferToDataURL(processed.buffer, processed.format);
    const uploadResult = await cloudinary.uploader.upload(dataURL, {
      folder: 'lumi-uploads',
      resource_type: 'image',
    });

    return NextResponse.json({
      success: true,
      secureUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: processed.width,
      height: processed.height,
      format: processed.format,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
