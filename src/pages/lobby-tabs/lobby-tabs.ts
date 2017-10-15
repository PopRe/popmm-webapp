import {Component, ViewChild} from "@angular/core";
import {HutListTabPage} from "../hut-list-tab/hut-list-tab";
import {ChatTabPage} from "../chat-tab/chat-tab";
import {UserListTabPage} from "../user-list-tab/user-list-tab";
import {UserProvider} from "../../providers/user/user";
import {MessageProvider} from "../../providers/message/message";
import {Subscription} from "rxjs/Subscription";
import {SuperTabs} from "ionic2-super-tabs";
import {SocketProvider} from "../../providers/socket/socket";
import {NavController} from "ionic-angular";
import {LoginPage} from "../login/login";

@Component({
    selector: 'page-lobby-tabs',
    templateUrl: 'lobby-tabs.html',
    host: {
        '(window:resize)': 'onResize($event)'
    }
})

export class LobbyTabsPage {
    private _anyErrorSubscription: Subscription;
    private _composePrivateMessageSubscription: Subscription;
    private _disconnectSubscription: Subscription;
    @ViewChild('superTabs') private superTabs: SuperTabs;
    public hutListTabRoot: any = HutListTabPage;
    public chatTabRoot: any = ChatTabPage;
    public userListTabRoot: any = UserListTabPage;
    public selectedTab: number = 1;
    public screenWidth: number;


    public constructor(private userProvider: UserProvider,
                       private messageProvider: MessageProvider,
                       private socketProvider: SocketProvider,
                       private navCtrl: NavController) {
        this.screenWidth = window.innerWidth;

        this._anyErrorSubscription = this.socketProvider.onAnyError().subscribe((error: any) => {
            this.socketProvider.disconnect();
        });

        this._composePrivateMessageSubscription = this.messageProvider.onSlideToChatTabToComposePrivateMessage().subscribe((nick: string) => {
            // Switch to chat page when composing private message
            if(this.superTabs) {
                this.superTabs.slideTo(1);

                // Compose private message only after animation has completed, has to be done in this hacky way
                // since super tabs apparently doesn't have any animation complete callback
                setTimeout(() => {
                    this.messageProvider.composePrivateMessage(nick);
                }, this.superTabs.config.transitionDuration);
            }
        });

        this._disconnectSubscription = this.socketProvider.onDisconnect().subscribe((reason: string) => {
            this.navCtrl.popToRoot();
        });
    }

    /**
     * Screen has been re-sized.
     *
     * @param event Resize event.
     */
    public onResize(event: any): void {
        this.screenWidth = event.target.innerWidth;
        this.userProvider.notifySubscribers();
        this.messageProvider.notifySubscribers();
    }

    /**
     * Page will be destroyed.
     */
    public ionViewWillUnload(): void {
        if(this.socketProvider) {
            this._anyErrorSubscription.unsubscribe();
            this.socketProvider.disconnect();
        }
    }
}
