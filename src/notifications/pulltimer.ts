import * as utils from '../utils';
import { setTimeout, clearTimeout } from 'timers';

export class PullTimer {

  log: any;
  interval: number;
  handler: any;
  successHandler: any;

  private timeout?: ReturnType<typeof setTimeout>;

  constructor(log: any, interval: number, handler: any, successHandler: any) {
    this.log = log;
    this.interval = interval;
    this.handler = handler;
    this.successHandler = successHandler;
  }

  start() {
    if (!this.timeout) {
      this.timeout = setTimeout(this.handleTimer.bind(this), this.interval);
    } else {
      this.timeout.refresh();
    }
  }

  resetTimer() {
    if (!this.timeout) {
      return;
    }

    this.timeout.refresh();
  }

  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = undefined;
  }

  private handleTimer() {
    this.handler(utils.once((error: Error | null, value?: any) => {
      if (error) {
        this.log('Error occurred while pulling update from switch: ' + error.message);
      } else {
        this.successHandler(value);
      }

      this.resetTimer();
    }));
  }

}
