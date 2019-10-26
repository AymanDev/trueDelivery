import Markup from "telegraf/markup";
import {START_MESSAGE} from "../messages";

const startCommand = async (ctx)=>{
  ctx.reply(START_MESSAGE, Markup
    .keyboard([
      ['Login', 'Registration'] // Row1 with 2 buttons
    ])
    .oneTime()
    .resize()
    .extra()
  )
}

export default startCommand;