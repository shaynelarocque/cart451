require('dotenv').config();
const { MongoClient } = require('mongodb');
const express = require('express');

const app = express();
const PORT = 3000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = '451Exercise1';
const COLLECTION_NAME = 'Cars';

console.log("Starting server...");
console.log("MONGO_URI:", MONGO_URI);
let db;

MongoClient.connect(MONGO_URI, (err, client) => {
    if (err) {
        console.error('Error while connecting to MongoDB:', err.message || err);
        return;
    }    

    console.log('Connected to MongoDB! :D');
    db = client.db(DB_NAME);
    
    app.listen(PORT, () => {
        console.log(`Server up! Running on http://localhost:${PORT}`);
    });
});

app.get('/cars-before-year/:year', async (req, res) => {
    const year = parseInt(req.params.year);
    const carsBeforeYear = await db.collection(COLLECTION_NAME).find({ "Year of Manufacture": { $lt: year } }).toArray();
    res.json(carsBeforeYear);
});

app.get('/ford-cars', async (req, res) => {
    const fordCars = await db.collection(COLLECTION_NAME).find({ "Car Brand": "Ford" }).toArray();
    res.json(fordCars);
});

app.get('/indonesia-count', async (req, res) => {
    const count = await db.collection(COLLECTION_NAME).countDocuments({ "Country": "Indonesia" });
    res.json({ count });
});

app.get('/distinct-car-colors', async (req, res) => {
    const distinctColors = await db.collection(COLLECTION_NAME).distinct("Car Color");
    res.json(distinctColors);
});

app.get('/people/:country/:cardType', async (req, res) => {
    const country = req.params.country;
    const cardType = req.params.cardType;
    const people = await db.collection(COLLECTION_NAME).find({ "Country": country, "Credit Card Type": cardType }).toArray();
    res.json(people);
});