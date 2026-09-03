# Prism Backend API

Base URL:

```text
/api/v1
```

All responses are JSON.

## POST /api/v1/analyze/text

### Description

Analyzes pasted text content and returns a Prism analysis report.

### Request Body

```json
{
  "content": "Article or claim text to analyze."
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `content` | string | Yes | Non-empty text to analyze. |

### Example Request

```bash
curl -X POST http://localhost:5000/api/v1/analyze/text \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"Example article text to analyze.\"}"
```

### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "message": "Content analyzed successfully.",
  "data": {
    "_id": "64f000000000000000000001",
    "status": "completed",
    "sourceType": "text",
    "originalInput": "Example article text to analyze.",
    "processedContent": "Example article text to analyze.",
    "analysis": {
      "overallVerdict": {
        "label": "Needs Context",
        "explanation": "The content requires additional verification and context."
      },
      "summary": "A concise summary of the analyzed content.",
      "recommendations": [
        "Compare the claims against primary sources."
      ]
    },
    "metadata": {
      "provider": "gemini-3.7-flash",
      "model": "gemini-3.7-flash",
      "processingDuration": 1200,
      "analysisVersion": 1
    }
  }
}
```

### Validation Errors

Status: `400 Bad Request`

```json
{
  "success": false,
  "message": "Content is required."
}
```

## POST /api/v1/analyze/url

### Description

Fetches a URL, extracts article content, and returns a Prism analysis report when the URL points to a supported article page.

### Request Body

```json
{
  "url": "https://example.com/news/story"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `url` | string | Yes | HTTP or HTTPS URL to analyze. |

### Example Request

```bash
curl -X POST http://localhost:5000/api/v1/analyze/url \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"https://example.com/news/story\"}"
```

### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "message": "URL analyzed successfully.",
  "data": {
    "_id": "64f000000000000000000002",
    "status": "completed",
    "sourceType": "url",
    "originalInput": "https://example.com/news/story",
    "processedContent": "Extracted article text...",
    "analysis": {
      "overallVerdict": {
        "label": "Credible",
        "explanation": "The content is supported by consistent evidence."
      },
      "summary": "A concise summary of the analyzed article.",
      "recommendations": [
        "Review cited sources for additional context."
      ]
    },
    "metadata": {
      "provider": "gemini-3.7-flash",
      "model": "gemini-3.7-flash",
      "processingDuration": 1500,
      "analysisVersion": 1,
      "pageType": "Article",
      "pageTypeConfidence": 0.94,
      "isArticle": true,
      "urlMetadata": {
        "title": "Example Story",
        "author": "Example Author",
        "publishedDate": "2026-07-01T00:00:00.000Z",
        "domain": "example.com",
        "canonicalUrl": "https://example.com/news/story",
        "siteName": "Example News",
        "excerpt": "Short article description.",
        "language": "en"
      }
    }
  }
}
```

### Validation Errors

Missing URL:

```json
{
  "success": false,
  "message": "URL is required."
}
```

Invalid URL:

```json
{
  "success": false,
  "message": "Invalid URL format."
}
```

Unsupported protocol:

```json
{
  "success": false,
  "message": "Only HTTP and HTTPS URLs are supported."
}
```

### Homepage, Repository, Documentation, or Search Results Rejection

Status: `400 Bad Request`

```json
{
  "success": false,
  "message": "This URL appears to be a homepage, repository, documentation page, search results page, landing page, or directory rather than a single article. Please provide the URL of a specific news article.",
  "metadata": {
    "pageType": "Documentation",
    "pageTypeConfidence": 0.92,
    "isArticle": false,
    "urlMetadata": {
      "title": "Example Documentation",
      "author": null,
      "publishedDate": null,
      "domain": "developer.mozilla.org",
      "canonicalUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      "siteName": "MDN Web Docs",
      "excerpt": "Documentation page excerpt.",
      "language": "en"
    }
  }
}
```

The `pageType` value may be `Homepage`, `Repository`, `Documentation`, `Search Results`, `Landing Page`, `Category Page`, or `Blog Index`.

### Blocked Website Example

When a site returns `401`, `403`, `429`, or another automated-retrieval restriction, the API returns a client error instead of an internal server error.

Status: `403 Forbidden` or `422 Unprocessable Entity`

```json
{
  "success": false,
  "code": "URL_BLOCKED",
  "message": "This website does not allow automated retrieval of this page. Please copy and paste the article text instead."
}
```

## GET /api/v1/health

### Purpose

Returns a lightweight API health response. This endpoint does not query the database and does not call Gemini.

### Example Request

```bash
curl http://localhost:5000/api/v1/health
```

### Example Response

Status: `200 OK`

```json
{
  "status": "ok",
  "version": "4.2.0",
  "provider": "gemini-3.7-flash"
}
```
