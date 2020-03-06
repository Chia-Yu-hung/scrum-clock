import moment from "moment";
export class Timer {
  private alarmTime: moment.Moment;
  private fn: () => void;
  private skipWeekend: boolean;
  private timer: NodeJS.Timeout;
  constructor(time: moment.Moment, fn: () => void) {
    this.alarmTime = time;
    this.fn = fn;
    this.skipWeekend = true;
  }

  async run() {
    console.log("clock starting....");
    let now = moment();
    let diff = moment(this.alarmTime, "HH:mm:ss").diff(
      moment(now, "HH:mm:ss"),
      "second"
    );

    // if the alarm time after then now add one day
    while (diff <= 0 || this.isWeekend(this.alarmTime)) {
      this.alarmTime = moment(this.alarmTime).add(1, "d");
      diff = moment(this.alarmTime, "HH:mm:ss").diff(
        moment(now, "HH:mm:ss"),
        "second"
      );
    }

    console.log(
      `next alarm time is ${this.alarmTime.format(
        "YYYY-MM-DD"
      )} - ${this.alarmTime.format("HH:mm:ss")}`
    );
    this.timer = setTimeout(async () => {
      this.fn && (await this.fn());
      await this.run();
    }, diff * 1000);
  }

  stop() {
    clearTimeout(this.timer);
  }

  setAlertTime(time: moment.Moment) {
    this.alarmTime = time;
  }

  getAlertTime(): moment.Moment {
    return this.alarmTime;
  }

  setSkipWeekend(val: boolean) {
    this.skipWeekend = val;
  }

  isWeekend(day: moment.Moment): boolean {
    let num = day.format("d");
    // 0 for sunday 6 for satarday
    if (this.skipWeekend && (num === "6" || num === "0")) return true;
    return false;
  }
}
