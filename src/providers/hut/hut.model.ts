import {User} from "../user/user.model";

export class Hut {
    public index: number;
    public positions: Array<User|boolean> = Array<User|boolean>(4);

    public constructor(index: number) {
        this.index = index;
        this.positions = [
            false,
            false,
            false,
            false
        ];
    }

    /**
     * Adds a user to a hut.
     *
     * @param {User} user The user to add.
     * @param {number} position The position to add the user to.
     */
    public addUser(user: User, position: number): void {
        if( position >= 0 && position <= 3) {
            this.positions[position] = user;
        }
    }
}
