# VA Hospital Locator

A web application that finds VA health facilities near a given ZIP code.
Built on the VA Facilities API, containerized with Docker, deployed on OCI Kubernetes Engine (OKE)
inside an SCCA-compliant landing zone.

## Architecture

```
Browser → OCI Load Balancer → Frontend (nginx/React) → Backend (Node.js) → api.va.gov
```

All components run in the `va-locator` namespace on OKE, deployed into the Workload VCN
of the SCCA landing zone.

## Local Development

### Prerequisites
- Node.js 20+
- Docker
- VA Facilities API key (https://developer.va.gov)

### Run backend locally
```bash
cd backend
npm install
VA_API_KEY=your_key_here node src/server.js
```

### Test backend
```bash
curl "http://localhost:3001/facilities?zip=94596&radius=100"
curl "http://localhost:3001/health"
```

### Run frontend locally
```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

## Build Docker Images

```bash
# Backend
docker build -t va-locator-backend:latest ./backend

# Frontend (pass backend URL at build time)
docker build \
  --build-arg REACT_APP_BACKEND_URL=http://your-backend-url:3001 \
  -t va-locator-frontend:latest \
  ./frontend
```

## Push to OCI Container Registry (OCIR)

```bash
# Login to OCIR
docker login <region>.ocir.io -u <tenancy>/<username>

# Tag and push backend
docker tag va-locator-backend:latest <region>.ocir.io/<tenancy>/va-locator-backend:latest
docker push <region>.ocir.io/<tenancy>/va-locator-backend:latest

# Tag and push frontend
docker tag va-locator-frontend:latest <region>.ocir.io/<tenancy>/va-locator-frontend:latest
docker push <region>.ocir.io/<tenancy>/va-locator-frontend:latest
```

## Deploy to OKE

```bash
# Update k8s/manifests.yaml with your OCIR image paths and VA API key

# Apply manifests
kubectl apply -f k8s/manifests.yaml

# Watch pods come up
kubectl get pods -n va-locator -w

# Get load balancer IP
kubectl get svc -n va-locator
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| GET /health | Health check |
| GET /facilities?zip=94596&radius=50&limit=10 | Find VA facilities near ZIP |

## Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| VA_API_KEY | VA Facilities API key | - |

### Frontend
| Variable | Description |
|----------|-------------|
| REACT_APP_BACKEND_URL | Backend service URL |
