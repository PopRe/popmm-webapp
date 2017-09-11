import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from "rxjs/Observable";
import {Message} from "./message.model";
import {Subject} from "rxjs/Subject";
import {Subscription} from "rxjs/Subscription";
import {SocketProvider} from "../socket/socket";

@Injectable()
export class MessageProvider {
    private _messagesSubject: Subject<Message[]> = new Subject<Message[]>();
    private _disconnectSubscription: Subscription;
    private _slideToChatTabToComposePrivateMessageReceiver: Subject<string> = new Subject<string>();
    private _nickSubject: Subject<string> = new Subject<string>();
    private _messages: Array<Message> = [];
    private _welcomeMsg: string;

    public constructor(private socketProvider: SocketProvider) {
        this._disconnectSubscription = this.socketProvider.onDisconnect().subscribe((reason: string) => {
            this.clear();
        });
    }

    /**
     * Add a message.
     *
     * @param message The message.
     */
    public addMessage(message: Message): void {
        this._messages.push(message);
        this.notifySubscribers();
    }

    /**
     * Notify subscribers of messages update.
     */
    public notifySubscribers(): void {
        this._messagesSubject.next(this._messages);
    }

    /**
     * Clear messages by notifying subscribers of empty messages.
     */
    public clear(): void {
        this._messages = [];
        this.notifySubscribers();
    }

    /**
     * Set lobby welcome message.
     *
     * @param text The welcome message text.
     */
    public setWelcomeMessage(text: string): void {
        this._welcomeMsg = text;
    }

    /**
     * Get lobby welcome message.
     *
     * @returns {string} The welcome message.
     */
    public getWelcomeMessage(): string {
        return this._welcomeMsg;
    }

    /**
     * Get observable for new message.
     *
     * @returns {Observable<Message[]>} The observable messages.
     */
    public onMessage(): Observable<Message[]> {
        return this._messagesSubject.asObservable();
    }

    /**
     * Notify subscribers that chat tab should be slided to in order to compose private message to a user.
     */
    public slideToChatTabToComposePrivateMessage(nick: string): void {
        this._slideToChatTabToComposePrivateMessageReceiver.next(nick);
    }

    /**
     * Notify subscribers of a new composition of private message to a user.
     *
     * @param nick The user nick to compose private message to.
     */
    public composePrivateMessage(nick: string): void {
        this._nickSubject.next(nick);
    }

    /**
     * Get observable for sliding to chat tab subscription.
     *
     * @returns {Observable<any>} The observable nick to compose message to when sliding to chat.
     */
    public onSlideToChatTabToComposePrivateMessage(): Observable<string> {
        return this._slideToChatTabToComposePrivateMessageReceiver.asObservable();
    }

    /**
     * Get observable for new private message composition subscription.
     *
     * @returns {Observable<string>} The observable nick to compose private message to.
     */
    public onComposePrivateMessage(): Observable<string> {
        return this._nickSubject.asObservable();
    }
}
