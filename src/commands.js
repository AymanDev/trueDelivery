import startCommand from "./commands/startCommand";
import regCommand from "./commands/regCommand";

const loadCommands = (bot) => {
  bot.start(startCommand);
  bot.command("reg", regCommand);
};

export default loadCommands;