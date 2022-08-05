import {Express} from 'express';
import Database from './Database';

export default class UserController {
    constructor(private app: Express, private database: Database) {
        app.post('/user/login', (req, res) => {
            if(req.session.username) {
                res.send({result: 'logged'});
            } else {
                this.database.login(req.body.username, req.body.password).then((resultOrBalance: string | number) => {
                    if(typeof resultOrBalance === 'number') {
                        req.session.username = req.body.username;
                        req.session.balance = resultOrBalance;
                        res.send({result: 'ok', balance: resultOrBalance, username: req.body.username});
                    } else {
                        res.send({result: resultOrBalance});
                    }
                });
            }
        });
        app.get('/user/loggedUser', (req, res) => {
            if(req.session.username) {
                res.send({result: 'ok', username: req.session.username, balance: req.session.balance});
            } else {
                res.send({result: 'no'});
            }
        });
        app.get('/user/addBalance/:value', async (req, res) => {
            if(req.session.username) {
                let result = await this.database.addBalance(req.session.username, Number(req.params.value));
                if(result === 'ok')
                    req.session.balance += Number(req.params.value);
                res.send(result);
            } else {
                res.send('not-logged');
            }
        });
        app.post('/user/register', async (req, res) => {
            if(await this.database.getUser(req.body.username) != null) {
                res.send('exists');
            } else if(req.body.username.length < 3) {
                res.send('too-short');
            } else {
                await this.database.addUser(req.body.username, req.body.password);
                req.session.username = req.body.username;
                req.session.balance = 0;
                res.send('ok');
            }
        });
        app.get('/user/logout', (req, res) => {
            req.session.destroy((err) => {
                console.log(err);
            });
            res.send('ok');
        })
    }
}