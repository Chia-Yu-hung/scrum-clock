import Context from "koa-line-message-router/dist/lib/context";
import { ActivityInstance } from "./models/activity";
import { UserInstance } from "./models/user";
export type LastActivityContext = Context & {
  lastActivity: ActivityInstance;
};

export type UsersContext = Context & {
  users: UserInstance[];
};
