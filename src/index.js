'use strict';

import Telegraf from "telegraf";
import Telegram from "telegraf/telegram";
import session from "telegraf/session";
import loadCommands from "./commands";
import axios from "axios";
import {GET_INFO, REMOTE_URL} from "./helper";

require("dotenv").config();

const bot = new Telegraf(process.env.TOKEN);

bot.use(session());
bot.use(async (ctx, next) => {
  if (ctx.state.authorized) {
    return next();
  }

  try {
    const response = await axios.get(REMOTE_URL + GET_INFO, {
      params: {
        identifier: ctx.from.id,
        identifierType: 10
      }
    });
    ctx.state.authorized = true;
  } catch (err) {
    ctx.state.authorized = false;
  }
  return next();
});
loadCommands(bot);

const telegram = new Telegram(process.env.TOKEN);
bot.on("photo", async ctx => {
  console.log(ctx.message);
  const resp = await telegram.getFileLink(ctx.message.photo[2].file_id);
  console.log(resp);
});

bot.startPolling();
