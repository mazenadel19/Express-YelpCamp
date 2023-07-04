if (process.env.NODE_ENV !== "production") {
  const path = require("path");
  require("dotenv").config({ path: path.join(__dirname, "../.env") });
}

const colors = require("colors");
const mongoose = require("mongoose");
const Campground = require("../models/Campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelper");

const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
// const DB_URL = ''
// atlas seeds using the url instead of DB_URL since process.env.DB_URL is undefined on my local machine
// console.log(DB_URL);

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("index seeds", DB_URL);
    console.log("CONNECTED TO MONGODB!!!".bgGrey);
  })
  .catch((e) => {
    console.log("FAILED CONNECT TO MONGODB!!!".brightYellow);
    console.log(`${e}.brightYellow`);
  });

function sample(arr) {
  const rand = Math.floor(Math.random() * arr.length);
  return arr[rand];
}

const seedDB = async () => {
  console.log("Deleteing old data");
  await Campground.deleteMany({});
  console.log("Deleted old data");
  console.log("Start DataBase Seeding");
  for (let i = 1; i <= 500; i++) {
    const rand1000 = Math.floor(Math.random() * 1035);
    const price = Math.floor(Math.random() * 20) + 10;

    const camp = new Campground({
      campNo: `#${i}`,
      // author: '609cb8ba60aa6df217ad82a4', // local
      author: "60ae8cd334192b7565a69fef", // atlas
      images: [
        {
          url: "https://res.cloudinary.com/skywa1ker/image/upload/v1622052347/YelpCamp/w6nsjgzvlsuhpwhqa6o5.jpg",
          filename: "YelpCamp/w6nsjgzvlsuhpwhqa6o5",
        },
        {
          url: "https://res.cloudinary.com/skywa1ker/image/upload/w_570/v1621939744/YelpCamp/ehvtazwtd9jyjha5nrrs.jpg",
          filename: "YelpCamp/ehvtazwtd9jyjha5nrrs",
        },
      ],
      geometry: {
        type: "Point",
        coordinates: [cities[rand1000].longitude, cities[rand1000].latitude],
      },

      location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      price,
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam, similique. Libero illo, officiis officia cum nesciunt accusantium ipsam, excepturi ex aspernatur, accusamus magnam. Porro incidunt dolor quod nesciunt accusamus animi.`,
    });

    await camp.save();
  }
  console.log("End DataBase Seeding");
};

seedDB().then(() => {
  mongoose.connection.close();
});
