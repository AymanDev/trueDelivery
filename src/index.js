'use strict';

import Telegraf from "telegraf";
import session from "telegraf/session";
import loadCommands from "./commands";

require("dotenv").config();

const bot = new Telegraf(process.env.TOKEN);

bot.use(session());
loadCommands(bot);

bot.startPolling();
