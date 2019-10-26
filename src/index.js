'use strict';

import Telegraf from "telegraf";
import loadCommands from "./commands";

require("dotenv").config();

const bot = new Telegraf(process.env.TOKEN);

loadCommands(bot);

bot.startPolling();
