import { UserInstance } from "../models/user";
import { updateUserCount } from "../modules/userHepler";

interface Anything {
  [key: string]: any;
}

export class LotteryDrawer {
  private members: UserInstance[];
  private quantity: number;
  constructor(members: UserInstance[], quantity: number) {
    this.members = members;
    this.quantity = quantity;
  }

  draw(): string {
    return "";
  }
  setQuantilty(quantity: number) {
    this.quantity = quantity;
  }

  getQuantilty(): number {
    return this.quantity;
  }

  setMember(members: UserInstance[]) {
    this.members = members;
  }

  getMember(): UserInstance[] {
    return this.members;
  }

  async normalDraw() {
    let gonnaDraw = this.members;
    // shuffle the sort
    this.shuffle(gonnaDraw);
    const lucky_guy = gonnaDraw[this.getRandomNumber(0, gonnaDraw.length)];
    return lucky_guy.display_name;
  }

  async memoryDraw() {
    let gonnaDraw = this.getMembersListAccordWeight() as Anything[];
    // shuffle the sort
    this.shuffle(gonnaDraw);
    const lucky_guy = gonnaDraw[this.getRandomNumber(0, gonnaDraw.length)];
    await updateUserCount(lucky_guy.id);
    return lucky_guy.display_name;
  }

  shuffle(array: Array<Object>) {
    // shuffle list
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  //min=0, max=100, returns a random integer from 0 to 99
  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  getMembersListAccordWeight(): Object[] {
    //cording weight put the user in list
    let gonnaDraw = [];
    for (let num = 0; num < this.members.length; num++) {
      let weight = Math.round(this.members[num].count);
      for (let time = 0; time < weight; time++) {
        let member = {} as any;
        member.id = this.members[num].id;
        member.display_name = this.members[num].display_name;
        member.change = 0;
        gonnaDraw.push(member);
      }
    }

    return gonnaDraw;
  }

  getDrawChangeOfMember(): Object[] {
    let gonnaDraw = this.getMembersListAccordWeight() as Anything[];
    const draw_times = 10000;
    for (let num = 0; num < draw_times; num++) {
      // shuffle the sort
      this.shuffle(gonnaDraw);
      gonnaDraw[this.getRandomNumber(0, gonnaDraw.length)].change++;
    }

    let members = [] as Anything[];
    gonnaDraw.forEach(member => {
      var data = {} as any;
      data.name = member.display_name;
      data.change = member.change / draw_times;
      let repeater = members.find(item => {
        if (item.name === data.name) {
          // add same member's change
          item.change = item.change + data.change;
        }
        return item.name === data.name;
      });
      // if member is new, add to list
      if (repeater === undefined) members.push(data);
    });

    return members;
  }
}
