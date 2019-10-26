import WizardScene from "telegraf/scenes/wizard";
import Stage from "telegraf/stage";
import Scene from "telegraf/scenes/base";
import axios from "axios";
import {CREATE_CLINE, GET_INFO, REMOTE_URL} from "../helper";
import startCommand from "./startCommand";

const loadRegCommand = (bot) => {
  const stage = new Stage();
  const getFirstName = new Scene("getFirstName");
  stage.register(getFirstName);
  const getLastName = new Scene("getLastName");
  stage.register(getLastName);
  const getAddress = new Scene("getAddress");
  stage.register(getAddress);

  bot.use(stage.middleware());

  bot.hears("Registration as Client", async ctx => {
    await ctx.reply("Enter your first name:");
    await ctx.scene.enter("getFirstName");
  });

  getFirstName.on("text", async ctx => {
    ctx.session.firstName = ctx.message.text;
    ctx.reply("Enter your last name:");
    await ctx.scene.leave();
    await ctx.scene.enter("getLastName");
  });
  getLastName.on("text", async ctx => {
    ctx.session.lastName = ctx.message.text;
    ctx.reply("Send your location:");
    await ctx.scene.leave();
    await ctx.scene.enter("getAddress");
  });

  getAddress.on("location", async ctx => {
    const {latitude, longitude} = ctx.message.location;
    ctx.reply("Thank you!");
    await ctx.scene.leave();
    try {
      const response = await axios.post(REMOTE_URL + CREATE_CLINE, {
        "FirstName": ctx.session.firstName,
        "LastName": ctx.session.lastName,
        "TelegramId": ctx.from.id,
        "DefaultAddressCoords": `${latitude},${longitude}`
      });
      ctx.reply("You registered successfully!");
    } catch (err) {
      ctx.reply("While registering unexpected error occurred. Try register later!");
      await startCommand(ctx);
    }
  })
};

export default loadRegCommand;