import startCommand from "./commands/startCommand";
import loadRegCommand from "./commands/regCommand";
import loadOrderCommand from "./commands/orderCommand";
import axios from "axios";
import {GET_INFO, REMOTE_URL} from "./helper";

const loadCommands = (bot) => {
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
      console.log("Auth result");
      ctx.state.authorized = true;
      ctx.state.isCourier = response.data.isCourier;
    } catch (err) {
      ctx.state.authorized = false;
    }
    return next();
  });

  bot.start(startCommand);
  loadRegCommand(bot);

  bot.use((ctx, next) => {
    if (ctx.state.authorized) {
      return next();
    }

    return ctx.reply("Unauthorized to use this commands!")
  });
  loadOrderCommand(bot);
};

export default loadCommands;