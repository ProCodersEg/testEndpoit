const { google } = require('googleapis');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { purchaseToken, packageName, sku } = req.body;

        if (!purchaseToken || !packageName || !sku) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        try {
            // Initialize the Google Play Developer API client
            const auth = new google.auth.GoogleAuth({
                scopes: ['https://www.googleapis.com/auth/androidpublisher'],
            });

            const oauth2Client = await auth.getClient();
            google.options({ auth: oauth2Client });

            const playDeveloperAPI = google.androidpublisher('v3');

            // Call the Google Play Developer API to validate the purchase
            const response = await playDeveloperAPI.purchases.products.get({
                packageName,
                productId: sku,
                token: purchaseToken,
            });

            const purchase = response.data;

            if (purchase.purchaseState === 0) {
                // Purchase is valid
                return res.status(200).json({ message: 'Purchase valid' });
            } else {
                // Purchase is invalid or refunded
                return res.status(400).json({ message: 'Purchase invalid' });
            }
        } catch (error) {
            console.error('Error validating purchase:', error);
            return res.status(500).json({ message: 'Error validating purchase' });
        }
    } else {
        // Return error for unsupported HTTP method
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
};
