require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// Bundle and Product Configurations
const bundleConfig = {
  'AdvancedBundle': {
    name: 'Advanced Bundle',
    type: 'bundle',
    extensions: ['Canvabulkbg', 'Ideobot', 'Midbot', 'AdvancedTool'],
    prices: {
      monthly: { price: '$39.99/month', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$399.99/year', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$799.99 one-time', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
  'ProBundle': {
    name: 'Pro Bundle',
    type: 'bundle',
    extensions: ['Canvabulkbg', 'Ideobot', 'Midbot'],
    prices: {
      monthly: { price: '$29.99/month', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$299.99/year', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$599.99 one-time', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
  'StarterBundle': {
    name: 'Starter Bundle',
    type: 'bundle',
    extensions: ['Canvabulkbg', 'Ideobot'],
    prices: {
      monthly: { price: '$19.99/month', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$199.99/year', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$399.99 one-time', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
};

const licenseProductConfig = {
  'PIKBOT': {
    name: 'PIKBOT',
    type: 'license',
    prices: {
      monthly: { price: '$9.99/month', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$99.99/year', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$199.99 one-time', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
  'AdvancedTool': {
    name: 'Advanced Tool',
    type: 'license',
    prices: {
      monthly: { price: '$14.99/month', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$149.99/year', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$299.99 one-time', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
};

// Firebase Admin SDK initialization
const serviceAccount = require('./config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate a license key (only for license products)
function generateLicenseKey(email, productId, plan) {
  const data = `${email}|${productId}|${plan}|${Date.now()}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return `${productId.toUpperCase()}-${hash.substr(0, 6)}-${hash.substr(6, 6)}-${hash.substr(12, 6)}-${hash.substr(18, 6)}`;
}

// Calculate expiration date based on plan (only for license products)
function calculateExpirationDate(plan) {
  const now = new Date();
  switch (plan) {
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'yearly':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    case 'lifetime':
      return null; // No expiration for lifetime plans
    default:
      throw new Error('Invalid plan');
  }
}

// Authentication endpoint
app.post('/api/auth', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;
    
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({
          email,
          displayName: payload.name,
          photoURL: payload.picture,
          emailVerified: payload.email_verified,
        });
      } else {
        throw error;
      }
    }

    const firebaseToken = await admin.auth().createCustomToken(userRecord.uid);
    
    await db.collection('users').doc(email).set({
      displayName: payload.name,
      email: payload.email,
      photoURL: payload.picture,
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    res.json({ 
      success: true, 
      user: {
        displayName: payload.name,
        email: payload.email,
        photoURL: payload.picture
      },
      firebaseToken 
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
});

// Create checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { productId, plan, email } = req.body;
    let product;

    if (bundleConfig[productId]) {
      product = bundleConfig[productId];
    } else if (licenseProductConfig[productId]) {
      product = licenseProductConfig[productId];
    } else {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: product.prices[plan].id, quantity: 1 }],
      mode: plan === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      client_reference_id: email,
      metadata: { productId, plan, email },
    });

    res.json({ sessionId: session.id, sessionUrl: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Check payment status and return license key if available
app.post('/api/check-payment-status', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      throw new Error('No session ID provided');
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      throw new Error('Invalid session ID');
    }

    const { email, productId, plan } = session.metadata;
    if (!email || !productId || !plan) {
      throw new Error('Missing required metadata');
    }

    let licenseKey = null;
    let product;

    if (bundleConfig[productId]) {
      product = bundleConfig[productId];
    } else if (licenseProductConfig[productId]) {
      product = licenseProductConfig[productId];
    } else {
      throw new Error('Invalid product ID');
    }

    if (product.type === 'license') {
      // Check if the license key already exists
      const existingLicenseQuery = await db.collection('licenses')
        .where('email', '==', email)
        .where('productId', '==', productId)
        .where('plan', '==', plan)
        .limit(1)
        .get();

      if (!existingLicenseQuery.empty) {
        licenseKey = existingLicenseQuery.docs[0].id;
      }
    }

    if (!licenseKey && product.type === 'license') {
      // If the license key doesn't exist, process the payment
      licenseKey = await processPayment(session, email, productId, plan);
    } else if (product.type === 'bundle') {
      // For bundles, just process the payment without generating a license key
      await processPayment(session, email, productId, plan);
    }

    res.json({ success: true, licenseKey });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to process payment and generate license key
async function processPayment(session, email, productId, plan) {
  let product;
  if (bundleConfig[productId]) {
    product = bundleConfig[productId];
  } else if (licenseProductConfig[productId]) {
    product = licenseProductConfig[productId];
  } else {
    throw new Error('Invalid product ID');
  }

  const subscriptionData = {
    plan,
    status: 'active',
    startDate: admin.firestore.FieldValue.serverTimestamp(),
    endDate: plan === 'lifetime' ? null : admin.firestore.FieldValue.serverTimestamp(),
    stripeCustomerId: session.customer,
    stripeEmail: session.customer_details.email,
    stripeSubscriptionId: session.subscription,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
  };

  const userRef = db.collection('users').doc(email);

  let licenseKey = null;
  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const subscriptions = userDoc.data().subscriptions || {};

    if (product.type === 'license') {
      const existingLicenseQuery = await transaction.get(
        db.collection('licenses')
          .where('email', '==', email)
          .where('productId', '==', productId)
          .where('plan', '==', plan)
          .limit(1)
      );

      if (!existingLicenseQuery.empty) {
        licenseKey = existingLicenseQuery.docs[0].id;
      } else {
        licenseKey = generateLicenseKey(email, productId, plan);
        const licenseData = {
          key: licenseKey,
          email,
          productId,
          plan,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'inactive',
          activatedAt: null,
          expiresAt: null,
        };

        const licenseRef = db.collection('licenses').doc(licenseKey);
        transaction.set(licenseRef, licenseData);
      }

      subscriptions[productId] = { ...subscriptionData, licenseKey };
    } else {
      // For bundles, we don't generate a license key
      product.extensions.forEach(extension => {
        subscriptions[extension] = subscriptionData;
      });
    }

    transaction.update(userRef, { subscriptions });
  });
  
  return licenseKey;
}

// Check subscription status
app.get('/api/check-subscription/:email', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.email).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ subscriptions: userDoc.data().subscriptions || {} });
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});

// License activation endpoint (only for license products)
app.post('/api/activate-license', async (req, res) => {
  try {
    const { licenseKey, productId } = req.body;
    const licenseDoc = await db.collection('licenses').doc(licenseKey).get();

    if (!licenseDoc.exists) {
      return res.status(404).json({ success: false, message: 'License key not found' });
    }

    const licenseData = licenseDoc.data();
    if (licenseData.status === 'active') {
      return res.status(400).json({ success: false, message: 'License has already been activated' });
    }

    if (licenseData.productId !== productId) {
      return res.status(400).json({ success: false, message: 'Invalid product for this license' });
    }

    const expirationDate = calculateExpirationDate(licenseData.plan);

    // Update the license document with activation info
    await db.collection('licenses').doc(licenseKey).update({
      status: 'active',
      activatedAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: expirationDate,
    });

    res.json({ 
      success: true, 
      message: 'License activated successfully',
      expiresAt: expirationDate
    });
  } catch (error) {
    console.error('License activation error:', error);
    res.status(500).json({ success: false, message: 'Failed to activate license' });
  }
});

// License validation endpoint (only for license products)
app.post('/api/validate-license', async (req, res) => {
  try {
    const { licenseKey, productId } = req.body;
    const licenseDoc = await db.collection('licenses').doc(licenseKey).get();

    if (!licenseDoc.exists) {
      return res.status(404).json({ success: false, message: 'License key not found' });
    }

    const licenseData = licenseDoc.data();
    if (licenseData.status !== 'active') {
      return res.status(400).json({ success: false, message: 'License is not active' });
    }

    if (licenseData.productId !== productId) {
      return res.status(400).json({ success: false, message: 'Invalid product for this license' });
    }

    if (licenseData.expiresAt && new Date() > licenseData.expiresAt.toDate()) {
      return res.status(400).json({ success: false, message: 'License has expired' });
    }

    res.json({ success: true, message: 'License is valid', expiresAt: licenseData.expiresAt });
  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({ success: false, message: 'Failed to validate license' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

