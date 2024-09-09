Math.floor(Date.now() / 1000);

export class DateTimeHelpers {
    static currentTimeInSecs(): number {
        return Math.floor(Date.now() / 1000);
    }
}