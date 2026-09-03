# Prism Disaster Recovery & Backup Strategy

This document outlines the backup, restore, and recovery expectations for the Prism platform.

## MongoDB Backup Procedure

Prism relies entirely on MongoDB for persistent state. To ensure data is not lost during an infrastructure failure, regular backups must be performed.

### Creating a Backup
Use `mongodump` to create a binary export of the database.
```bash
mongodump --uri="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/prism" --out=/path/to/backup/dir
```
*Recommendation*: Automate this process using a cron job or utilize MongoDB Atlas's built-in automated backup solutions if hosted on Atlas.

### Restoring a Backup
Use `mongorestore` to recover data from a previous dump.
```bash
mongorestore --uri="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/prism" --drop /path/to/backup/dir/prism
```
*Note*: The `--drop` flag will drop existing collections before restoring. Use with caution.

## Recovery Expectations & Verification

**State Preservation:**
Restoring a `mongodump` will completely restore:
- All Analysis Reports and Batch Reports
- User Collections and their relationships to reports
- Watchlist items and their historical check logs
- Activity/Audit logs
- User settings

**In-Flight Analyses:**
- Prism's architecture currently does not persist "in-progress" jobs to the database.
- Any analysis that was actively running during a crash will **not** be resumed. The user must re-submit the analysis.
- This prevents the database from being cluttered with perpetually "processing" ghost records.

## Component Failure Scenarios

1. **MongoDB Failure:**
   - The `/api/v1/health` endpoint will immediately report `503 Service Unavailable`.
   - The frontend will gracefully inform the user that the system is offline.
   - **Recovery**: Restart the MongoDB service or failover to a replica. Data integrity remains intact.

2. **Gemini / AI Provider Failure:**
   - If the AI provider is down, the `/api/v1/health` endpoint's AI Provider check will fail.
   - Analysis requests will return a `500` error with a graceful message to the user.
   - **Recovery**: Wait for provider availability. No data is corrupted.

3. **Backend Node Crash:**
   - In a multi-instance deployment, the load balancer will route around the crashed node.
   - Any active Server-Sent Events (SSE) analysis streams attached to the crashed node will disconnect. The frontend will notify the user of the failure.
   - **Recovery**: The orchestrator (e.g., PM2, Docker, Kubernetes) should automatically restart the crashed node.

4. **Corrupted Analysis:**
   - If an analysis yields malformed AI output, the system defaults to "Not Applicable" credibility and gracefully logs the error without crashing the server.
   - **Recovery**: The user can manually click "Re-analyze" in the UI to try again.
