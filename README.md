# Nurdscode - ACHIEVEMOR Coding Platform

A custom Cloudflare VibeSDK application built with React, Vite, and Tailwind CSS, featuring a complete subscription system powered by Stripe and Cloudflare Workers.

## Features

- 🚀 **Modern Stack**: React + Vite + Tailwind CSS
- ⚡ **Serverless Backend**: Cloudflare Workers + D1 Database
- 💳 **Stripe Integration**: Three-tier pricing (Free, Pro, Enterprise)
- 🔐 **JWT Authentication**: Secure user authentication
- 🎨 **Custom Branding**: Nurdscode-themed UI with purple, blue, and green accents
- 📱 **Responsive Design**: Mobile-first approach
- 🐳 **Containerized**: Docker support with multi-stage builds
- 🔄 **CI/CD**: GitHub Actions for automated deployments

## Pages

- `/` - Home page with features showcase
- `/pricing` - Three-tier pricing plans
- `/subscribe` - Subscription checkout flow
- `/success` - Post-subscription success page
- `/editor` - Code editor with real-time execution

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend
- **Cloudflare Workers** - Serverless functions
- **Cloudflare D1** - SQLite database
- **Stripe** - Payment processing
- **JWT** - Authentication tokens

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (recommended) or Daytona (alternative) - see [DAYTONA-SETUP.md](./DAYTONA-SETUP.md)
- Cloudflare account (for deployment)
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ACHVMR/Nurds_Code_Dot_Com.git
cd Nurds_Code_Dot_Com
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual keys
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Running the Backend

1. Start the Cloudflare Worker locally:
```bash
npm run worker:dev
```

The API will be available at `http://localhost:8787`

## Database Setup

1. Create a D1 database:
```bash
wrangler d1 create nurdscode_db
```

2. Update `wrangler.toml` with your database ID

3. Run migrations:
```bash
npm run db:migrate
```

## Stripe Configuration

### Create Products and Prices

1. Log in to your Stripe Dashboard
2. Create three products:
   - Free (for demo purposes)
   - Pro ($29/month)
   - Enterprise ($99/month)

3. Copy the price IDs and update:
   - `src/pages/Subscribe.jsx`
   - Environment variables

### Set up Webhook

1. Create a webhook endpoint in Stripe Dashboard
2. Point it to: `https://your-worker-url.workers.dev/api/webhook`
3. Subscribe to events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook secret to your environment variables

## Container Deployment

> **Note**: If Docker is not working, see [DAYTONA-SETUP.md](./DAYTONA-SETUP.md) for an alternative using Daytona.

### Option 1: Docker (Recommended)

#### Build the Docker image:
```bash
docker build -t nurdscode-app .
```

#### Run locally:
```bash
docker run -p 80:80 nurdscode-app
```

#### Push to Cloudflare Registry:

The GitHub Action automatically builds and pushes the image when you push to `main` or `develop` branches.

Manual push:
```bash
docker tag nurdscode-app registry.cloudflare.com/nurdscode-userappsandboxservice:custom
docker push registry.cloudflare.com/nurdscode-userappsandboxservice:custom
```

### Option 2: Daytona (Alternative to Docker)

If Docker is not available or not working, you can use [Daytona](https://www.daytona.io/) as an alternative container runtime.

#### Install Daytona:
```bash
# Install Daytona
curl -sf https://download.daytona.io/daytona/install.sh | sudo sh

# Verify installation
daytona version
```

#### Run with Daytona:
```bash
# Create a Daytona workspace
daytona create

# The application will be automatically containerized and run
daytona start
```

### Option 3: Ubuntu.cloud Container

You can also deploy using Ubuntu.cloud containers for cloud-native deployments:

```bash
# Pull Ubuntu base image
docker pull ubuntu:latest

# Build with Ubuntu base
docker build -f Dockerfile -t nurdscode-ubuntu .

# Run the container
docker run -p 80:80 nurdscode-ubuntu
```

## GitHub Actions Setup

1. Add the following secrets to your GitHub repository:
   - `CLOUDFLARE_REGISTRY_USERNAME`
   - `CLOUDFLARE_REGISTRY_TOKEN`

2. The workflow will automatically:
   - Build the Docker image
   - Run tests
   - Push to Cloudflare Container Registry

## API Endpoints

### POST `/api/create-checkout-session`
Create a Stripe checkout session for subscription

**Request:**
```json
{
  "priceId": "price_xxx",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### POST `/api/webhook`
Stripe webhook handler for subscription events

### GET `/api/subscription`
Get user's subscription details (requires JWT token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── docker-build-push.yml
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Pricing.jsx
│   │   ├── Subscribe.jsx
│   │   ├── Success.jsx
│   │   └── Editor.jsx
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── workers/
│   └── api.js
├── Dockerfile
├── schema.sql
├── wrangler.toml
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Deployment

### Frontend (Cloudflare Pages)
```bash
npm run build
wrangler pages deploy dist
```

### Backend (Cloudflare Workers)
```bash
npm run worker:deploy
```

### Docker Container
The GitHub Action automatically handles this on push to main/develop.

## Environment Variables

### Frontend (Vite)
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `VITE_API_URL` - Backend API URL

### Backend (Cloudflare Workers)
- `STRIPE_SECRET_KEY` - Stripe secret key (secret)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (secret)
- `JWT_SECRET` - JWT signing secret (variable)
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (variable)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@nurdscode.com or open an issue on GitHub.

## Acknowledgments

- Cloudflare for the awesome Workers platform
- Stripe for payment processing
- The React and Vite teams for excellent tools
