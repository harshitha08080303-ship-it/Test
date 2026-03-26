const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// QR Generation API
app.post('/generate-qr', async (req, res) => {
try {
console.log('Incoming body:', req.body);

    const url = req.body && req.body.url;

    if (!url) {
        return res.status(400).json({
            success: false,
            error: 'URL is required'
        });
    }

    const qrSvg = await QRCode.toString(url, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300
    });

    const base64Svg = Buffer.from(qrSvg).toString('base64');

    res.json({
        success: true,
        dataUri: `data:image/svg+xml;base64,${base64Svg}`
    });

} catch (error) {
    console.error('Error generating QR:', error);

    res.status(500).json({
        success: false,
        error: 'Failed to generate QR code'
    });
}
```

});

// Health check
app.get('/', (req, res) => {
res.send('QR Code Generator API is running 🚀');
});

app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});
