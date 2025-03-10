const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // تأكدي من أن المسار يشير إلى app.js
const Answer = require('../models/Answer');

describe('Answers Controller', () => {
  let request;

  // قبل كل الاختبارات، إعداد Supertest والتحقق من الاتصال
  before(async () => {
    request = supertest(app);
    // الاعتماد على الاتصال الموجود من app.js
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.TEST_MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Test DB Connected');
    } else {
      console.log('Using existing MongoDB connection');
    }
  });

  // بعد كل اختبار، مسح البيانات من قاعدة البيانات
  afterEach(async () => {
    await Answer.deleteMany({});
  });

  // بعد كل الاختبارات، يمكننا ترك الاتصال مفتوحًا إذا كان التطبيق يعتمد عليه
  after(async () => {
    // await mongoose.connection.close(); // اختياري، يمكن تفعيله إذا لزم الأمر
  });

  describe('GET /answers', () => {
    it('should return all answers', async () => {
      const answer = new Answer({ content: 'Test Answer', isCorrect: true, questionId: '12345' });
      await answer.save();

      const res = await request.get('/answers');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(1);
      expect(res.body[0].content).to.equal('Test Answer');
    });

    it('should handle errors', async () => {
      const stub = sinon.stub(mongoose.Model, 'find').rejects(new Error('Database error'));
      const res = await request.get('/answers');
      expect(res.status).to.equal(500);
      expect(res.body.error).to.equal('Database error');
      stub.restore();
    });
  });

  describe('GET /answers/:_id', () => {
    it('should return an answer by ID', async () => {
      const answer = new Answer({ content: 'Test Answer', isCorrect: true, questionId: '12345' });
      await answer.save();

      const res = await request.get(`/answers/${answer._id}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('content', 'Test Answer');
      expect(res.body).to.have.property('isCorrect', true);
      expect(res.body).to.have.property('questionId', '12345');
    });

    it('should return 404 if answer not found', async () => {
      const res = await request.get('/answers/123456789012');
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('Answer not found');
    });

    it('should handle errors', async () => {
      const stub = sinon.stub(mongoose.Model, 'findOne').rejects(new Error('Database error'));
      const res = await request.get('/answers/123456789012');
      expect(res.status).to.equal(500);
      expect(res.body.error).to.equal('Database error');
      stub.restore();
    });
  });

  describe('POST /answers/add', () => {
    it('should create a new answer', async () => {
      const newAnswer = { content: 'New Answer', isCorrect: false, questionId: '12345' };
      const res = await request.post('/answers/add').send(newAnswer);
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('content', 'New Answer');
      expect(res.body).to.have.property('isCorrect', false);
      expect(res.body).to.have.property('questionId', '12345');
    });

    it('should return error if fields are missing', async () => {
      const res = await request.post('/answers/add').send({ content: 'Incomplete' });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('All fields are required');
    });
  });

  describe('PUT /answers/update', () => {
    it('should update an answer', async () => {
      const answer = new Answer({ content: 'Old Answer', isCorrect: true, questionId: '12345' });
      await answer.save();

      const res = await request.put('/answers/update').send({
        _id: answer._id,
        content: 'Updated Answer',
        isCorrect: false,
      });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('content', 'Updated Answer');
      expect(res.body).to.have.property('isCorrect', false);
    });

    it('should return 400 if ID is missing', async () => {
      const res = await request.put('/answers/update').send({ content: 'No ID' });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('id is required');
    });
  });

  describe('DELETE /answers/delete', () => {
    it('should delete an answer', async () => {
      const answer = new Answer({ content: 'To Delete', isCorrect: true, questionId: '12345' });
      await answer.save();

      const res = await request.delete('/answers/delete').send({ _id: answer._id });
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Answer deleted successfully');
    });

    it('should return 400 if ID is missing', async () => {
      const res = await request.delete('/answers/delete').send({});
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('id is required');
    });
  });
});