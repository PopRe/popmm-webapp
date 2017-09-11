import {Component} from "@angular/core";
import {NavController, NavParams} from "ionic-angular";
import {User} from "../../providers/user/user.model";
import {UserProvider} from "../../providers/user/user";
import {ConfigProvider} from "../../providers/config/config";
import {DataFilterProvider} from "../../providers/data-filter/data-filter";
import {MessageProvider} from "../../providers/message/message";

@Component({
    selector: 'page-user-modal',
    templateUrl: 'user-modal.html',
})

export class UserModalPage {
    private _rawNick: string;
    private _nick: string;
    private _user: User = new User({rawNick: this._rawNick, nick: this._nick});

    public constructor(private navCtrl: NavController,
                       private navParams: NavParams,
                       private userProvider: UserProvider,
                       private messageProvider: MessageProvider) {
        this._rawNick = this.navParams.get('rawNick');
        this._nick = DataFilterProvider.filterNick(this._rawNick);
        this._setup();
    }

    /**
     * Setup modal data from user details.
     */
    private _setup(): any {
        let user: User | boolean = this.userProvider.getUser(this._rawNick);

        if(user) {
            // User is online
            this._user = user;
        } else {
            // User is offline, request details
            this.userProvider.getUserDetails({nick: this._nick}).then((data: any) => {
                if(data) {
                    if(!this._user) {
                        this._user = new User({rawNick: this._rawNick, nick: this._nick});
                    }
                    this._user.id = data['user-id'];
                    this._user.old_names = data['old-names'];
                    this._user.clans = data.clans;
                    this._user.rank = data.rank;
                    this._user.points = data.points;
                    this._user.grade = data.grade;
                    this._user.mu = data.mu;
                    this._user.sigma = data.sigma;
                    this._user.twitch = data.twitch;
                }
            }).catch((err: Error) => {
                console.log(err);
            });
        }
    }

    /**
     * Private message clicked.
     */
    public onPrivateMessageClicked(): any {
        this.messageProvider.slideToChatTabToComposePrivateMessage(this._nick);
        this.navCtrl.pop();
    }

    /**
     * Open user's profile.
     */
    public openProfile(): void {
        window.open(ConfigProvider.userProfileUrl + this._nick, '_system');
    }

    /**
     * Open user's game history.
     */
    public openGameHistory(): void {
        window.open(ConfigProvider.userProfileUrl + this._user.id, '_system');
    }

    /**
     * Open user's twitch page.
     */
    public openTwitch(): void {
        window.open(ConfigProvider.twitchUrl + this._user.twitch, '_system');
    }

    /**
     * Close modal.
     */
    public close(): void {
        this.navCtrl.pop();
    }
}
