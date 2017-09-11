import {Component} from "@angular/core";
import {Message} from "../../providers/message/message.model";
import {Subscription} from "rxjs/Subscription";
import {MessageProvider} from "../../providers/message/message";
import {ConfigProvider} from "../../providers/config/config";
import {SocketProvider} from "../../providers/socket/socket";

@Component({
    selector: 'message-list',
    templateUrl: 'message-list.html',
})
export class MessageListComponent {
    private _messageSubscription: Subscription;
    private _disconnectSubscription: Subscription;
    public messages: Array<Message> = [];

    public constructor(private messageProvider: MessageProvider, private socketProvider: SocketProvider) {
        this._messageSubscription = this.messageProvider.onMessage().subscribe((messages: Array<Message>) => {
            this.messages = messages;
            setTimeout(() => {
                MessageListComponent.scrollDownIfNeeded();
            }, 0);
        });

        this._disconnectSubscription = this.socketProvider.onDisconnect().subscribe((reason: string) => {
            this._disconnectSubscription.unsubscribe();
            this._messageSubscription.unsubscribe();
        });
    }

    /**
     * Scrolls down lobby text area if necessary.
     */
    private static scrollDownIfNeeded(): void {
        let messageListWrapper: Element = document.getElementsByClassName('message-list-wrapper')[0];

        if(messageListWrapper) {
            let lobbyTextareaScrollable: HTMLElement = <HTMLElement>messageListWrapper.closest('.scroll-content');

            if(lobbyTextareaScrollable) {
                let scrollDown: number = lobbyTextareaScrollable.scrollHeight - lobbyTextareaScrollable.offsetHeight - lobbyTextareaScrollable.scrollTop;

                // Don't automatically scroll down if user has scrolled up above the pixel threshold
                if(scrollDown < ConfigProvider.autoScrollThreshold) {
                    lobbyTextareaScrollable.scrollTop = lobbyTextareaScrollable.scrollHeight;
                }
            }
        }
    }
}
