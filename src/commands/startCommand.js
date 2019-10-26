import {START_MESSAGE} from "../messages";

const startCommand = async (ctx) => {
  await ctx.reply(START_MESSAGE);
};

export default startCommand;