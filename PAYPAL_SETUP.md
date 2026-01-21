# PayPal Integration Setup

## Environment Variables Required

Add the following environment variables to your `.env.local` file:

```env
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_MODE=sandbox  # Use 'sandbox' for testing, 'live' for production
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Your app URL for redirects
```

## Getting PayPal Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in or create an account
3. Navigate to "My Apps & Credentials"
4. Create a new app (Sandbox for testing, Live for production)
5. Copy the Client ID and Secret

## Testing

1. In sandbox mode, use PayPal sandbox test accounts
2. Test the payment flow: Choose PayPal → Redirect to PayPal → Complete payment → Redirect back to success page
3. Verify the enrollment is marked as PAID in your database

## Features Added

- ✅ PayPal payment option alongside UPI
- ✅ PayPal order creation and capture
- ✅ PayPal webhook support
- ✅ Automatic enrollment confirmation on successful payment
- ✅ Payment success page handles both UPI and PayPal payments

## Currency Conversion

Currently, the system converts INR to USD at a fixed rate (approximately 83:1). For production, you may want to:
- Use a real-time currency conversion API
- Store conversion rates in your database
- Allow PayPal payments in INR if your PayPal account supports it

