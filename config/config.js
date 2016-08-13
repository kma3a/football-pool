module.exports = {
  "development": {
    "username": "root",
    "password": null,
    "database": "database_development",
    "dialect": "postgres",
    "emailUsername": "test",
    "emailPassword": "password"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "dialect": "postgres",
    "emailUsername": "test",
    "emailPassword": "password"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "username": process.env.username,
    "password": process.env.password,
    "database": process.env.DATABASE_URL,
    "dialect": "postgres",
    "emailUsername": process.env.emailUsername,
    "emailPassword": process.env.emailPassword
  }
}
