# Prism Scaling Considerations

This document outlines the architectural boundaries and scaling considerations for Prism, specifically regarding Server-Sent Events (SSE).

## SSE Multi-Instance Limitations

Prism uses Server-Sent Events (SSE) to stream real-time analysis progress from the backend to the frontend. 

**Current Architecture:**
The SSE implementation relies on the long-lived HTTP connection staying bound to a single backend Node.js instance for the duration of the analysis (which can take up to 60 seconds). 

**Scaling Implications:**
- **Single Instance (Recommended):** Prism is currently designed to operate optimally as a single monolithic backend instance (vertically scaled).
- **Multi-Instance (Not Recommended out-of-the-box):** If you attempt to horizontally scale Prism (e.g., using Kubernetes HPA or multiple Docker containers behind a round-robin load balancer), the SSE architecture will face challenges:
  - If a node crashes during analysis, the SSE connection drops. The load balancer will route the reconnect to a *different* node, which has no context of the ongoing analysis.
  - Sticky sessions (session affinity) at the load balancer level can mitigate this by ensuring the client reconnects to the same node. However, this is a band-aid solution and does not solve the underlying statefulness of the connection.

## Future Path to Horizontal Scaling

If horizontal scaling becomes a requirement in the future, Prism must transition from in-memory processing to a distributed task queue architecture:

1. **Task Queue (Redis/BullMQ):** Analysis requests are placed on a distributed queue.
2. **Workers:** Independent worker nodes pick up tasks and process them.
3. **Pub/Sub (Redis):** Workers publish progress events to a Redis channel.
4. **API Nodes:** API nodes subscribe to the Redis channel and push SSE updates to the connected client, regardless of which worker is doing the processing.

*Note: The current phase of Prism explicitly avoids heavy infrastructure like Redis to remain lightweight and easily deployable.*
