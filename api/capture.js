export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  try {
    const params = new URLSearchParams({
      url,
      screenshot: 'true',
      meta: 'false',
      'viewport.width': '1280',
      'viewport.height': '900',
      'screenshot.fullPage': 'true',
      'screenshot.type': 'jpeg',
      waitForTimeout: '5000',
    });

    const mlRes = await fetch(`https://api.microlink.io?${params}`);
    const mlData = await mlRes.json();

    if (mlData.status !== 'success' || !mlData.data?.screenshot?.url) {
      return res.status(502).json({ error: mlData.message || 'No se pudo capturar la página' });
    }

    const imgRes = await fetch(mlData.data.screenshot.url);
    if (!imgRes.ok) return res.status(502).json({ error: 'No se pudo descargar la captura' });

    const buffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

    return res.status(200).json({
      screenshotDataUrl: `data:${contentType};base64,${base64}`,
      capturedAt: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Error desconocido' });
  }
}
