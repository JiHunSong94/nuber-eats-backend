import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    const dataSource = new DataSource({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'songjihun',
      password: '12345',
      database: 'nuber-eats-test',
    });
    await dataSource.initialize();
    await dataSource.dropDatabase();
    await dataSource.destroy();
    app.close();
  });

  describe('createAccount', () => {
    const EMAIL = 'song@jihun.com';
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          createAccount(input: {
            email:"${EMAIL}",
            password:"12345",
            role:Owner
          }) {
            ok
            error
          }
        }`,
        })
        .expect(200)
        .expect((response) => {
          expect(response.body.data.createAccount.ok).toBe(true);
          expect(response.body.data.createAccount.error).toBe(null);
        });
    });
    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          createAccount(input: {
            email:"${EMAIL}",
            password:"12345",
            role:Owner
          }) {
            ok
            error
          }
        }`,
        })
        .expect(200)
        .expect((response) => {
          expect(response.body.data.createAccount.ok).toBe(false);
          expect(response.body.data.createAccount.error).toBe(
            'There is a user with that email already.',
          );
        });
    });
  });

  it.todo('me');
  it.todo('userProfile');
  it.todo('login');
  it.todo('editProfile');
  it.todo('verifyEmail');
});