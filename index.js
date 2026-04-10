const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// QR Generation API (Multiple მხარდაჭერა)
app.post('/generate-qr', async (req, res) => {
    try {
        console.log('Incoming body:', req.body);

        const items = req.body && req.body.items;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'items array is required'
            });
        }

        const results = [];

        for (const item of items) {
            const { id, url } = item;

            if (!url) {
                results.push({
                    id: id || null,
                    success: false,
                    error: 'URL is missing'
                });
                continue;
            }

            try {
                const qrSvg = await QRCode.toString(url, {
                    type: 'svg',
                    errorCorrectionLevel: 'H',
                    margin: 2,
                    width: 300
                });

                const base64Svg = Buffer.from(qrSvg).toString('base64');

                results.push({
                    id: id || null,
                    success: true,
                    dataUri: `data:image/svg+xml;base64,${base64Svg}`
                });

            } catch (err) {
                results.push({
                    id: id || null,
                    success: false,
                    error: 'QR generation failed'
                });
            }
        }

        res.json({
            success: true,
            count: results.length,
            results: results
        });

    } catch (error) {
        console.error('Error generating QR:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to generate QR codes'
        });
    }
});

// Health check
app.get('/', (req, res) => {
    res.send('QR Code Generator API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
