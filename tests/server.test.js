const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../index');

beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/xatkit-spl');
});

describe('GET /', () => {
    it('should return 200 OK', () => {
        return request(app).get('/').expect(200);
    });
});

afterAll(async () => {
    await mongoose.disconnect();
});