export const channelSecret: string = process.env.API_SECRET;
export const channelAccessToken: string = process.env.API_ACCESS_TOKEN;
export const path: string = "/callback";

export enum Role {
  User = 1,
  Manager = 2,
  Maintainer = 3,
  Administrator = 4
}

export enum Status {
  Normal = "normal",
  Deleted = "deleted",
  Completed = "completed"
}

export enum UserType {
  Line = "Line",
  Unknown = "Unknown"
}

export const TITLE_MESSAGE = "Scrum Starting...";

export const LINE_VERIFY_USER_ID = "Uc3761bdd841cf02e1247073c02ca1f8f";
