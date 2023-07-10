const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        //An instance of user is made having username & password
        const registerUser = await User.register(user, password)
        //register method resisters the new user instance with the password provided
        req.login(registerUser, function (err) {
            if (err) {
                return next(err);
            } else {
                req.flash('success', 'Welcome to Yelp Camp')
                res.redirect('/campgrounds')
            }
        })

    } catch (e) {
        req.flash('error', e.message)
        //e refers to the error object it has a message property in it which stores the error message
        res.redirect('register')
    }
}
//using try catch becoz if duplication of username occurs then it could be handeled(if any other error occurs then it could be handeled too) 
//as the .register method looks for unique Username;

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    //passport.aurthenticate middleware is executed whre we pass astartergy as a parameter
    //multiple statergies can also be passed 
    req.flash('success', 'Welcome Back')
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    //if res.locals.returnto is not defined then it will redirect tou to '/campgrounds'
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}