/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var mongo = require('mongodb');
var mongoose = require('mongoose');
var mongooseConfig = require('../config/mongoose_config');
require('dotenv').config();
var { API_TOKEN, MONGO_DB } = process.env;
var { expect } = require('chai');
var https = require('https');
var { StockData } = require('../models/StockData');
var { ComparisonData } = require('../models/ComparisonData');

mongoose.connect(MONGO_DB, mongooseConfig);

const db = mongoose.connection;

module.exports = app => {
  app.get('/api/stock-prices', (req, res, next) => {
    const { stock, like } = req.query;
    const ipAddress = req.ip;
    if (!stock) return res.status(400).send('Nasdaq stock ticker required');
    if (Array.isArray(stock)) {
      const stock1 = stock[0];
      const stock2 = stock[1];
      const url1 = `https://cloud.iexapis.com/beta/stock/${stock1}/quote?token=${API_TOKEN}`
      const url2 = `https://cloud.iexapis.com/beta/stock/${stock2}/quote?token=${API_TOKEN}`
      let newLikeCount1;
      StockData.findOne({ stock: stock1.toUpperCase() }, (err, found) => {
        if (found) {
          if (found.ips.includes(ipAddress) && like === 'true' && found.likes === 0) newLikeCount1 = 1;
          else if (found.ips.includes(ipAddress)) newLikeCount1 = 0;
        } else newLikeCount1 = (like === 'true') ? 1 : 0;
        https.get(url1, response => {
          let body1 = '';
          response.on('data', data => body1 += data.toString());
          response.on('error', err => console.error(err));
          response.on('end', () => {
            const stockDataToCompare1 = JSON.parse(body1);
            const { symbol, latestPrice } = stockDataToCompare1;
            if (!symbol) return res.send(`stock1: ${stock1} is invalid`);
            StockData.findOneAndUpdate({ stock: stock1.toUpperCase() }, {
              $set: { stock: symbol, price: latestPrice },
              $inc: { likes: newLikeCount1 },
              $push: { ips: ipAddress }
            }, { upsert: true, returnNewDocument: true }, (err, result1) => {
              if (err) next(err);
              if (!result1) console.log(`result1: ${result1}`);
              ComparisonData.findOneAndUpdate({ stocks: stock }, {
                $set: {
                  "stocks": stock,
                  "stockData.0": {
                    stock: result1.stock, 
                    price: result1.price, 
                    likes: ((result1.likes + newLikeCount1) || newLikeCount1)
                  }
                }
              }, { upsert: true }, (err, doc) => {
                if (err) next(err);
                if (!doc) console.log(`doc: ${doc}`);
              });
            });
          });
        });
      });
      let newLikeCount2;
      StockData.findOne({ stock: stock2.toUpperCase() }, (err, found) => {
        if (found) {
          if (found.ips.includes(ipAddress) && like === 'true' && found.likes === 0) newLikeCount2 = 1;
          else if (found.ips.includes(ipAddress)) newLikeCount2 = 0;
        } else newLikeCount2 = like === 'true' ? 1 : 0;
        https.get(url2, response => {
          let body2 = '';
          response.on('data', data => body2 += data.toString());
          response.on('error', err => console.error(err));
          response.on('end', () => {
            const stockDataToCompare2 = JSON.parse(body2);
            const { symbol, latestPrice } = stockDataToCompare2;
            if (!symbol) return res.send(`stock2: ${stock2} is invalid`);
            StockData.findOneAndUpdate({ stock: stock2.toUpperCase() }, {
              $set: { stock: symbol, price: latestPrice },
              $inc: { likes: newLikeCount2 },
              $push: { ips: ipAddress }
            }, { upsert: true, returnNewDocument: true }, (err, result2) => {
              if (err) next(err);
              if (!result2) console.log(`result2: ${result2}`);
              ComparisonData.findOneAndUpdate({ stocks: stock }, {
                $set: { 
                  "stocks": stock,
                  "stockData.1": {
                    stock: result2.stock, 
                    price: result2.price, 
                    likes: ((result2.likes + newLikeCount2) || newLikeCount2)
                  }
                }
              }, { upsert: true, returnNewDocument: true }, (err, doc) => {
                if (err) next(err);
                if (!doc) console.log(`doc: ${doc}`);
                return res.status(200).json({ 
                  "stockData": [{ 
                    "stock": doc.stockData[0][0].stock, 
                    "price": doc.stockData[0][0].price,
                    "rel_likes": (doc.stockData[0][0].likes - doc.stockData[0][1].likes) }, 
                  {
                    "stock": doc.stockData[0][1].stock, 
                    "price": doc.stockData[0][1].price,
                    "rel_likes": (doc.stockData[0][1].likes - doc.stockData[0][0].likes) 
                  }]
                }); 
              });
            });
          });
        });
      });
    } else {
      const url = `https://cloud.iexapis.com/beta/stock/${stock}/quote?token=${API_TOKEN}`;
      let newLikeCount;
      StockData.findOne({ stock: stock.toUpperCase() }, (err, found) => {
        if (found) {
          if (found.ips.includes(ipAddress) && like === 'true' && found.likes === 0) newLikeCount = 1;
          else if (found.ips.includes(ipAddress)) newLikeCount = 0;
        }
        else newLikeCount = like === 'true' ? 1 : 0;
        https.get(url, response => {
          let updatedBody = '';
          response.on('data', data => updatedBody += data.toString());
          response.on('error', err => console.error(err));
          response.on('end', () => {
            const stockDataToUpdate = JSON.parse(updatedBody);
            const { symbol, latestPrice } = stockDataToUpdate;
            StockData.findOneAndUpdate({ stock: stock.toUpperCase() }, {
              $set: { stock: symbol, price: latestPrice },
              $inc: { likes: newLikeCount },
              $push: { ips: ipAddress }
            }, { upsert: true, returnNewDocument: true }, (err, stockData) => {
              if (err) next(err);
              if (!stockData) console.log(`stockData: ${stockData}`);
              return res.status(200).json({
                stockData: { 
                  stock: stockData.stock, 
                  price: stockData.price,
                  likes: (stockData.likes === 0 && like === 'true' ? 1 : stockData.likes) 
                }              });
            });
          });
        });
      });
    }
  });
};