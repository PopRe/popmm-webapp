import {NgModule, ErrorHandler} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {IonicApp, IonicModule, IonicErrorHandler} from "ionic-angular";
import {MyApp} from "./app.component";

import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {HttpModule} from "@angular/http";
import {LoginPage} from "../pages/login/login";

import {ApiProvider} from "../providers/api/api";
import {MessageProvider} from '../providers/message/message';
import {MessageListComponent} from '../components/message-list/message-list';
import {SocketProvider} from '../providers/socket/socket';
import {MessageFormComponent} from '../components/message-form/message-form';
import {DataFilterProvider} from '../providers/data-filter/data-filter';
import {UserProvider} from '../providers/user/user';
import {UserListComponent} from '../components/user-list/user-list';
import {HelperProvider} from '../providers/helper/helper';
import {ConfigProvider} from '../providers/config/config';
import {HutListComponent} from '../components/hut-list/hut-list';
import {UserComponent} from '../components/user/user';
import {UserStatusPipe} from '../pipes/user-status/user-status';
import {LobbyTabsPage} from "../pages/lobby-tabs/lobby-tabs";
import {HutListTabPage} from "../pages/hut-list-tab/hut-list-tab";
import {UserListTabPage} from "../pages/user-list-tab/user-list-tab";
import {SuperTabsModule} from "ionic2-super-tabs";
import {ChatTabPage} from "../pages/chat-tab/chat-tab";
import {ChatComponent} from "../components/chat/chat";
import {UserModalPage} from "../pages/user-modal/user-modal";
import {IonicStorageModule} from "@ionic/storage";

@NgModule({
    declarations: [
        MyApp,
        LoginPage,
        LobbyTabsPage,
        HutListTabPage,
        ChatTabPage,
        UserListTabPage,
        ChatComponent,
        MessageListComponent,
        MessageFormComponent,
        UserListComponent,
        HutListComponent,
        UserComponent,
        UserStatusPipe,
        UserModalPage
    ],
    imports: [
        BrowserModule,
        HttpModule,
        IonicModule.forRoot(MyApp),
        IonicStorageModule.forRoot(),
        SuperTabsModule.forRoot()
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        LoginPage,
        LobbyTabsPage,
        HutListTabPage,
        ChatTabPage,
        UserListTabPage,
        UserModalPage

    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        ApiProvider,
        SocketProvider,
        DataFilterProvider,
        UserProvider,
        MessageProvider,
        HelperProvider,
        ConfigProvider
    ]
})
export class AppModule {
}
