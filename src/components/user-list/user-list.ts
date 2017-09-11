import {Component} from "@angular/core";
import {UserProvider} from "../../providers/user/user";
import {User} from "../../providers/user/user.model";
import {Subscription} from "rxjs/Subscription";
import {HelperProvider} from "../../providers/helper/helper";
import {Game} from "../../providers/game/game.model";
import {SocketProvider} from "../../providers/socket/socket";

@Component({
    selector: 'user-list',
    templateUrl: 'user-list.html'
})

export class UserListComponent {
    private _usersSubscription: Subscription;
    private _disconnectSubscription: Subscription;
    public users: Array<User> = [];
    public usersWaiting: Array<User> = [];
    public games: Array<Game> = [];
    public usersPlaying: number = 0;

    public constructor(private userProvider: UserProvider,
                       private socketProvider: SocketProvider) {
        this._usersSubscription = this.userProvider.onUsers().subscribe((users: Array<User>) => {
            this.usersWaiting = [];
            this.games = [];
            this.usersPlaying = 0;
            this.groupUsers(users);

            HelperProvider.sortByProperty(this.usersWaiting, 'points', true);
            HelperProvider.sortByProperty(this.games, 'index');

            for(let game of this.games) {
                HelperProvider.sortByProperty(game.players, 'status');
                this.usersPlaying += game.players.length;
            }

            this.users = users;
        });

        this._disconnectSubscription = this.socketProvider.onDisconnect().subscribe((reason: string) => {
            this._disconnectSubscription.unsubscribe();
            this._usersSubscription.unsubscribe();
        });
    }

    /**
     * Group users into either waiting/idle users or playing users.
     *
     * @param {Array<User>} users
     */
    private groupUsers(users: Array<User>): void {
        for(let user of users) {
            // Status 5 means game lobby so there is no game index yet
            if((!user.gameIndex || user.gameIndex === 0) && user.status !== 5) {
                this.usersWaiting.push(user);
            } else {
                let game: Game = this.getOrCreateGame(user.gameIndex);
                game.addUser(user);
            }
        }
    }

    /**
     * Get existing game or create one by index.
     *
     * @param {number} index The game index to get or create.
     * @returns {Game} The game.
     */
    private getOrCreateGame(index: number): Game {
        if(!index) {
            // Game lobby
            index = -1;
        }

        for(let game of this.games) {
            if(game.index === index) {
                return game;
            }
        }

        let newGame: Game = new Game(index);
        this.games.push(newGame);

        return newGame;
    }

    /**
     * Page will be destroyed.
     */
    public ionViewWillUnload(): void {
        this._usersSubscription.unsubscribe();
    }
}
