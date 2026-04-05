import express from 'express';
import { config } from './config.mjs';
import {
  getChainAggregate,
  getChainSummary,
  getHealth,
  getNodeItems,
  getNodeStats,
  searchIndustry,
} from './query.mjs';

const app = express();

app.disable('x-powered-by');

app.get('/health', (_req, res) => {
  res.json(getHealth());
});

app.get('/industry/chains/:chainKey/summary', (req, res) => {
  const { chainKey } = req.params;
  const { province, city } = req.query;
  res.json(getChainSummary(chainKey, province, city));
});

app.get('/industry/chains/:chainKey/aggregate/:type', (req, res) => {
  const { chainKey, type } = req.params;
  const { province, city, page = '1', pageSize = '10' } = req.query;
  res.json(
    getChainAggregate(
      chainKey,
      type,
      province,
      city,
      Number(page),
      Number(pageSize),
    ),
  );
});

app.get('/industry/nodes/stats', (req, res) => {
  const { chainKey, nodeName, province, city } = req.query;
  if (!chainKey || !nodeName) {
    res.status(400).json({ error: 'chainKey and nodeName are required' });
    return;
  }

  const result = getNodeStats(chainKey, nodeName, province, city);
  if (!result) {
    res.status(404).json({ error: 'node not found' });
    return;
  }

  res.json(result);
});

app.get('/industry/nodes/items', (req, res) => {
  const {
    chainKey,
    nodeName,
    type,
    province,
    city,
    page = '1',
    pageSize = '10',
  } = req.query;

  if (!chainKey || !nodeName || !type) {
    res.status(400).json({ error: 'chainKey, nodeName and type are required' });
    return;
  }

  res.json(
    getNodeItems(
      chainKey,
      nodeName,
      type,
      province,
      city,
      Number(page),
      Number(pageSize),
    ),
  );
});

app.get('/industry/search', (req, res) => {
  const { q = '', province, city, limit = '50' } = req.query;
  res.json(searchIndustry(q, province, city, Number(limit)));
});

app.use((error, _req, res, _next) => {
  console.error('[industry-demo-api] request failed', error);
  res.status(500).json({
    error: 'internal_error',
    message: error instanceof Error ? error.message : 'Unknown error',
  });
});

app.listen(config.port, config.host, () => {
  console.log(`[industry-demo-api] listening on http://${config.host}:${config.port}`);
});
