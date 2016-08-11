module.exports = {
  "development": {
    "username": "root",
    "password": null,
    "database": "database_development",
    "dialect": "sqlite",
    "storage": "data.sqlite3",
    "emailUsername": "test",
    "emailPassword": "password"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "dialect": "sqlite",
    "emailUsername": "test",
    "emailPassword": "password"
  },
  "production": {
    "username": process.env.username,
    "password": process.env.password,
    "database": "database_production",
    "dialect": "sqlite",
    "emailUsername": process.env.emailUsername,
    "emailPassword": process.env.emailPassword
  }
}
