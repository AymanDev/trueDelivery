import {START_MESSAGE} from "../messages";

const startCommand = async (ctx)=>{
  ctx.reply(START_MESSAGE)
};

export default startCommand;