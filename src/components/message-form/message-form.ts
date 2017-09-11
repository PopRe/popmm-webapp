import {Component, ViewChild} from "@angular/core";
import {TextInput} from "ionic-angular";
import {UserProvider} from "../../providers/user/user";
import {SocketProvider} from "../../providers/socket/socket";
import {MessageProvider} from "../../providers/message/message";
import {Subscription} from "rxjs/Subscription";
import {Message} from "../../providers/message/message.model";
import {ConfigProvider} from "../../providers/config/config";

@Component({
    selector: 'message-form',
    templateUrl: 'message-form.html'
})
export class MessageFormComponent {
    private _composePrivateMessageSubscription: Subscription;
    private _disconnectSubscription: Subscription;
    private receiver: string;
    private message: string;
    @ViewChild('input') private textInput: TextInput;

    public constructor(private userProvider: UserProvider,
                       private socketProvider: SocketProvider,
                       private messageProvider: MessageProvider) {
        this._composePrivateMessageSubscription = this.messageProvider.onComposePrivateMessage().subscribe((nick: string) => {
            this.composePm(nick);
        });

        this._disconnectSubscription = this.socketProvider.onDisconnect().subscribe((reason: string) => {
            this._disconnectSubscription.unsubscribe();
            this._composePrivateMessageSubscription.unsubscribe();
        });
    }

    /**
     * Prepare a private message to a user.
     *
     * @param receiver
     */
    public composePm(receiver: string): void {
        this.receiver = receiver;
        setTimeout(() => {
            this.textInput.setFocus();
        }, 0);
    }

    /**
     * Close private message.
     */
    public closePm(): void {
        this.receiver = '';
        this.textInput.setFocus();
    }

    /**
     * Key down event fired in message input.
     *
     * @param event Key down event.
     */
    public messageKeyDown(event: any): void {
        if(event.keyCode === 8 && this.receiver && !event.target.value) {
            this.receiver = '';
        }
    }

    /**
     * Message has been submitted.
     *
     * @param form Submitted form.
     */
    public messageSubmitted(form: {message: string}): void {
        if(form.message) {
            if(this.receiver) {
                // There is a receiver which means it's a private message
                let users: any = this.userProvider.getUsersByNick(this.receiver);

                if(users && users.length > 0) {
                    for(let user of users) {
                        this.socketProvider.sendPrivate(user.rawNick, form.message);
                    }

                    this.messageProvider.addMessage(new Message({
                        type: 'OWN_PVT',
                        text: form.message,
                        author: ConfigProvider.mobileUsernamePrefix + this.socketProvider.serverDetails.username,
                        receiver: users[0].rawNick
                    }));
                }
            } else {
                // There's no receiver so it's a public message
                this.socketProvider.sendPublic(form.message);
                this.messageProvider.addMessage(new Message({
                    type: 'OWN_CHAT',
                    text: form.message,
                    author: ConfigProvider.mobileUsernamePrefix + this.socketProvider.serverDetails.username
                }));
                this.receiver = '';
            }
        } else {
            // Clear possible receiver if an empty message has been submitted
            this.receiver = '';
        }

        // Clear message after submit
        this.message = '';
    }
}
