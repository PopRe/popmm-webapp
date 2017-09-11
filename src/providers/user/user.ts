import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {User} from "./user.model";
import {Observable} from "rxjs/Observable";
import {ApiProvider} from "../api/api";
import {Subscription} from "rxjs/Subscription";
import {SocketProvider} from "../socket/socket";
import {ConfigProvider} from "../config/config";

@Injectable()
export class UserProvider {
    private _disconnectSubscription: Subscription;
    private _users: Array<User> = [];
    private _usersSubject: Subject<User[]> = new Subject<User[]>();

    public constructor(private api: ApiProvider,
                       private socketProvider: SocketProvider) {
        this._disconnectSubscription = this.socketProvider.onDisconnect().subscribe((reason: string) => {
            this.clear();
        });
    }

    /**
     * Get a user by raw nick.
     *
     * @param rawNick The raw nick of the user.
     * @returns {User|boolean} The user if found, otherwise false.
     */
    public getUser(rawNick: string): User | false {
        for(let user of this._users) {
            if(user.rawNick === rawNick) {
                return user;
            }
        }

        return false;
    }

    /**
     * Update the state of a user.
     *
     * @param rawNick The raw nick of the user to update state for.
     * @param details The new status details.
     */
    public updateUserState(rawNick: string, details: any): void {
        let user: User | false = this.getUser(rawNick);

        if(user) {
            user.status = details.status;
            user.hutIndex = details.hutIndex;
            user.hutPosition = details.hutPosition;
            user.gameIndex = details.gameIndex;
            user.blueAlly = details.blueAlly;
            user.isStreaming = details.isStreaming;
            user.allowsConferenceInvites = details.allowsConferenceInvites;
            user.allowsSpectators = details.allowsSpectators;
            user.hasHutRestrictions = details.hasHutRestrictions;
            user.canHost = details.canHost;

            this.notifySubscribers();
        }
    }

    /**
     * Add a user.
     *
     * @param user The user to add.
     * @param skipUsersUpdate Whether subscribers should not be notified.
     */
    public addUser(user: User, skipUsersUpdate: boolean = false): void {
        this._users.push(user);

        if(!skipUsersUpdate) {
            this.notifySubscribers();
        }

        // Fetch user details
        this.getUserDetails(user).then((data: any) => {
            if(data) {
                user.id = data['user-id'];
                user.old_names = data['old-names'];
                user.clans = data.clans;
                user.rank = data.rank;
                user.points = data.points;
                user.grade = data.grade;
                user.mu = data.mu;
                user.sigma = data.sigma;
                user.twitch = data.twitch;

                this.notifySubscribers();
            }
        }).catch((err: Error) => {
            console.log(err);
        });
    }

    /**
     * Update raw nick of a user.
     *
     * @param oldRawNick The old raw nick.
     * @param newNick The new raw nick.
     */
    public updateUserRawNick(oldRawNick: string, newNick: string): void {
        let user: User | boolean = this.getUser(oldRawNick);

        if(user) {
            user.rawNick = newNick;
            this.notifySubscribers();
        }
    }

    /**
     * Remove user.
     *
     * @param rawNick The raw nick of user to remove.
     */
    public removeUser(rawNick: string): void {
        let user: User | boolean = this.getUser(rawNick);

        if(user) {
            let index: number = this._users.indexOf(user);

            if(index > -1) {
                this._users.splice(index, 1);
                this.notifySubscribers();
            }
        }
    }

    /**
     * Get all matching users with the same nick.
     *
     * @param nick User to get.
     * @returns {Array<User> | boolean} Matching users.
     */
    public getUsersByNick(nick: string): Array<User> | false {
        let matchingUsers: Array<User> = [];
        for(let user of this._users) {
            if(user.nick === nick) {
                matchingUsers.push(user);
            }
        }

        if(matchingUsers.length > 0) {
            return matchingUsers;
        } else {
            return false;
        }
    }

    /**
     * Request the API for user details.
     *
     * @param user The user to get details for.
     * @returns {Promise<{}>} Promise containing user details if successful request.
     */
    public getUserDetails(user: User | {nick: string}): Promise<{}> {
        return this.api.get(ConfigProvider.popreUrl + 'user.php?json&username=' + user.nick);
    }

    /**
     * Trigger next users update event.
     */
    public notifySubscribers(): void {
        this._usersSubject.next(this._users);
    }

    /**
     * Clears array of users.
     */
    public clear(): void {
        this._users = [];
        this.notifySubscribers();
    }

    /**
     * Get observable for new users subscription.
     *
     * @returns {Observable<User[]>} The observable users.
     */
    public onUsers(): Observable<User[]> {
        return this._usersSubject.asObservable();
    }
}
