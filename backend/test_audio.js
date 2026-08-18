import processAudio from "./server/processors/audio/processAudio.js";
import { AUDIO_CONFIG } from "./server/config/audio.config.js";
import * as musicMetadata from "music-metadata";

async function runTests() {
  console.log("Mocking Google Cloud Speech-to-Text API and music-metadata natively...");
  process.env.MOCK_SPEECH = "true";
  
  // Create a dummy buffer
  const dummyBuffer = Buffer.from("dummy audio content");
  
  // Test 1: Valid Audio processing (Mocking music-metadata shouldn't be strictly necessary if it fails gracefully, 
  // but let's test if processAudio handles the graceful fail).
  console.log("\n--- TEST 1: Valid Audio (Empty buffer fallback) ---");
  
  try {
    const result = await processAudio(dummyBuffer, "audio/mpeg", dummyBuffer.length);
    console.log("Processed Content:", result.processedContent);
    console.log("Metadata:", JSON.stringify(result.metadata, null, 2));
    
    if (result.metadata.audio.transcriptLength === 76 && result.metadata.audio.transcriptionProvider === "mock-transcription-provider") {
      console.log("TEST 1 PASSED");
    } else {
      console.error("TEST 1 FAILED: Mismatch in metadata.");
    }
  } catch (e) {
    console.error("TEST 1 FAILED:", e.message);
  }

  // Test 2: Audio Truncation (We will test normalizeTranscript directly for massive text instead of the API mock)
  console.log("\n--- TEST 2: Audio Truncation Limits ---");
  const massiveText = "word ".repeat(AUDIO_CONFIG.MAX_TRANSCRIPT_LENGTH / 5 + 100);
  
  const { default: normalizeTranscript } = await import("./server/processors/audio/normalizeTranscript.js");
  const { normalizedText, truncated } = normalizeTranscript(massiveText);
  
  if (truncated.isTruncated && normalizedText.length === AUDIO_CONFIG.MAX_TRANSCRIPT_LENGTH) {
    console.log("TEST 2 PASSED");
    console.log("Truncated reason:", truncated.reason);
  } else {
    console.error("TEST 2 FAILED: Truncation logic failed.");
  }

  // Test 3: Validation Limits (Size)
  console.log("\n--- TEST 3: Validation Size Limits ---");
  try {
    await processAudio(dummyBuffer, "audio/mpeg", AUDIO_CONFIG.MAX_FILE_SIZE + 10);
    console.error("TEST 3 FAILED: Should have thrown an error for file size.");
  } catch (e) {
    if (e.statusCode === 400 && e.message.includes("File size exceeds the limit")) {
      console.log("TEST 3 PASSED");
    } else {
      console.error("TEST 3 FAILED:", e.message);
    }
  }

  // Test 4: Validation Limits (Mimetype)
  console.log("\n--- TEST 4: Validation Mimetype Limits ---");
  try {
    await processAudio(dummyBuffer, "audio/aac", dummyBuffer.length);
    console.error("TEST 4 FAILED: Should have thrown an error for unsupported format.");
  } catch (e) {
    if (e.statusCode === 400 && e.message.includes("Invalid file format")) {
      console.log("TEST 4 PASSED");
    } else {
      console.error("TEST 4 FAILED:", e.message);
    }
  }
}

runTests();
