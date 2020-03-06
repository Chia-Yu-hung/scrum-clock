import line from "@line/bot-sdk";
import { UserInstance } from "../models/user";

/**
 * Help Message: user say help!!
 *
 */
export function HelpMessage(): line.TemplateMessage {
  return {
    type: "template",
    altText: "help list",
    template: {
      type: "buttons",
      title: "help list",
      text: "Help List",
      actions: [
        {
          type: "postback",
          label: "Game List",
          data: "action=activity_list"
        },
        {
          type: "postback",
          label: "Group List",
          data: "action=group_list"
        }
      ]
    }
  } as line.TemplateMessage;
}

export function MemberMessage(title: string, users: UserInstance[]): line.Message {
  let message = title || "";

  message += "\n";

  users.forEach((user, index) => {
    message += `${index + 1}.${user.display_name}\n`;
  });

  return {
    type: "text",
    text: message
  };
}
