# FindX — Road Map (Out-of-Scope Items)

This document lists features that are explicitly out of scope for v1.0 to maintain quality.
These are not half-implemented — they do not exist in the codebase. Each is worth building as a follow-on milestone.

---

## Planned for v2.0

### 📱 Mobile Application
- React Native or Flutter app
- Push notifications via FCM/APNs
- Camera integration for on-the-spot photo capture

### 🔍 Image-Based Matching
- Computer vision model (ResNet/EfficientNet) to match items by photo
- Would replace or augment the text-based description similarity
- Requires GPU inference server (e.g., TorchServe)

### 📍 GPS / Real-Time Location
- Live map with WebSocket-based item pin updates
- Geofencing alerts when a found item is near a user's last-known location

### 🤖 ML-Powered Matching
- Sentence transformer embeddings (e.g., `all-MiniLM-L6-v2`) for semantic description similarity
- Would replace Jaccard/Levenshtein in descriptionSimilarity with vector cosine search
- Requires a Python ML service (FastAPI) or ONNX runtime in C++

### 🏢 Multi-Campus Support
- Multiple organizations / campuses in one deployment
- Tenant isolation at DB level (row-level security)
- Campus-scoped graphs, buildings, users

---

## Planned for v2.5

### 📧 Email / SMS Notifications
- SMTP integration (SendGrid/SES) for claim status emails
- SMS via Twilio for urgent match alerts
- Currently stubbed as console log in v1

### 📦 QR Code Integration
- QR codes printed for each found item
- Scan-to-claim workflow
- Requires barcode generation library

### ☁️ Cloud Deployment
- Kubernetes Helm chart for production deployment
- PostgreSQL → Cloud SQL / RDS
- Object storage for photos → S3 / GCS (currently local filesystem)
- CDN for static assets

### 🔒 SSO / OAuth2
- University SSO integration (Shibboleth / SAML)
- "Login with Google" for student accounts

---

## Technical Debt Items (v1.1)

- Self-balancing AVL/Red-Black tree (BST currently O(n) worst case on sorted input)
- Redis caching layer (currently all DB reads are direct; hot paths need caching)
- Rate limiting per IP (currently no rate limiting in C++ server)
- WebSocket real-time notifications (currently polling-based)
- Full test coverage for API integration (currently only engine unit tests)
- Structured request logging with correlation IDs
