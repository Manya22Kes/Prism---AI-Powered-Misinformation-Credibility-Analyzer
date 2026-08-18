# Prism Architecture

## Prism Design Law #1
**Every new input type must transform its content into the standard processedContent contract. The AI analysis pipeline must remain agnostic to the source format.**

## Prism Design Law #2
**Processors extract and normalize content. They do not perform analysis or make provider-specific decisions.**

## Prism Design Law #3
**External AI providers are interchangeable. Processors communicate only with generic internal services, never directly with provider SDKs.**

## Prism Design Law #4
**New capabilities should compose existing processors before introducing new extraction logic.**

### Core Philosophy
Prism is an AI-powered Misinformation & Credibility Analysis Platform. 
Because the AI engine (`analyzeContent()`), normalization logic, report schema, and evaluation framework are highly complex, they form the immutable core of the system.

*New input types must adapt themselves to the existing AI pipeline, not require changes to it.*

### Processor Ingestion Layer
All incoming data (Text, URLs, Images, PDFs, DOCX) passes through a specialized processor. The processor is responsible for:
1. Validation
2. Extraction
3. Normalization
4. Emitting the Standard Contract

### The Standard Contract
```javascript
{
    sourceType: "text" | "url" | "image" | "pdf" | "docx",
    originalInput: any, // The raw input (e.g. url string, base64, etc.)
    processedContent: string, // The extracted and normalized text ready for Gemini
    metadata: Object // Modality-specific metadata (e.g. pageCount, wordCount, etc.)
}
```
