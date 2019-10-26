'use strict';

import Telegraf from "telegraf";

require("dotenv").config();

const bot = new Telegraf(process.env.TOKEN);

bot.start(ctx => ctx.reply("Hello"));
bot.hears("hui", async ctx => {
  await ctx.reply("LEZHAT + SOSAT'")
});
bot.on('sticker', async ctx => {
  await ctx.reply('👍')
});

bot.startPolling();
