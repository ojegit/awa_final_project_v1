//source: https://version.lab.fi/Erno.Vanhala/advanced-web-applications-session-authentication/-/blob/main/passport-config.js
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByUsername, getUserById) {
  const authenticateUser = async (username, password, done) => {
    const user = getUserByUsername(username)
    if (user == null) {
      console.log("User not found")
      return done(null, false)
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        console.log("user: " + user.username + " logged in!")
        return done(null, user)
      } else {
        console.log("Password incorrect")
        return done(null, false)
      }
    } catch(e) {
      return done(e)
    }

  }

  passport.use(new LocalStrategy(authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = initialize
