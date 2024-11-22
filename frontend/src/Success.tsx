import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, DownloadIcon } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 10,
  },
  licenseKey: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
});

// PDF Document component
const LicenseKeyPDF: React.FC<{ licenseKey: string }> = ({ licenseKey }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>License Key</Text>
        <Text style={styles.text}>Thank you for your purchase. Here is your license key:</Text>
        <Text style={styles.licenseKey}>{licenseKey}</Text>
        <Text style={styles.text}>Please keep this information safe and do not share it with others.</Text>
      </View>
    </Page>
  </Document>
);

export default function Success() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      fetch(`${BACKEND_URL}/api/check-payment-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setStatus('success');
            setLicenseKey(data.licenseKey);
          } else {
            throw new Error(data.error || 'Unknown error occurred');
          }
        })
        .catch((error) => {
          setStatus('error');
          setErrorMessage(error.message || 'An unexpected error occurred');
        });
    } else {
      setStatus('error');
      setErrorMessage('No session ID found');
    }
  }, [location]);

  const DownloadPDFButton: React.FC<{ licenseKey: string }> = ({ licenseKey }) => (
    <BlobProvider document={<LicenseKeyPDF licenseKey={licenseKey} />}>
      {({ blob, url, loading, error }) => (
        <a
          href={url || '#'}
          download="license_key.pdf"
          className={`inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors ${loading || error ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={(e) => {
            if (loading || error) {
              e.preventDefault();
            }
          }}
        >
          {loading ? (
            'Generating PDF...'
          ) : error ? (
            'Error generating PDF'
          ) : (
            <>
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download PDF
            </>
          )}
        </a>
      )}
    </BlobProvider>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
      >
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg">Processing your payment...</p>
          </div>
        )}

        {status === 'success' && licenseKey && (
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold mt-4 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Thank you for your purchase.</p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="font-semibold">Your License Key:</p>
              <p className="font-mono text-sm break-all mb-2">{licenseKey}</p>
              <DownloadPDFButton licenseKey={licenseKey} />
            </div>
            <Link
              to="/"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold mt-4 mb-2">Payment Status</h2>
            <p className="text-red-600 mb-4">
              There was an error processing your payment. Please contact support.
            </p>
            {errorMessage && (
              <p className="text-sm text-gray-600 mb-4">Error details: {errorMessage}</p>
            )}
            <Link
              to="/"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

