import vision from '@google-cloud/vision';

async function testVision() {
  console.log('🔍 Testing Google Cloud Vision API Connection...');
  try {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.textDetection('https://cloud.google.com/static/vision/docs/images/sign_small.jpg');
    const detections = result.textAnnotations;
    console.log('--------------------------------------------------');
    console.log('✅ GOOGLE CLOUD VISION API IS WORKING & AUTHENTICATED!');
    console.log('--------------------------------------------------');
    if (detections && detections.length > 0) {
      console.log('Extracted Text from sample image:');
      console.log(detections[0].description.trim());
    } else {
      console.log('(API call succeeded - 0 text objects found in image)');
    }
  } catch (error) {
    console.log('--------------------------------------------------');
    console.error('❌ Google Cloud Vision API Error:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    console.log('--------------------------------------------------');
  }
}

testVision();
