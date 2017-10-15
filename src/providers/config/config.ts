import {Injectable} from "@angular/core";

@Injectable()
export class ConfigProvider {
    public static websocketServerHost: string = 'ts.popre.net:9000';
    public static popreChannel: string = '#popmm';
    public static mobileUsernamePrefix: string = 'y000';
    public static popreUrl: string = 'https://www.popre.net/';
    public static forgotPasswordUrl: string = ConfigProvider.popreUrl + 'forum/ucp.php?mode=sendpassword';
    public static registrationUrl: string = ConfigProvider.popreUrl + 'forum/ucp.php?mode=register';
    public static userProfileUrl: string = ConfigProvider.popreUrl + 'user.php?username=';
    public static userGameHistory: string = ConfigProvider.popreUrl + 'game.php?u=';
    public static twitchUrl: string = 'https://twitch.tv/';
    public static joinSuffix: string = 'in';
    public static quitSuffix: string = 'out';
    public static toastDuration: number = 3000;
    public static autoScrollThreshold: number = 200;
}
