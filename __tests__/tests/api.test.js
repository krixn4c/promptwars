const request = require('supertest');
const app = require('../app');

describe('GET /health', () => {
  it('returns 200 and ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('ok');
  });
});

describe('POST /api/analyze', () => {
  it('returns 400 when no text or image is provided', async () => {
    const res = await request(app).post('/api/analyze').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('accepts a text-only request', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ text: 'small cut on my hand, minor bleeding' });
    expect(res.statusCode).toBe(200);
  });

  it('returned JSON matches the expected schema shape', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ text: 'small cut on my hand' });
    expect(res.body).toHaveProperty('severity');
    expect(res.body).toHaveProperty('safe_actions');
    expect(res.body).toHaveProperty('warnings');
    expect(Array.isArray(res.body.safe_actions)).toBe(true);
  });
});