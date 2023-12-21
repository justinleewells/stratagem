export default class Event {
  constructor(type) {
    this.type = type;
    this.canceled = false;
  }
  cancel() {
    this.canceled = true;
  }
}
