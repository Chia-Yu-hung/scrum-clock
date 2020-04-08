import line from "@line/bot-sdk";
import { UserInstance } from "../models/user";

/**
 * Help Message: user say help!!
 *
 */
export function pickDrawMethodMessage(): line.TemplateMessage {
  return {
    type: "template",
    altText: "Draw ways",
    template: {
      type: "buttons",
      title: "Draw ways",
      text: "Draw ways",
      actions: [
        {
          type: "postback",
          label: "Normal",
          data: "action=normal"
        },
        {
          type: "postback",
          label: "Memory",
          data: "action=memory"
        }
      ]
    }
  } as line.TemplateMessage;
}

export function MemberMessage(
  title: string,
  users: UserInstance[]
): line.Message {
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
