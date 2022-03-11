const express = require('express');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const cors = require('cors');
const app = express();
const pack = require('../package');
const path = require('path');
// if NODE_ENV value not define then dev value will be assign 
mode = process.env.NODE_ENV || 'dev';

// mode can be access anywhere in the project
const config = require('config').get(mode);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
require('./routes')(app);

const dir = path.join(__dirname, 'assets');
app.use('/upload', express.static(dir));



const start = () => (
  app.listen(config.port, () => {
    console.log(chalk.yellow('.......................................'));
    console.log(chalk.green(config.name));
    console.log(chalk.green(`Port:\t\t${config.port}`));
    console.log(chalk.green(`Mode:\t\t${config.mode}`));
    console.log(chalk.green(`App version:\t${pack.version}`));
    console.log(chalk.yellow('.......................................'));



  })
);

//start server
start();
