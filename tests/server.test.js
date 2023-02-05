const request = require('supertest');
const fetchMock = require('jest-fetch-mock');
const app = require('../index');

fetchMock.enableMocks();

describe("Hello World Route Test", () => {
    it("Should return 200 OK", () => {
        return request(app).get("/").then((response) => {
            expect(response.status).toBe(200);
        })
    });
});