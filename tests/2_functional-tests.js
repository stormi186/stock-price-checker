/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var { assert } = chai;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  suite('GET /api/stock-prices => stockData object', () => {
    test('1 stock', done => {
      chai.request(server).get('/api/stock-prices').query({
        stock: 'aapl'
      }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, 'AAPL');
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.isNumber(res.body.stockData.likes);
        done();
      });
    });

    test('1 stock with like', done => {
      chai.request(server).get('/api/stock-prices').query({
        stock: 'aapl',
        like: true
      }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, 'AAPL');
        assert.equal(res.body.stockData.likes, 1);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.isNumber(res.body.stockData.likes);
        done();
      });
    });

    test('1 stock with like again (ensure likes arent double counted)', done => {
      chai.request(server).get('/api/stock-prices').query({
        stock: 'aapl',
        like: true
      }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, 'AAPL');
        assert.equal(res.body.stockData.likes, 1);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.isNumber(res.body.stockData.likes);
        done();
      });
    });

    test('2 stocks', done => {
      chai.request(server).get('/api/stock-prices').query({
        stock: ['goog', 'msft']
      }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData[0].stock, 'GOOG');
        assert.equal(res.body.stockData[1].stock, 'MSFT');
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.property(res.body.stockData[1], 'stock');
        assert.property(res.body.stockData[1], 'price');
        assert.property(res.body.stockData[1], 'rel_likes');
        assert.isNumber(res.body.stockData[1].rel_likes);
        done();
      });
    });

    test('2 stocks with like', done => {
      chai.request(server).get('/api/stock-prices').query({
        stock: ['goog', 'msft'],
        like: true
      }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData[0].stock, 'GOOG');
        assert.equal(res.body.stockData[1].stock, 'MSFT');
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.property(res.body.stockData[1], 'stock');
        assert.property(res.body.stockData[1], 'price');
        assert.property(res.body.stockData[1], 'rel_likes');
        assert.isNumber(res.body.stockData[1].rel_likes);
        done();
      });
    });
  });
});