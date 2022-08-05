import express from 'express';
import session, {SessionData} from 'express-session';
import cors from 'cors';
import bodyParser from 'body-parser';
import RouletteController from './RouletteController';
import UserController from './UserController';
import Database from './Database';
import fs from 'fs';

const app = express();
const port = 8080;

declare module 'express-session' {
    interface SessionData {
        username: string,
        balance: number
    }
}

app.use(session({secret: 'asfdiff234923fjf9f9jfwe9ijkfki'}));
app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
        return callback(null, true);
    }
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

fs.readFile('./mongodb.txt', 'utf8', (err, data) => {
    console.log(data);
    console.log(err);
    let db = new Database(data, () => {
        let rouletteController = new RouletteController(app, db);
        let userController = new UserController(app, db);

        app.listen(port, () => {
            console.log(`server started at http://localhost:${port}`);
        });
    });
});