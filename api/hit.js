// api/hit.js
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const counterFile = path.join(process.cwd(), 'counter.json');

  let count = 0;
  if (fs.existsSync(counterFile)) {
    count = JSON.parse(fs.readFileSync(counterFile, 'utf8')).count;
  }

  count++;

  fs.writeFileSync(counterFile, JSON.stringify({ count }));

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ hits: count });
}
