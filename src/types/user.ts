export enum Status {
  Busy,
  Offline,
  Online,
}

export default interface User {
  user_id: number;
  status: Status;
}
