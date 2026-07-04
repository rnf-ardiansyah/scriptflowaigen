import handler from '../dist/server/server.js';

export default async function(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' 
      ? await new Promise(resolve => {
          const chunks = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', () => resolve(Buffer.concat(chunks)));
        })
      : undefined,
  });
  
  const response = await handler.fetch(request);
  
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  
  const body = await response.arrayBuffer();
  res.end(Buffer.from(body));
}

export const config = {
  api: {
    bodyParser: false,
  },
};
