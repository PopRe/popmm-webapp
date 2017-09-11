export class Message {
    public text: string;
    public textSuffix: string;
    public author: string;
    public receiver: string;
    public type: string;
    public date: Date;

    public constructor(obj?: any) {
        this.text = obj && obj.text || null;
        this.textSuffix = obj && obj.textSuffix || null;
        this.author = obj && obj.author || null;
        this.receiver = obj && obj.receiver || null;
        this.type = obj && obj.type || null;
        this.date = obj && obj.date || new Date();
    }
}
