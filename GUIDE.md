# AutoElite — Complete Guide
# App · Docker · Kubernetes · Jenkins CI/CD · AWS EKS · SonarQube

---

## Project Structure

```
autoelite/
├── car-backend/
│   ├── server.js                      Express API
│   ├── server.test.js                 Jest tests (8 tests)
│   ├── package.json
│   ├── Dockerfile
│   ├── .dockerignore
│   └── jenkins/
│       ├── Jenkinsfile.ci             CI — 6 stages
│       └── Jenkinsfile.cd             CD — deploy only
│
├── car-frontend/
│   ├── src/
│   │   ├── config.js                  reads REACT_APP_API_URL
│   │   ├── App.jsx
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── __tests__/App.test.jsx     React tests (6 tests)
│   │   └── components/
│   ├── .env                           local dev URL
│   ├── .env.production                production URL placeholder
│   ├── package.json
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── public/index.html
│   └── jenkins/
│       ├── Jenkinsfile.ci             CI — 6 stages
│       └── Jenkinsfile.cd             CD — deploy only
│
└── k8s/
    ├── namespace.yaml                 production + staging namespaces
    ├── configmap.yaml
    ├── backend-deployment.yaml        ✅ set ECR image URI
    ├── backend-service.yaml           ALB LoadBalancer
    ├── frontend-deployment.yaml       ✅ set ECR image URI
    ├── frontend-service.yaml          ALB LoadBalancer
    ├── ingress.yaml
    └── hpa.yaml
```

---

## CI Pipeline — All Stages

```
Stage 1  Checkout
Stage 2  Build                   npm install
Stage 3  Test + Coverage         Jest → lcov report → Jenkins HTML
Stage 4  SCA                     OWASP Dependency-Check → Jenkins chart + JSON
Stage 5  SonarQube               SAST + SCA + Quality Gate (single dashboard)
Stage 6  Docker Build + ECR      [develop and main only]
         ↓
         triggers CD automatically
```

## CD Pipeline

```
Stage 1  Deploy to EKS           kubectl set image + rollout
                                  auto rollback on failure
```

---

## SonarQube — Single Dashboard for SAST + SCA + Quality Gate

This is the key design. One SonarQube project shows everything.

```
SonarQube Dashboard → your-sonar-server:9000 → Projects → car-backend

├── Overview tab
│     Quality Gate result → PASS or FAIL
│     Combines all findings below into one verdict
│
├── Issues tab
│     SAST findings from SonarQube built-in rules:
│       - JavaScript/Node.js security rules
│       - XSS vulnerabilities
│       - Hardcoded credentials
│       - Insecure random, eval usage
│       - OWASP Top 10 patterns
│     Also shows: bugs, code smells, duplications
│
├── Security tab
│     OWASP Top 10 breakdown
│     CVE vulnerabilities from OWASP Dependency-Check JSON
│     Severity mapped as:
│       CVSS >= 9.0 → Blocker
│       CVSS >= 7.0 → Critical
│       CVSS >= 4.0 → Major
│       CVSS >= 0.0 → Minor
│
└── Coverage tab
      Line coverage % from Jest lcov report
      Branch coverage %
```

### How It Works

```
Stage 3 → Jest runs tests → generates coverage/lcov.info
Stage 4 → OWASP DC runs  → generates dependency-check-report/
                            dependency-check-report.json
Stage 5 → sonar-scanner sends everything to SonarQube:
            source code          → SAST analysis
            coverage/lcov.info   → Coverage tab
            dc-report.json       → Security tab (SCA)
          → Quality Gate checked → pipeline passes or fails
```

---

## Branch Strategy

```
Branch        CI Stages    Docker Build    Deploys To
─────────────────────────────────────────────────────
feature/*     1 – 5        No              nowhere
develop       1 – 6        :staging-tag    autoelite-staging
main          1 – 6        :prod-tag       autoelite (prod)
```

---

## Jenkins Setup

### Plugins to Install
`Jenkins → Manage Jenkins → Plugins → Available`

| Plugin | Purpose |
|---|---|
| Pipeline | Declarative pipeline |
| Git | Code checkout |
| NodeJS | Node.js tool |
| SonarQube Scanner | SonarQube integration |
| OWASP Dependency-Check | SCA scanning |
| Docker Pipeline | Docker build and push |
| AWS Credentials | AWS key management |
| HTML Publisher | Coverage report tab in Jenkins |
| JUnit | Test results chart |

### Global Tool Configuration
`Jenkins → Manage Jenkins → Global Tool Configuration`

**NodeJS**
- Name: `NodeJS-20`
- Version: `20.x`

**OWASP Dependency-Check**
- Name: `OWASP-DC`
- Install automatically: ✅

**SonarQube Scanner**
- Name: `SonarQube Scanner`
- Install automatically: ✅

### SonarQube Server Config
`Jenkins → Manage Jenkins → Configure System → SonarQube servers`

- Name: `SonarQube`
- Server URL: `http://your-sonar-server:9000`
- Token: select `sonar-token` credential

### Jenkins Credentials
`Jenkins → Manage Jenkins → Credentials → Global → Add`

| Credential ID | Type | Value |
|---|---|---|
| `aws-credentials` | AWS Credentials | Access Key + Secret |
| `aws-account-id` | Secret Text | 12-digit AWS account ID |
| `sonar-token` | Secret Text | SonarQube user token |
| `react-app-api-url-staging` | Secret Text | staging backend ALB DNS |
| `react-app-api-url-prod` | Secret Text | production backend ALB DNS |

### Jenkins Jobs — 6 Total
`Jenkins → New Item → Pipeline → OK`
`Pipeline → Definition: Pipeline script from SCM → Git → Script Path`

| Job Name | Script Path |
|---|---|
| `car-backend-ci` | `car-backend/jenkins/Jenkinsfile.ci` |
| `car-backend-cd-staging` | `car-backend/jenkins/Jenkinsfile.cd` |
| `car-backend-cd-prod` | `car-backend/jenkins/Jenkinsfile.cd` |
| `car-frontend-ci` | `car-frontend/jenkins/Jenkinsfile.ci` |
| `car-frontend-cd-staging` | `car-frontend/jenkins/Jenkinsfile.cd` |
| `car-frontend-cd-prod` | `car-frontend/jenkins/Jenkinsfile.cd` |

### Values to Update in Jenkinsfiles

In both `Jenkinsfile.ci` files update:
```groovy
SONAR_HOST_URL = 'http://your-sonar-server:9000'  // your SonarQube URL
AWS_REGION     = 'ap-south-1'                      // your AWS region
```

In both `Jenkinsfile.cd` files update:
```groovy
AWS_REGION  = 'ap-south-1'           // your AWS region
EKS_CLUSTER = 'autoelite-cluster'    // your EKS cluster name
```

---

## SonarQube Quality Gate Setup

`SonarQube → Quality Gates → Create → Add Conditions`

| Metric | Condition | Threshold |
|---|---|---|
| Coverage | Less than | 70% |
| Reliability Rating | Worse than | A |
| Security Rating | Worse than | A |
| Maintainability Rating | Worse than | A |
| Security Hotspots Reviewed | Less than | 100% |

Assign to projects:
`Project → Project Settings → Quality Gate → select your gate`

### SonarQube Token
```
SonarQube → My Account → Security → Generate Token
  Name: jenkins-token
  Type: User Token
  Copy → add as Jenkins credential 'sonar-token'
```

---

## AWS Setup

```bash
# Install tools
brew install awscli eksctl kubectl

# Configure
aws configure
# Access Key ID, Secret Key, Region (ap-south-1), Output (json)

# Create EKS cluster
eksctl create cluster \
  --name autoelite-cluster \
  --region ap-south-1 \
  --nodegroup-name autoelite-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --managed

# Connect kubectl
aws eks update-kubeconfig --name autoelite-cluster --region ap-south-1

# Create ECR repos
aws ecr create-repository --repository-name car-backend  --region ap-south-1
aws ecr create-repository --repository-name car-frontend --region ap-south-1
```

---

## First Deploy Order

```
1.  Create EKS cluster
2.  Create ECR repos
3.  Build + push backend image to ECR
4.  kubectl apply backend K8s files
5.  kubectl get svc car-backend -n autoelite → copy EXTERNAL-IP
6.  Add that DNS as Jenkins credentials:
      react-app-api-url-prod
      react-app-api-url-staging
7.  Build + push frontend image to ECR
8.  kubectl apply frontend K8s files
9.  kubectl get svc car-frontend -n autoelite → copy EXTERNAL-IP → open in browser
10. Set up Jenkins 6 jobs
11. Push code → CI triggers → SonarQube gate checked → CD triggers → live
```

---

## Rollback

```bash
# Manual rollback
kubectl rollout undo deployment/car-backend  -n autoelite
kubectl rollout undo deployment/car-frontend -n autoelite

# Check history
kubectl rollout history deployment/car-backend -n autoelite

# Rollback to specific revision
kubectl rollout undo deployment/car-backend --to-revision=2 -n autoelite
```

---

## npm install vs npm ci

Both pipelines use `npm install` instead of `npm ci`.

`npm ci` requires `package-lock.json` to be committed to the repo and
fails if it is missing or out of sync. `npm install` always works.
If you commit `package-lock.json` to your repo you can switch to `npm ci`
for faster, reproducible installs.

---

## Common Issues

| Problem | Fix |
|---|---|
| Quality Gate fails | Check SonarQube dashboard → fix issues → re-push |
| OWASP not showing in SonarQube | Install SonarQube OWASP Dependency-Check plugin on SonarQube server |
| `ImagePullBackOff` | Image not pushed to ECR — run CI first |
| `EXTERNAL-IP pending` | Wait 2–3 min for AWS ALB to provision |
| Frontend calls wrong backend | Update Jenkins credential `react-app-api-url-prod` → re-run CI |
| npm install fails | Check Node.js version matches `NodeJS-20` in Jenkins tool config |
