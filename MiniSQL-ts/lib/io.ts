export interface ILogger {
    log(message?: any, ...optionalParams: any[]): void;
}

export class FakeConsole implements ILogger {
    log(message?: any, ...optionalParams: any[]): void {
        // do nothing here
    }
}