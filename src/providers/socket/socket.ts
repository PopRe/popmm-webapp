import {Injectable} from "@angular/core";
import * as io from "socket.io-client";
import "rxjs/add/operator/map";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {ConfigProvider} from "../config/config";

@Injectable()
export class SocketProvider {
    private _socket: SocketIOClient.Socket;
    private _connectSubject: Subject<{}> = new Subject();
    private _anyErrorSubject: Subject<{}> = new Subject();
    private _rawDataSubject: Subject<{}> = new Subject();
    private _disconnectSubject: Subject<string> = new Subject<string>();
    public serverDetails: any;

    public constructor() {

    }

    /**
     * Connect to socket server.
     *
     * @param serverDetails Details to connect with to IRC through the socket server.
     */
    public connect(serverDetails: any): void {
        this.serverDetails = serverDetails;

        this._socket = io(ConfigProvider.websocketServerHost, {
            reconnection: false,
            transports: ['websocket', 'xhr-polling'],
            autoConnect: false
        });

        this._socket.on('connect', () => {
            this._socket.emit('ircDetails', this.serverDetails);
            this._connectSubject.next();
        });

        this._socket.on('connect_timeout', (error: any) => {
            this.notifyErrorSubscribers(error);
        });

        this._socket.on('connect_error', (error: any) => {
            this.notifyErrorSubscribers(error);
        });

        this._socket.on('error', (error: any) => {
            this.notifyErrorSubscribers(error);
        });

        this._socket.on('irc_error', (error: any) => {
            this.notifyErrorSubscribers(error);
        });

        this._socket.on('disconnect', (reason: any) => {
            this._disconnectSubject.next(reason);
        });

        this._socket.on('raw', (data: any) => {
            // Received a raw message from the IRC server and it could be anything
            this._rawDataSubject.next(data);
        });

        this._socket.open();
    }

    /**
     * Send a private message to a user.
     *
     * @param {string} rawNick The raw nick to send to.
     * @param {string} message The message to send.
     */
    public sendPrivate(rawNick: string, message: string): void {
        this._socket.emit('private', {user: rawNick, text: message});
    }

    /**
     * Send public message to channel.
     *
     * @param {string} message The message to send.
     */
    public sendPublic(message: string): void {
        this._socket.emit('channel', {text: message});
    }

    /**
     * Disconnect web socket.
     */
    public disconnect(): void {
        this._socket.disconnect();
    }

    /**
     * Notify that an error has occurred.
     *
     * @param error The error.
     */
    public notifyErrorSubscribers(error: any): void {
        this._anyErrorSubject.next(error);
    }

    /**
     * Return connection subscription.
     *
     * @returns {Observable<{}>} Observable connection.
     */
    public onConnected(): Observable<{}> {
        return this._connectSubject.asObservable();
    }

    /**
     * Returns error subscription.
     *
     * @returns {Observable<{}>} Observable error.
     */
    public onAnyError(): Observable<{}> {
        return this._anyErrorSubject.asObservable();
    }

    /**
     * Returns raw data subscription.
     *
     * @returns {Observable<{}>} Observable raw data.
     */
    public onRawData(): Observable<{}> {
        return this._rawDataSubject.asObservable();
    }

    /**
     * Returns disconnection subscription.
     *
     * @returns {Observable<string>} observable disconnection.
     */
    public onDisconnect(): Observable<string> {
        return this._disconnectSubject.asObservable();
    }
}
