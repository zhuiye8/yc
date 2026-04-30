import express from 'express';
import { config } from './config.mjs';
import {
  getChainAggregate,
  getChainCityDistribution,
  getChainProvinceDistribution,
  getChainSummary,
  getHealth,
  getNodeGroupItems,
  getNodeGroupStats,
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

app.get('/industry/chains/:chainKey/city-distribution', (req, res) => {
  const { chainKey } = req.params;
  const { province } = req.query;
  if (!province) {
    res.status(400).json({ error: 'province is required' });
    return;
  }
  res.json(getChainCityDistribution(chainKey, province));
});

app.get('/industry/chains/:chainKey/province-distribution', (req, res) => {
  const { chainKey } = req.params;
  res.json(getChainProvinceDistribution(chainKey));
});

app.get('/industry/chains/:chainKey/aggregate/:type', (req, res) => {
  const { chainKey, type } = req.params;
  const { province, city, page = '1', pageSize = '10', tags = '' } = req.query;
  res.json(
    getChainAggregate(
      chainKey,
      type,
      province,
      city,
      Number(page),
      Number(pageSize),
      tags,
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

app.get('/industry/nodes/group-stats', (req, res) => {
  const { chainKey, nodeName = '', nodeNames = '', province, city } = req.query;
  if (!chainKey || !nodeNames) {
    res.status(400).json({ error: 'chainKey and nodeNames are required' });
    return;
  }

  res.json(
    getNodeGroupStats(
      chainKey,
      nodeName,
      String(nodeNames).split('\n'),
      province,
      city,
    ),
  );
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
    tags = '',
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
      tags,
    ),
  );
});

app.get('/industry/nodes/group-items', (req, res) => {
  const {
    chainKey,
    nodeName = '',
    nodeNames = '',
    type,
    province,
    city,
    page = '1',
    pageSize = '10',
    tags = '',
  } = req.query;

  if (!chainKey || !nodeNames || !type) {
    res.status(400).json({ error: 'chainKey, nodeNames and type are required' });
    return;
  }

  res.json(
    getNodeGroupItems(
      chainKey,
      nodeName,
      String(nodeNames).split('\n'),
      type,
      province,
      city,
      Number(page),
      Number(pageSize),
      tags,
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
