import {Component} from "@angular/core";
import {User} from "../../providers/user/user.model";
import {Subscription} from "rxjs/Subscription";
import {UserProvider} from "../../providers/user/user";
import {Hut} from "../../providers/hut/hut.model";
import {SocketProvider} from "../../providers/socket/socket";

@Component({
    selector: 'hut-list',
    templateUrl: 'hut-list.html'
})
export class HutListComponent {
    private _usersSubscription: Subscription;
    private _disconnectSubscription: Subscription;
    private _huts: Array<Hut> = [];

    public constructor(private userProvider: UserProvider,
                       private socketProvider: SocketProvider) {
        this._usersSubscription = this.userProvider.onUsers().subscribe((users: Array<User>) => {
            this._huts = [];

            for(let user of users) {
                // User is in a hut if hut index is 1 or more
                if(user.hutIndex >= 1) {
                    let hut: Hut = this._getOrCreateHut(user.hutIndex);
                    hut.addUser(user, user.hutPosition);
                }
            }

            this._sortHuts();
        });

        this._disconnectSubscription = this.socketProvider.onDisconnect().subscribe((reason: string) => {
            this._disconnectSubscription.unsubscribe();
            this._usersSubscription.unsubscribe();
        });
    }

    /**
     * Tries to get a hut by index, if not found then it creates one.
     *
     * @param index The hut index to find.
     * @returns {Hut} The hut.
     * @private
     */
    private _getOrCreateHut(index: number): Hut {
        for(let hut of this._huts) {
            if(hut.index === index) {
                return hut;
            }
        }

        let newHut: Hut = new Hut(index);

        this._huts.push(newHut);

        return newHut;
    }

    /**
     * Sorts huts.
     *
     * @private
     */
    private _sortHuts(): void {
        this._huts = this._huts.sort((a: Hut, b: Hut) => {
            if(a.index > b.index) {
                return 1;
            }

            if(a.index < b.index) {
                return -1;
            }

            return 0;
        });
    }
}
