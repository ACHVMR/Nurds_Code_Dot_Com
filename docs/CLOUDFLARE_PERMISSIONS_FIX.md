# Cloudflare Workers Permissions Fix

## Issue: 403 Forbidden Error

If you're seeing a **403 Forbidden** error when deploying Workers or using the VibeSDK, it's because your Cloudflare API Token lacks the required permissions for **Workers for Platforms**.

---

## What is Workers for Platforms?

**Workers for Platforms** is a Cloudflare enterprise feature that allows you to:
- Spawn individual AI workers for each user
- Deploy dynamic Workers on behalf of your users
- Build SaaS platforms on top of Cloudflare Workers

This is required by VibeSDK to create isolated execution environments for each user's code.

---

## How to Fix: Generate a New API Token

### Step 1: Navigate to API Tokens

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on your profile icon (top right)
3. Select **"My Profile"** → **"API Tokens"**
4. Click **"Create Token"**

### Step 2: Select Template

1. Find **"Edit Cloudflare Workers"** template
2. Click **"Use template"**

### Step 3: Add Required Permissions

You need to ADD these specific permissions to the template:

#### Account Permissions

| Resource | Permission | Required |
|----------|-----------|----------|
| **Workers for Platforms** | Edit | ✅ **CRITICAL** |
| **D1** | Edit | ✅ Required |
| **AI Gateway** | Edit | ✅ Recommended |
| **Workers Scripts** | Edit | ✅ Default |
| **Workers KV Storage** | Edit | ⚪ Optional |
| **Workers R2 Storage** | Edit | ⚪ Optional |

#### Zone Permissions (if deploying to custom domains)

| Resource | Permission | Required |
|----------|-----------|----------|
| **Workers Routes** | Edit | ⚪ Optional |
| **DNS** | Edit | ⚪ Optional |

### Step 4: Configure Token Settings

1. **Token Name**: `Nurds Code - Workers Platform Token`
2. **Account Resources**: Select your account
3. **Zone Resources**: Select specific zones (or all zones)
4. **Client IP Address Filtering**: Leave blank (unless you need IP restrictions)
5. **TTL**: Choose expiration (or "Forever" for development)

### Step 5: Create and Copy Token

1. Click **"Continue to summary"**
2. Review permissions
3. Click **"Create Token"**
4. **IMPORTANT**: Copy the token immediately (it won't be shown again!)

---

## How to Use the New Token

### Option 1: Update Environment Variables

Add to your `.env` file:

```bash
CLOUDFLARE_API_TOKEN=your_new_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
```

### Option 2: Update `wrangler.toml`

If using wrangler CLI, you can authenticate with:

```bash
wrangler login
```

Or set the token directly:

```bash
export CLOUDFLARE_API_TOKEN=your_new_token_here
```

### Option 3: GitHub Secrets (for CI/CD)

If deploying via GitHub Actions:

1. Go to your repo → Settings → Secrets and variables → Actions
2. Add new secret: `CLOUDFLARE_API_TOKEN`
3. Paste your new token

---

## Verify Token Permissions

Test your token with the Cloudflare API:

```bash
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected response:

```json
{
  "success": true,
  "result": {
    "id": "...",
    "status": "active",
    "not_before": "...",
    "expires_on": "..."
  }
}
```

---

## Common Errors and Solutions

### Error: "workers.scripts.write not allowed"

**Cause**: Token doesn't have Workers Scripts Edit permission

**Fix**: Recreate token with "Edit Cloudflare Workers" template

### Error: "workers_for_platforms.scripts.write not allowed"

**Cause**: Token doesn't have Workers for Platforms permission

**Fix**: Add "Workers for Platforms → Edit" permission when creating token

### Error: "d1.database.write not allowed"

**Cause**: Token doesn't have D1 Edit permission

**Fix**: Add "D1 → Edit" permission to token

---

## Security Best Practices

1. **Use Scoped Tokens**: Only grant permissions you actually need
2. **Rotate Tokens**: Change tokens every 90 days
3. **Use Secrets**: Never commit tokens to git (add to `.gitignore`)
4. **Monitor Usage**: Check Cloudflare Analytics for unusual API usage
5. **Revoke Old Tokens**: Delete unused tokens from Cloudflare dashboard

---

## What Changed?

The previous token (`rhY...`) was an **R2 Storage Token** with limited permissions. It could only access R2 buckets, not Workers or D1 databases.

The new token is a **Workers Platform Token** with full permissions to:
- Deploy and manage Workers
- Create D1 databases
- Use Workers for Platforms features
- Access AI Gateway

---

## Need Help?

If you're still seeing 403 errors after creating the new token:

1. Verify the token has "Workers for Platforms" permission
2. Check that `CLOUDFLARE_ACCOUNT_ID` is set correctly
3. Ensure your account has access to Workers for Platforms (may require paid plan)
4. Contact Cloudflare Support if you need Workers for Platforms enabled

---

## Reference Links

- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Workers for Platforms Docs](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
