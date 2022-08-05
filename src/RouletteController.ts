import {Express} from 'express';
import Database from './Database';

export default class RouletteController {
    private readonly sectorValues = [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32];

    constructor(private app: Express, private database: Database) {
        app.post('/spin', (req, res) => {
            if(Number(req.body.totalBet) > req.session.balance) {
                res.send('low balance');
            } else if(req.session.username == null) {
                res.send('not logged');
            } else {
                const spinResult = Math.floor(Math.random() * 37);
                let color: string;
                if(spinResult === 0)
                    color = 'green';
                else if(spinResult % 2 === 0)
                    color = 'red';
                else
                    color = 'black';
                const winnings = RouletteController.calculateWinnings(req.body, this.sectorValues[spinResult], color);
                const totalBet = RouletteController.calculateTotalBet(req.body)
                req.session.balance += winnings - totalBet;
                this.database.setBalance(req.session.username, req.session.balance);
                res.send(String(spinResult));
            }
        });
    }

    private static calculateWinnings(bets: any, result: number, color: string): number {
        let win = bets.numberBets[result] * 36;
        if(color === 'black')
            win += bets.blackBet * 2;
        if(color === 'red')
            win += bets.redBet * 2;
        if(result % 3 === 1)
            win += bets.rowBets[0] * 3;
        if(result % 3 === 2)
            win += bets.rowBets[1] * 3;
        if(result % 3 === 0)
            win += bets.rowBets[2] * 3;
        if(result >= 1 && result <= 12)
            win += bets.thirdBets[0] * 3;
        if(result >= 13 && result <= 24)
            win += bets.thirdBets[1] * 3;
        if(result >= 25 && result <= 36)
            win += bets.thirdBets[2] * 3;
        if(result >= 1 && result <= 18)
            win += bets.halfBets[0] * 2;
        if(result >= 19 && result <= 36)
            win += bets.halfBets[1] * 2;
        if(result != 0 && result % 2 === 0)
            win += bets.evenBet * 2;
        if(result % 2 === 1)
            win += bets.oddBet * 2;
        console.log(color);
        return win;
    }

    private static calculateTotalBet(bets: any): number {
        let totalBet = 0;
        for(let i = 0; i <= 36; i++) {
            totalBet += Number(bets.numberBets[i]);
        }
        for(let i = 0; i < 3; i++) {
            totalBet += Number(bets.rowBets[i]);
            totalBet += Number(bets.thirdBets[i]);
        }
        for(let i = 0; i < 2; i++)
            totalBet += Number(bets.halfBets[i]);
        totalBet += Number(bets.blackBet);
        totalBet += Number(bets.redBet);
        totalBet += Number(bets.oddBet);
        totalBet += Number(bets.evenBet);
        return totalBet;
    }
}