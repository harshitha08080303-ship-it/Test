const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 Request size limit
app.use(express.json({ limit: '1mb' }));

// 🌐 CORS
app.use(cors());

// 🚦 Rate limiting (protects from overload / retries)
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100             // max 100 requests per minute
});
app.use(limiter);

// ⏱️ Timeout protection
app.use((req, res, next) => {
    res.setTimeout(10000, () => {
        res.status(408).json({ success: false, error: 'Request timeout' });
    });
    next();
});

// 🔥 QR Generation API (Bulk)
app.post('/generate-qr', async (req, res) => {
    try {
        const items = req.body?.items;

        // ✅ Validate input
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'items array is required'
            });
        }

        // 🔒 Protect server
        if (items.length > 50) {
            return res.status(400).json({
                success: false,
                error: 'Max 50 items allowed per request'
            });
        }

        console.log(`QR request received: ${items.length} items`);

        // ⚡ Parallel processing
        const results = await Promise.all(
            items.map(async (item) => {
                const { id, url } = item;

                if (!url) {
                    return {
                        id: id || null,
                        success: false,
                        error: 'URL is missing'
                    };
                }

                try {
                    const qrSvg = await QRCode.toString(url, {
                        type: 'svg',
                        errorCorrectionLevel: 'H',
                        margin: 2,
                        width: 300
                    });

                    const base64Svg = Buffer.from(qrSvg).toString('base64');

                    return {
                        id: id || null,
                        success: true,
                        dataUri: `data:image/svg+xml;base64,${base64Svg}`
                    };

                } catch (err) {
                    return {
                        id: id || null,
                        success: false,
                        error: 'QR generation failed'
                    };
                }
            })
        );

        res.json({
            success: true,
            count: results.length,
            results
        });

    } catch (error) {
        console.error('Error generating QR:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to generate QR codes'
        });
    }
});

// 🩺 Health check
app.get('/', (req, res) => {
    res.send('QR Code Generator API is running');
});

// 🚀 Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
