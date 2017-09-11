import {Injectable} from "@angular/core";
import {SocketProvider} from "../socket/socket";
import {Subscription} from "rxjs/Subscription";
import {MessageProvider} from "../message/message";
import {Message} from "../message/message.model";
import {UserProvider} from "../user/user";
import {User} from "../user/user.model";
import {ConfigProvider} from "../config/config";

@Injectable()
export class DataFilterProvider {
    private _connectedSubscription: Subscription;
    private _rawDataSubscription: Subscription;
    private _disconnectSubscription: Subscription;
    private _thisUser: string;
    private _receivedNameReply: boolean = false;

    public constructor(private socketProvider: SocketProvider,
                       private messageProvider: MessageProvider,
                       private userProvider: UserProvider) {
        this._disconnectSubscription = this.socketProvider.onDisconnect().subscribe((reason: string) => {
           this._receivedNameReply = false;
        });

        this._connectedSubscription = this.socketProvider.onConnected().subscribe(() => {
            this._connectedSubscription.unsubscribe();

            this._rawDataSubscription = this.socketProvider.onRawData().subscribe((data: any) => {
                this.filterRawData(data);
            });
        });
    }

    /**
     * Set current user.
     *
     * @param nick
     */
    public setUser(nick: string): void {
        this._thisUser = nick;
    }

    /**
     * Filters incoming data from socket and sends data to providers which in turn notify subscribers.
     *
     * @param data
     */
    public filterRawData(data: any): void {
        switch(data.commandType) {
            case 'normal':
                switch(data.command) {
                    case 'PRIVMSG':
                        if(data.args[0] === ConfigProvider.popreChannel || DataFilterProvider.filterNick(data.args[0]) === this._thisUser) {
                            let message: string = data.args[1];
                            if(message.startsWith('$hut')) {
                                // Message contains hut settings which isn't really relevant for this client
                            } else if(message.startsWith('$map')) {
                                // Message contains map settings which isn't really relevant for this client
                            } else if(message.startsWith('$cmd')) {
                                // Message contains command info (for example kick)
                            } else if(message.startsWith('$QTH')) {
                                // Message contains hut and game states
                                this.filterUserState(data.nick, message);
                            } else if(message) {
                                if(data.args[0] === ConfigProvider.popreChannel) {
                                    // Message has a length and should be raw text sent to the whole channel
                                    this.messageProvider.addMessage(new Message({
                                        type: 'CHAT',
                                        text: message,
                                        author: data.nick
                                    }));
                                } else if(DataFilterProvider.filterNick(data.args[0]) === this._thisUser) {
                                    // Message contains a private message to this client
                                    if(message) {
                                        this.messageProvider.addMessage(new Message({
                                            type: 'PVT',
                                            text: message,
                                            author: data.nick
                                        }));
                                    }
                                }
                            }
                        }
                        break;
                    case 'JOIN':
                        // Message contains info about a client that has joined the channel
                        if(this._receivedNameReply) {
                            this.userProvider.addUser(new User({
                                rawNick: data.nick,
                                nick: DataFilterProvider.filterNick(data.nick)
                            }));

                            this.messageProvider.addMessage(new Message({
                                type: 'JOIN',
                                textSuffix: ConfigProvider.joinSuffix,
                                author: data.nick
                            }));
                        }
                        break;
                    case 'QUIT':
                        // Message contains info about a client that has quit the channel
                        this.userProvider.removeUser(data.nick);

                        this.messageProvider.addMessage(new Message({
                            type: 'QUIT',
                            textSuffix: ConfigProvider.quitSuffix,
                            author: data.nick
                        }));
                        break;
                    case 'NICK':
                        this.userProvider.updateUserRawNick(data.nick, data.args[0]);
                        break;
                    case 'ERROR':
                        // Message contains error
                        this.messageProvider.addMessage(new Message({
                            type: 'ERROR',
                            text: data.args[0]
                        }));

                        this.socketProvider.notifyErrorSubscribers(data);
                        break;
                }
                break;
            case 'reply':
                if(data.command === 'rpl_namreply' &&
                    DataFilterProvider.filterNick(data.args[0]) === this._thisUser &&
                    data.args[2] === ConfigProvider.popreChannel &&
                    typeof data.args[0] === 'string') {
                    // Message contains list of online users
                    this.filterNameReply(data.args[3]);

                    this._receivedNameReply = true;
                }
                break;
        }
    }

    /**
     * Parse a user's state based on the message.
     *
     * @param rawNick Raw nick of user.
     * @param message Message to be parsed.
     */
    public filterUserState(rawNick: string, message: string): void {
        let encoded_message: string = message.substring(message.length - 7);
        let flags: number = parseInt(encoded_message.substring(1, 3), 16);

        this.userProvider.updateUserState(rawNick, {
            status: parseInt(encoded_message.charAt(0), 16),
            hutIndex: parseInt(encoded_message.substring(3, 4), 16),
            hutPosition: parseInt(encoded_message.substring(4, 5), 16),
            gameIndex: parseInt(encoded_message.substring(5, 7), 16),
            blueAlly: (flags & (1 << 0)) !== 0,
            isStreaming: (flags & (1 << 1)) !== 0,
            allowsConferenceInvites: (flags & (1 << 2)) !== 0,
            allowsSpectators: (flags & (1 << 3)) !== 0,
            hasHutRestrictions: (flags & (1 << 4)) !== 0,
            canHost: (flags & (1 << 5)) !== 0
        });
    }

    /**
     * Takes users separated by space and adds them to the user list.
     *
     * @param {string} usersUnformatted Users separated by space.
     */
    public filterNameReply(usersUnformatted: string): void {
        let namesArray: string[] = usersUnformatted.split(' ');

        if(namesArray) {
            for(let nick of namesArray) {
                // Needs to have more than the mandatory first four identifying characters
                if(nick.length > 4) {
                    this.userProvider.addUser(new User({
                        rawNick: nick,
                        nick: DataFilterProvider.filterNick(nick)
                    }), true);
                }
            }
        }
    }

    /**
     * Removed first four characters from a nick that contain a compatibility flag which is
     * irrelevant information for this client.
     *
     * @param {string} unfilteredNick
     * @returns {string}
     */
    public static filterNick(unfilteredNick: string): string {
        return unfilteredNick.substring(4);
    }
}
