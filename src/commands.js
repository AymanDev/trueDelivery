import startCommand from "./commands/startCommand";
import loadRegCommand from "./commands/regCommand";

const loadCommands = (bot) => {
  bot.start(startCommand);
  loadRegCommand(bot);
};

export default loadCommands;