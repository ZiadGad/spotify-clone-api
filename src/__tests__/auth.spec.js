const request = require('supertest');
const User = require('../models/User');
const app = require('../app');
const bcrypt = require('bcryptjs');
const { mongoConnect, mongoDisconnect } = require('../config/db');
const {
  describe,
  beforeAll,
  afterAll,
  it,
  expect,
  afterEach,
} = require('@jest/globals');

beforeAll(async () => await mongoConnect());
afterAll(async () => await mongoDisconnect());
afterEach(async () => await User.deleteMany({}));

const UserRegisterData = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

const UserLoginData = {
  email: 'test@example.com',
  password: 'password123',
};

describe('Auth Controller', () => {
  describe('POST /api/v1/users/login', () => {
    it('should login a user and return a token', async () => {
      await User.create(UserRegisterData);

      const res = await request(app)
        .post('/api/v1/users/login')
        .send(UserLoginData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(UserLoginData.email);
    });

    it('should return error if no data is provided', async () => {
      const res = await request(app).post('/api/v1/users/login').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.errors).toBeDefined();
    });

    it('should return error if password is incorrect', async () => {
      await User.create(UserRegisterData);

      const incorrectUserData = {
        ...UserLoginData,
        password: 'wrongpassword',
      };

      const res = await request(app)
        .post('/api/v1/users/login')
        .send(incorrectUserData);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBeDefined();
      expect(res.body.msg).toBeDefined();
    });
  });

  describe('POST /api/v1/users/register', () => {
    it('should create user', async () => {
      const res = await request(app)
        .post('/api/v1/users/register')
        .send(UserRegisterData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
    });

    it('should send error if no data sent', async () => {
      const res = await request(app).post('/api/v1/users/register').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].msg).toBeDefined();
      expect(res.body.user).not.toBeDefined();
    });

    it('should send error if user already exists', async () => {
      await User.create(UserRegisterData);
      const res = await request(app)
        .post('/api/v1/users/register')
        .send(UserRegisterData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.msg).toBeDefined();
    });
  });
});
