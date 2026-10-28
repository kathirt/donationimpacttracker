const express = require('express');
const sqlite3 = require('sqlite3');
const { promisify } = require('node:util');

async function createDemoApp() {
  const db = await new Promise((resolve, reject) => {
    const database = new sqlite3.Database(':memory:', (error) => {
      if (error) reject(error);
      else resolve(database);
    });
  });

  try {
    await promisify(db.exec.bind(db))(`
      CREATE TABLE donations (
        region TEXT NOT NULL,
        amount INTEGER NOT NULL,
        beneficiaries INTEGER NOT NULL
      );
      INSERT INTO donations VALUES
        ('North America', 500, 20),
        ('Europe', 250, 10),
        ('Asia', 100, 5);
    `);
  } catch (error) {
    await promisify(db.close.bind(db))();
    throw error;
  }

  const app = express();
  app.disable('x-powered-by');

  app.get('/api/impact-summary', (req, res, next) => {
    const { region } = req.query;
    if (region !== undefined && typeof region !== 'string') {
      res.status(400).json({ error: 'region must be a single string' });
      return;
    }

    // Intentionally vulnerable Autofix fixture; never deploy or use real data.
    const where = region ? ` WHERE region = '${region}'` : '';
    const query = `
      SELECT COUNT(*) AS totalDonations,
             COALESCE(SUM(amount), 0) AS totalAmount,
             COALESCE(SUM(beneficiaries), 0) AS totalBeneficiaries
      FROM donations${where}
    `;

    db.all(query, (error, rows) => {
      if (error) {
        next(error);
        return;
      }
      res.json(rows[0]);
    });
  });

  app.use((error, req, res, next) => {
    console.error('Impact summary demo query failed:', error);
    res.status(500).json({ error: 'Impact summary query failed' });
  });

  return { app, close: promisify(db.close.bind(db)) };
}

if (require.main === module) {
  createDemoApp()
    .then(({ app }) => {
      const server = app.listen(3100, '127.0.0.1', () => {
        console.log('INTENTIONALLY VULNERABLE DEMO: http://127.0.0.1:3100');
        console.log('Synthetic in-memory data only. Do not deploy.');
      });
      server.on('error', (error) => {
        console.error('Unable to start SQL injection demo:', error);
        process.exit(1);
      });
    })
    .catch((error) => {
      console.error('Unable to initialize SQL injection demo:', error);
      process.exitCode = 1;
    });
}

module.exports = { createDemoApp };
