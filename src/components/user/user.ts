import {Component, Input} from "@angular/core";
import {UserProvider} from "../../providers/user/user";
import {User} from "../../providers/user/user.model";
import {DataFilterProvider} from "../../providers/data-filter/data-filter";
import {ModalController} from "ionic-angular";
import {UserModalPage} from "../../pages/user-modal/user-modal";
import {ConfigProvider} from "../../providers/config/config";

@Component({
    selector: 'user',
    templateUrl: 'user.html'
})

export class UserComponent {
    @Input() public rawNick: string;
    @Input() public displayName: string = 'empty';
    @Input() public status: number;
    @Input() public isStreaming: boolean;
    @Input() public twitch: string;
    public image: string = 'assets/images/ranks/-1.bmp';
    public circle: string = 'assets/images/game-statuses/circle.svg';
    public streamingIndicator: string = 'assets/images/streaming.svg';

    public constructor(private userProvider: UserProvider,
                       private modalCtrl: ModalController) {

    }

    /**
     * On component initialization.
     */
    public ngOnInit(): void {
        this._setup();
    }

    /**
     * Setup user component data.
     *
     * @private
     */
    private _setup(): void {
        if(this.rawNick) {
            this.displayName = DataFilterProvider.filterNick(this.rawNick);
            let getUser: User|boolean = this.userProvider.getUser(this.rawNick);

            if(getUser && getUser.grade && getUser.grade !== '-1') {
                // The user is online and the user details including grade have been loaded already
                this.image = 'assets/images/ranks/' + getUser.grade + '.bmp';
            } else {
                // Request user details to get grade for image
                this.userProvider.getUserDetails({nick: DataFilterProvider.filterNick(this.rawNick)}).then((data: any) => {
                    if(data) {
                        if(data.grade) {
                            this.image = 'assets/images/ranks/' + data.grade + '.bmp';
                        }
                    }
                }).catch((err: Error) => {
                    console.log(err);
                });
            }
        } else {
            // The user component is an empty hut
            this.image = 'assets/images/hut.bmp';
        }
    }

    /**
     * Whether user is connected through the web app.
     *
     * @returns {boolean}
     */
    public isWebApp(): boolean {
        return this.rawNick && this.rawNick.startsWith(ConfigProvider.mobileUsernamePrefix);
    }

    /**
     * A user has been clicked.
     */
    public onUserClicked(): void {
        if(this.rawNick) {
            let userModal: any = this.modalCtrl.create(UserModalPage, {
                rawNick: this.rawNick
            });

            userModal.present();
        }
    }
}
