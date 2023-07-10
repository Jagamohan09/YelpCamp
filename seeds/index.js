const mongoose = require('mongoose');
const Campground = require('../models/campground');
//Bascially the file path is passed .. means go back one dir
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers');
//destructing and creating new obj literals



mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
    .then(() => {
        console.log("Database Connected");
    })
    .catch(err => {
        console.log(err);
    })

const sample = (array) => array[Math.floor(Math.random() * array.length)]


const seedDB = async () => {
    await Campground.deleteMany({}); //deleting everything
    for (let i = 0; i <= 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: "646ef697ed17876641482e5e",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            //city and state are properties inside the array
            title: `${sample(descriptors)} ${sample(places)}`,
            //descriptors and places are two arrays passed to sample function
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perspiciatis ullam, ad assumenda consequuntur eveniet dignissimos possimus unde sit! Laboriosam alias distinctio iure. Eligendi dolorum ipsa inventore quia necessitatibus laudantium at!',
            price,
            //short way of saying that price:price
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            //we are adding the location to each predefined campground on which location has not been set
            images: [
                {
                    url: 'https://res.cloudinary.com/diqjruhl5/image/upload/v1685171799/YelpCamp/k3kekbpyn6yc4d2nvlir.jpg',
                    filename: 'YelpCamp/k3kekbpyn6yc4d2nvlir'
                }
            ]
        })
        await camp.save()
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close()
    })