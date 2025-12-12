# Secrets Injection Script Template
# DO NOT add actual secret values to this file.
# Use this template and set values via secure means (e.g., environment variables, 1Password CLI).

$secrets = @{
    "PERPLEXITY_API_KEY" = $env:PERPLEXITY_API_KEY
    "MODAL_API_KEY" = $env:MODAL_API_KEY
    "MODAL_TOKEN_SECRET" = $env:MODAL_TOKEN_SECRET
    "PAYPAL_CLIENT_ID" = $env:PAYPAL_CLIENT_ID
    "PAYPAL_CLIENT_SECRET" = $env:PAYPAL_CLIENT_SECRET
    "STRIPE_SECRET_KEY" = $env:STRIPE_SECRET_KEY
    "RESEND_API_KEY" = $env:RESEND_API_KEY
    "TELEGRAM_BOT_TOKEN" = $env:TELEGRAM_BOT_TOKEN
    "TAVILY_API_KEY" = $env:TAVILY_API_KEY
    "SUPABASE_SERVICE_ROLE_KEY" = $env:SUPABASE_SERVICE_ROLE_KEY
}

foreach ($key in $secrets.Keys) {
    if ($secrets[$key]) {
        Write-Host "Setting secret: $key"
        $secrets[$key] | npx wrangler secret put $key
    } else {
        Write-Host "Skipping $key - environment variable not set"
    }
}

Write-Host "Secrets injection complete!"
