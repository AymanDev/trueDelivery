import Telegraf from "telegraf";

require("dotenv").config();

const bot = new Telegraf(process.env.TOKEN);