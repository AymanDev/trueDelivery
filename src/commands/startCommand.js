import {START_MESSAGE} from "../messages";

const startCommand = async (ctx) => {
  ctx.reply(START_MESSAGE)
  ctx.state.name = ctx.from.first_name;
};

export default startCommand;