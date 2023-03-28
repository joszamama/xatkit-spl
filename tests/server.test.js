const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../index');

beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/xatkit-spl');
});

describe("Home Route Test", () => {
    it("Should return 200 OK", () => {
        return request(app).get("/").then((response) => {
            expect(response.status).toBe(200);
        })
    });
});

afterAll(async () => {
    await mongoose.disconnect(
        console.log("Disconnected from database")
    );
});