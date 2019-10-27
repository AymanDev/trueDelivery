import Markup from "telegraf/markup";
import {START_MESSAGE_AUTHORIZED, START_MESSAGE_UNAUTHORIZED} from "../messages";

const startCommand = async (ctx) => {
  if (!ctx.state.authorized) {
    ctx.reply(START_MESSAGE_UNAUTHORIZED, Markup
      .keyboard([
        ["Registration as Client", "Registration as Courier"]
      ])
      .oneTime()
      .resize()
      .extra()
    );
  } else {
    if (ctx.state.isCourier) {
      ctx.reply(START_MESSAGE_AUTHORIZED, Markup
        .keyboard([["Get orders"]])
        .oneTime()
        .resize()
        .extra());
    } else {
      ctx.reply(START_MESSAGE_AUTHORIZED, Markup
        .keyboard([["Make order", "Get orders"]])
        .oneTime()
        .resize()
        .extra());
    }

  }
};

export default startCommand;