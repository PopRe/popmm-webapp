import {Component} from "@angular/core";
import {NavController, LoadingController, ToastController, Toast, Loading, NavParams} from "ionic-angular";
import {Md5} from "ts-md5/dist/md5";
import * as xml2js from "xml2js";
import {SocketProvider} from "../../providers/socket/socket";
import {Storage} from '@ionic/storage';
import {Subscription} from "rxjs/Subscription";
import {ApiProvider} from "../../providers/api/api";
import {MessageProvider} from "../../providers/message/message";
import {HelperProvider} from "../../providers/helper/helper";
import {ConfigProvider} from "../../providers/config/config";
import {DataFilterProvider} from "../../providers/data-filter/data-filter";
import {LobbyTabsPage} from "../lobby-tabs/lobby-tabs";

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})

export class LoginPage {
    private _anyErrorSubscription: Subscription;
    private _connectedSubscription: Subscription;
    private _disconnectSubscription: Subscription;
    private _toast: Toast;
    public isInternetExplorer: boolean;
    public forgotPasswordUrl: string = ConfigProvider.forgotPasswordUrl;
    public registrationUrl: string = ConfigProvider.registrationUrl;
    public username: string;
    public password: string;
    public rememberMe: string;

    public constructor(public navCtrl: NavController,
                       private loadingCtrl: LoadingController,
                       private toastCtrl: ToastController,
                       private navParams: NavParams,
                       private api: ApiProvider,
                       private storage: Storage,
                       private socketProvider: SocketProvider,
                       private messageProvider: MessageProvider,
                       private dataFilterProvider: DataFilterProvider) {
        this.isInternetExplorer = HelperProvider.detectInternetExplorer();

        let error: any = this.navParams.get('error');

        if(error) {
            this._toast = this.toastCtrl.create({
                duration: ConfigProvider.toastDuration,
                showCloseButton: true
            });

            this._toast.setMessage(error.args[0]).present();
        }

        this._disconnectSubscription = this.socketProvider.onDisconnect().subscribe((reason: string) => {
            this._disconnectSubscription.unsubscribe();
            this._anyErrorSubscription.unsubscribe();
            this._connectedSubscription.unsubscribe();
        });
    }

    /**
     * Page is loaded for the first time
     */
    public ionViewDidLoad(): void {
        // Check if login credentials are stored and then automatically login
        this.storage.get('credentials').then((credentials: any) => {
            if(credentials && credentials.username && credentials.password) {
                this.username = credentials.username;
                this.rememberMe = credentials.rememberMe;
                this.submitLogin(credentials, true);
            }
        });
    }

    /**
     * Login has been submitted.
     *
     * @param loginData Login credentials and extra parameters to be sent in login request.
     * @param {boolean} skipHash
     */
    public submitLogin(loginData: {[s: string]: string}, skipHash: boolean = false): void {
        if(this._toast) {
            this._toast.dismissAll();
        }

        this._toast = this.toastCtrl.create({duration: ConfigProvider.toastDuration, showCloseButton: true});

        if(!loginData.rememberMe) {
            this.storage.remove('credentials');
        }

        // Create a copy of post data to prevent modifications to apply permanently in case login fails
        let credentials: {[s: string]: string} = Object.assign({}, loginData);

        if(!credentials.username) {
            this._toast.setMessage('Username is required').present();
            return;
        } else {
            credentials.username = credentials.username.trim();
        }

        if(!credentials.password) {
            this._toast.setMessage('Password is required').present();
            return;
        }

        let loading: Loading = this.loadingCtrl.create({content: ''});
        loading.setContent('Signing in').present();

        // Backwards compatibility for PopRe, will be hashed using another algorithm on server
        if(!skipHash) {
            credentials.password = <string>Md5.hashStr(credentials.password);
        }

        // PopRe login requires this
        credentials.login = 'Login';

        this.api.post(ConfigProvider.popreUrl + 'matchmaker/login.php', credentials).then((data: any) => {
            return new Promise((resolve: any, reject: any): void => {
                xml2js.parseString(data._body, (err: Error, result: any): void | Error => {
                    if(err) {
                        throw new Error('Failed to parse XML/HTML from login server');
                    } else {
                        resolve(LoginPage.handleLoginResponse(credentials.username, result));
                    }
                });
            });
        }).then((serverDetails: any) => {
            this._anyErrorSubscription = this.socketProvider.onAnyError().subscribe((error: any) => {
                this._anyErrorSubscription.unsubscribe();
                loading.dismiss();
                this._toast.setMessage('Could not connect to server').present();
            });
            this._connectedSubscription = this.socketProvider.onConnected().subscribe(() => {
                this._connectedSubscription.unsubscribe();
                loading.dismiss();
                // Switch to lobby page
                this.navCtrl.push(LobbyTabsPage, {});
            });
            this.messageProvider.setWelcomeMessage(serverDetails.welcomeMsg);
            this.dataFilterProvider.setUser(serverDetails.username);
            this.socketProvider.connect(serverDetails);

            if(loginData.rememberMe) {
                this.storage.set('credentials', {
                    username: credentials.username,
                    password: credentials.password,
                    rememberMe: true
                });
            }
        }).catch((error: Error) => {
            loading.dismiss();
            this._toast.setMessage(error.message).present();
        });
    }

    /**
     * Extract data from the response and push LobbyPage.
     * @param username string The submitted username.
     * @param result object The response data.
     */
    public static handleLoginResponse(username: string, result: any): object | Error {
        if(HelperProvider.propertyExistsRecursive(result, ['login', 'lobby', '0', 'network', '0', 'server', '0', '$']) &&
            HelperProvider.propertyExistsRecursive(result, ['login', 'lobby', '0', 'network', '0', '$', 'name']) &&
            HelperProvider.propertyExistsRecursive(result, ['login', 'welcomemsg', '0'])) {
            let serverDetails: {[s: string]: string} = result.login.lobby[0].network[0].server[0].$;
            serverDetails.serverName = result.login.lobby[0].network[0].$.name;
            serverDetails.username = username;
            serverDetails.welcomeMsg = result.login.welcomemsg[0];
            return serverDetails;
        } else {
            throw new Error('Failed to log in');
        }
    }
}

