export class User {
    public id: number;
    public rawNick: string;
    public nick: string;
    public status: number;
    public hutIndex: number;
    public hutPosition: number;
    public gameIndex: number;
    public blueAlly: boolean;
    public isStreaming: boolean;
    public allowsConferenceInvites: boolean;
    public allowsSpectators: boolean;
    public hasHutRestrictions: boolean;
    public canHost: boolean;
    public old_names: Array<string>;
    public clans: Array<{}>;
    public rank: number;
    public points: number;
    public grade: string;
    public sigma: number;
    public mu: number;
    public twitch: string;

    public constructor(obj?: any) {
        this.rawNick = obj && obj.rawNick || null;
        this.nick = obj && obj.nick || null;
        this.grade = '-1';
    }
}
