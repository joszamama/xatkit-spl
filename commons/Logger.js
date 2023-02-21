const { createLogger, format, transports } = require('winston');
const chalk = require('chalk');

const { combine, timestamp, printf } = format;

const prettyFormatter = printf(({ level, message, timestamp }) => {
    const levelColors = {
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        http: 'cyan',
        verbose: 'magenta',
        debug: 'white',
        silly: 'gray',
    };
    const colorizedLevel = levelColors[level] ? chalk[levelColors[level]](level.toUpperCase()) : level.toUpperCase();
    const formattedTimestamp = new Date(timestamp).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    return `${chalk.gray(`[${formattedTimestamp}]`)} ${colorizedLevel}: ${message}`;
});

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        prettyFormatter,
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs.log' }),
    ],
});

module.exports = logger;