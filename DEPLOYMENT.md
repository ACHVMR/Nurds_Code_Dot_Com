# Deployment Guide for Nurdscode

This guide covers deploying the Nurdscode application to Cloudflare Pages, Workers, and Container Registry.

## Prerequisites

1. Cloudflare account with:
   - Pages access
   - Workers paid plan
   - D1 database access
   - Container Registry access
2. Stripe account with API keys
3. GitHub repository access

## Step 1: Set Up Cloudflare D1 Database

```bash
# Create the D1 database
wrangler d1 create nurdscode_db

# Note the database ID from the output
# Update wrangler.toml with the database ID

# Run the schema migration
wrangler d1 execute nurdscode_db --file=./schema.sql
```

## Step 2: Configure Secrets and Environment Variables

### For Cloudflare Workers

```bash
# Set secrets (sensitive data)
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET

# Set environment variables (non-sensitive)
wrangler secret put JWT_SECRET
```

Update `wrangler.toml` with your configuration:
```toml
[vars]
STRIPE_PUBLISHABLE_KEY = "pk_test_your_key"
JWT_SECRET = "your_jwt_secret"
```

## Step 3: Deploy Backend (Cloudflare Workers)

```bash
# Deploy the Worker
npm run worker:deploy

# Note the Worker URL for frontend configuration
```

## Step 4: Set Up Stripe Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-worker-url.workers.dev/api/webhook`
3. Select events to listen:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Update Worker secret: `wrangler secret put STRIPE_WEBHOOK_SECRET`

## Step 5: Deploy Frontend (Cloudflare Pages)

### Option A: Automatic Deployment via GitHub

1. Go to Cloudflare Dashboard > Pages
2. Create a new project
3. Connect to GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variables:
     - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
     - `VITE_API_URL`: Your Worker URL

### Option B: Manual Deployment

```bash
# Build the application
npm run build

# Deploy to Pages
wrangler pages deploy dist --project-name=nurdscode
```

## Step 6: Configure Environment Variables for Pages

In Cloudflare Dashboard > Pages > Settings > Environment Variables:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
VITE_API_URL=https://your-worker-url.workers.dev
```

## Step 7: Set Up Container Registry

### Configure GitHub Secrets

Add these secrets to your GitHub repository (Settings > Secrets):

- `CLOUDFLARE_REGISTRY_USERNAME`: Your Cloudflare email
- `CLOUDFLARE_REGISTRY_TOKEN`: API token from Cloudflare Dashboard

### Get Cloudflare API Token

1. Go to Cloudflare Dashboard > My Profile > API Tokens
2. Create token with "Edit Cloudflare Workers" template
3. Copy and add to GitHub secrets

### Automatic Deployment

The GitHub Action will automatically build and push the Docker image when you push to `main` or `develop` branches.

### Manual Build and Push

#### Using Docker (Default)

```bash
# Build the image
docker build -t nurdscode-app .

# Tag for Cloudflare Registry
docker tag nurdscode-app registry.cloudflare.com/nurdscode-userappsandboxservice:custom

# Login to Cloudflare Registry
echo $CLOUDFLARE_REGISTRY_TOKEN | docker login registry.cloudflare.com -u $CLOUDFLARE_REGISTRY_USERNAME --password-stdin

# Push to registry
docker push registry.cloudflare.com/nurdscode-userappsandboxservice:custom
```

#### Using Daytona (Alternative if Docker isn't working)

If you encounter issues with Docker, use Daytona as an alternative:

```bash
# Install Daytona
curl -sf https://download.daytona.io/daytona/install.sh | sudo sh

# Create Daytona workspace
daytona create --name nurdscode-app

# Build with Daytona
daytona build

# Export container image
daytona export nurdscode-app:latest

# Tag and push to registry (Daytona supports Docker registry protocol)
daytona push registry.cloudflare.com/nurdscode-userappsandboxservice:custom
```

#### Using Ubuntu.cloud Container

For Ubuntu-based cloud deployments:

```bash
# Build with Ubuntu base
docker build -f Dockerfile -t nurdscode-ubuntu .

# Run locally for testing
docker run -p 80:80 nurdscode-ubuntu

# Tag and push
docker tag nurdscode-ubuntu registry.cloudflare.com/nurdscode-userappsandboxservice:custom
docker push registry.cloudflare.com/nurdscode-userappsandboxservice:custom
```

## Step 8: Verify Deployment

### Test the Frontend
- Visit your Cloudflare Pages URL
- Navigate through all pages: /, /pricing, /editor, /subscribe

### Test the Backend
```bash
# Health check
curl https://your-worker-url.workers.dev/api/health

# Test checkout session (should fail without proper data)
curl -X POST https://your-worker-url.workers.dev/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_test","email":"test@example.com"}'
```

## Step 9: Set Up Custom Domain (Optional)

### For Pages
1. Go to Cloudflare Pages > Custom domains
2. Add domain: `nurdscode.com`
3. Follow DNS setup instructions

### For Workers
1. Go to Workers > your-worker > Settings > Triggers
2. Add Custom Domain
3. Configure DNS records

## Monitoring and Maintenance

### View Logs
```bash
# Worker logs
wrangler tail

# D1 database queries
wrangler d1 execute nurdscode_db --command="SELECT * FROM subscriptions LIMIT 10"
```

### Update Application
```bash
# Update frontend
npm run build
wrangler pages deploy dist

# Update backend
npm run worker:deploy
```

## Troubleshooting

### Issue: Docker not working or unavailable
**Solution**: Use Daytona as an alternative container runtime
```bash
# Install Daytona
curl -sf https://download.daytona.io/daytona/install.sh | sudo sh

# Create workspace
daytona create

# Start development environment
daytona start
```

**Alternative**: Use Ubuntu.cloud containers
- Deploy directly to cloud providers with Ubuntu base images
- Compatible with most container orchestration platforms

### Issue: Stripe webhook not working
- Verify webhook secret is correct
- Check Worker logs: `wrangler tail`
- Ensure events are selected in Stripe Dashboard

### Issue: Database not accessible
- Verify D1 database ID in wrangler.toml
- Check if schema was applied: `wrangler d1 execute nurdscode_db --command="SELECT name FROM sqlite_master WHERE type='table'"`

### Issue: CORS errors
- Ensure Worker is deployed and accessible
- Check CORS headers in workers/api.js
- Verify VITE_API_URL environment variable

### Issue: Build fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: should be 18+
- Verify all dependencies are installed

## Production Checklist

- [ ] D1 database created and migrated
- [ ] Stripe products and prices created
- [ ] Stripe webhook configured and tested
- [ ] Worker secrets configured
- [ ] Frontend deployed to Pages
- [ ] Environment variables set for Pages
- [ ] Custom domains configured (if applicable)
- [ ] Docker image built and pushed to registry
- [ ] SSL/TLS certificates active
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Rate limiting configured (if needed)

## Security Notes

- Never commit secrets to Git
- Rotate API keys regularly
- Use environment-specific keys (test vs production)
- Monitor for unusual API usage
- Keep dependencies updated
- Review Stripe webhook signatures
- Implement rate limiting for API endpoints

## Support

For issues or questions:
- Check the main README.md
- Review Cloudflare documentation
- Contact support@nurdscode.com
