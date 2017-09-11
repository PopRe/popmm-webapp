import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'userStatus',
})

export class UserStatusPipe implements PipeTransform {
    /**
     * Takes a status integer and transforms it into a readable status or an image representing the status.
     */
    public transform(status: number, ...args: Array<any>): string {
        let value: boolean|string = '';

        switch(status) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                value = 'assets/images/game-statuses/' + status + '.svg';
                break;
            case 6:
                value = 'away';
                break;
            case 7:
                value = 'busy';
                break;
            case 8:
                value = 'brb';
                break;
            case 9:
                value = 'afk';
                break;
            case 10:
                value = 'eating';
                break;
            case 11:
                value = 'school';
                break;
            case 12:
                value = 'sleeping';
                break;
            case 13:
                value = 'bot';
                break;
            case 14:
                value = 'at work';
                break;
            case 15:
                value = 'custom';
                break;
            default:
                value = '';
                break;
        }

        return value;
    }
}
