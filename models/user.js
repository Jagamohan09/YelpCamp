const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
UserSchema.plugin(passportLocalMongoose)
/* inside userSchema we have a plugin method where we pass the content of the 'passport-local-mongoose' package. Now the plugin methord
 will automatically add on a field for password & Username in our 'userSchema' schema
 It will make sure that 'Username' of every dataelement should be unique
 It also provide some various other methods */
module.exports = mongoose.model('User', UserSchema)