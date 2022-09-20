const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tour');
const User = require('../../models/user');
const Review = require('../../models/review');

dotenv.config({ path: './config.env' });

console.log(process.env.MONGO_DB_CNN);
mongoose.connect(process.env.MONGO_DB_CNN).then(() => {
  console.log('DB Connected Succesfully ✅');
});

// Read Json file

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
// Import Data

const importData = async () => {
  try {
    console.log('Creating database... 🕰');
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// delete all data from collection
const deleteData = async () => {
  try {
    console.log('Deleting collection... ☠');
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
}
if (process.argv[2] === '--delete') {
  deleteData();
}
