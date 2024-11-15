require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { OAuth2Client } = require('google-auth-library');

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin SDK initialization
const serviceAccount = {
  type: "service_account",
  project_id: "extension-bundles",
  private_key_id: "80bfadc1c6e1bb8e6a47bbbef5d2c79153fe036d",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDN5bdTdYxJNjvG\nCBLKIW8ccY45bv8sL3L+gOGaGjI6G2navgUXK6yXMEs1kUj6rlspZr/XTd2Nz4gL\naG1gWFavpdc6NOhzy9nbCp6Du0gR2pMj2NxddtYNt6idmhY40rCuYqynCMhrUvdz\naPJsbVqIBHhhe/LH26OgUoTYjOIkPlz5EFA0ajI+RCCfLF+jmIH88sODAOdtmu9i\nh1sX4aWsM5cUyoeqIIGqwGeRFhIgJEDbi1BKPxAVlGNX2tDzeC5WfJ8YsCK0jXcY\ntdeacXBOctDuehe8wOU5UF3/FV9SCJ8oYX/4k74D9w055Pl9eCYG9D7tLaMIRuw8\nfAOcE7LbAgMBAAECggEAFySNNkX4eQ4t1R95L9u8MnVCaDWQBvZlCt2PqL5DC6xN\nz0wbzwlArVRnT7kUe+DMgbB5OwkXMGZgQ0VUmJy1Tv7pXIiFNubLMPIA8+DsGTL5\nO5vs1ls8yhlCTEdSh3E0chVzPz8fJTkTyUFwO5G7DZ4lrcdnIuG5guljjIz2qjNe\nAI6sHgk7Z1DB3J1Wt2BkntHQ3SeV0HOBOfrkALF26qcoYdi7otnt6jCczVhDfqtQ\nIjv7icuoI5Soa1LUMttu4z3VMln4covohqQt6fMEJ72lzL+7l1QUEYVH/4Jw9L6n\nBWmk0qRKTniUT/0W+RnZNNqVJdhd5bzu6RiIA869UQKBgQDoHdERtXhZS+VmLJuz\n53mr9Xr44nebutwPy0IqAKpsrk268z9VfHq79jIj206ZFXBHsfVcuDk9RFlAq99h\nJwmgeKxyXhEUmsLAZmaKzNMLSNqwVCLN+NUMxzljWkwi7FvZ6tQECMVkyENaPlv3\na99FUnLI4E1JkV79ds7tuXb7qQKBgQDjFUK4GBltVVcTmTQCNZ+qGChA6ixbQSyc\nR/7LguvYknaOrb5kpGC9BkmPBUqE7fgeXRLZVv6KD2A6aJaLBVW3AHWyvZe3uOmA\nhWhuGniRhny/IYWl5IHzqM0xUSTrqQElhr3uy8xelPNrguILvCV/6uapM/eD6sQL\nnawHCLWs4wKBgCnTHZYETgBBJb/Ib/H11r2+iP8Jx6WfAQIzjOOGpS7aJZV3OUVN\nHcx6q0Q8wyfgbg/tKBoh8+ZvR2nYznJyF1D8DY66FnfQ/yCuEvIVwD17TjSRpIfa\nu4EG8PdPEQMF9fMJVlS3w+HKGCDNtcKahGu4VIiPqj2EXUpsuxKo5aCpAoGAR0uF\nhwcJ9Km2jRCso4TyfBTZjof3JS9xMh/ofzy7j2NslZ83B6IUPUScE6s1mkacf+v4\n3wPRJsdtDumHWl5yauJaEaQ03hnQNemsv+TPteDjiZ6ct1jm8/krczBmxxZopb+I\nIlEZ+RgK1NZi4gxQObkmcjk+nMw4gO0f9ZVmdMECgYBNmCo06VNV3dHyAmL0WaXQ\neDXifAbfB16Lj8RVdcKmmGRaMdi2nxWQ5rgj/jXA489jJUlHK8jTWIgu+3FziaZZ\nF0ie0cQ7vcluNl0CSvS/Mt4VU3N0+QlIBMXDOyIMqLQKUv2Ru7z+RSSzumiT6+xG\n6k3wJ9N06CoKV/SwWFFTLQ==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-zbhn1@extension-bundles.iam.gserviceaccount.com",
  client_id: "104522763994872084724",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-zbhn1%40extension-bundles.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Bundle configuration
const bundleConfig = {
  'ProBundle': {
    name: 'Pro Bundle',
    extensions: ['Canvabulkbg', 'Ideobot', 'Midbot'],
    prices: {
      monthly: 'price_1Q79IwEUAhHysq2jWpJ8wFXv',
      yearly: 'price_1Q79JWEUAhHysq2jOFqMGYsU',
      lifetime: 'price_1Q79JyEUAhHysq2jtihJTIc4',
    },
  },
  'StarterBundle': {
    name: 'Starter Bundle',
    extensions: ['Canvabulkbg', 'Ideobot'],
    prices: {
      monthly: 'price_1Q79IwEUAhHysq2jWpJ8wFXv',
      yearly: 'price_1Q79JWEUAhHysq2jOFqMGYsU',
      lifetime: 'price_1Q79JyEUAhHysq2jtihJTIc4',
    },
  },
  'AdvancedBundle': {
    name: 'Advanced Bundle',
    extensions: ['Canvabulkbg', 'Ideobot', 'Midbot', 'AdvancedTool'],
    prices: {
      monthly: 'price_1Q79IwEUAhHysq2jWpJ8wFXv',
      yearly: 'price_1Q79JWEUAhHysq2jOFqMGYsU',
      lifetime: 'price_1Q79JyEUAhHysq2jtihJTIc4',
    },
  },
  'UltimateBundle': {
    name: 'Ultimate Bundle',
    extensions: ['Canvabulkbg', 'Ideobot', 'Midbot', 'AdvancedTool', 'PremiumFeature'],
    prices: {
      monthly: 'price_1Q79IwEUAhHysq2jWpJ8wFXv',
      yearly: 'price_1Q79JWEUAhHysq2jOFqMGYsU',
      lifetime: 'price_1Q79JyEUAhHysq2jtihJTIc4',
    },
  },
  'CustomBundle': {
    name: 'Custom Bundle',
    extensions: ['CustomTool1', 'CustomTool2'],
    prices: {
      monthly: 'price_1Q79IwEUAhHysq2jWpJ8wFXv',
      yearly: 'price_1Q79JWEUAhHysq2jOFqMGYsU',
      lifetime: 'price_1Q79JyEUAhHysq2jtihJTIc4',
    },
  },
};

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
    const { bundleId, plan, email } = req.body;
    const bundle = bundleConfig[bundleId];
    
    if (!bundle) {
      return res.status(400).json({ error: 'Invalid bundle ID' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: bundle.prices[plan], quantity: 1 }],
      mode: plan === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      client_reference_id: email,
      metadata: { bundleId, plan, email },
    });

    res.json({ sessionId: session.id, sessionUrl: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle successful payment
app.post('/api/payment-success', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const { email, bundleId, plan } = session.metadata;
    const bundle = bundleConfig[bundleId];

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
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const subscriptions = userDoc.data().subscriptions || {};
    bundle.extensions.forEach(extension => {
      subscriptions[extension] = subscriptionData;
    });

    await userRef.update({ subscriptions });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));