import {TestBed, ComponentFixture, async} from "@angular/core/testing";
import {IonicModule} from "ionic-angular";
import {MyApp} from "./app.component";
import {LoginPage} from "../pages/login/login";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {} from "jasmine";

let comp: MyApp;
let fixture: ComponentFixture<MyApp>;

describe('Root Component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MyApp],
            providers: [
                StatusBar,
                SplashScreen
            ],
            imports: [
                IonicModule.forRoot(MyApp)
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MyApp);
        comp = fixture.componentInstance;
    });

    afterEach(() => {
        fixture.destroy();
        comp = null;
    });

    it('is created', () => {
        expect(fixture).toBeTruthy();
        expect(comp).toBeTruthy();
    });

    it('initialises with a root page of LoginPage', () => {
        expect(comp['rootPage']).toBe(LoginPage);
    });
});
