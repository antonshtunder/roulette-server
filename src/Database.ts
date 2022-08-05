import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

export default class Database {
    private client: MongoClient;
    private saltRounds = 10;

    constructor(private uri: string, callback: () => void) {
        this.client = new MongoClient(uri);
        this.client.connect();
        this.client.db('admin').command({ping: 1}).then(() => {
            callback();
        });
    }

    public async getUser(username: string) {
        let users = this.client.db('roulette').collection('users');
        return await users.findOne({username});
    }

    public async addUser(username: string, password: string) {
        let users = this.client.db('roulette').collection('users');
        await bcrypt.hash(password, this.saltRounds, async (err, hash) => {
            await users.insertOne({username, password: hash, balance: 0});
        });
    }

    public async login(username: any, password: any) {
        let users = this.client.db('roulette').collection('users');
        let user = await users.findOne({username});
        if(user === null) {
            return 'no-user'
        }
        let res = await bcrypt.compare(password, user.password);
        if(res) {
            return user.balance;
        } else {
            return 'wrong-password';
        }
    }

    public async addBalance(username: any, value: number) {
        let users = this.client.db('roulette').collection('users');
        let res = await users.findOne({username});
        if(res != null) {
            await users.updateOne({username}, {$inc: {balance: value}});
            return 'ok';
        } else {
            return 'no-user';
        }
    }

    public async setBalance(username: string, value: number) {
        let users = this.client.db('roulette').collection('users');
        await users.updateOne({username}, {$set:{balance: value}});
    }
}