import {User} from "../user/user.model";

export class Game {
    public index: number;
    public players: Array<User> = Array<User>();

    public constructor(index: number) {
        this.index = index;
    }

    /**
     * Adds a user to a game.
     *
     * @param {User} user The user to add.
     */
    public addUser(user: User): void {
        this.players.push(user);
    }
}
