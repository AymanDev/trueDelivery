import Stage from "telegraf/stage";
import Scene from "telegraf/scenes/base";
import axios from "axios";
import {CREATE_CLIENT, CREATE_COURIER, GET_INFO, REMOTE_URL} from "../helper";
import startCommand from "./startCommand";

const loadRegCommand = (bot) => {
  const stage = new Stage();
  const getFirstName = new Scene("getFirstName");
  stage.register(getFirstName);
  const getLastName = new Scene("getLastName");
  stage.register(getLastName);
  const getAddress = new Scene("getAddress");
  stage.register(getAddress);
  const getPhone = new Scene("getPhone");
  stage.register(getPhone);

  bot.use(stage.middleware());
  bot.hears("Registration as Client", async ctx => {
    if (ctx.state.authorized) {
      return ctx.reply("You already regustered");
    }

    ctx.session.mode = "client";
    await ctx.reply("Enter your first name:");
    await ctx.scene.enter("getFirstName");
  });
  bot.hears("Registration as Courier", async ctx => {
    if (ctx.state.authorized) {
      return ctx.reply("You already regustered");
    }

    ctx.session.mode = "courier";
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
    await ctx.scene.leave();

    if (ctx.session.mode === "courier") {
      ctx.reply("Enter your phone:");
      await ctx.scene.enter("getPhone");
    } else {
      ctx.reply("Send your location:");
      await ctx.scene.enter("getAddress");
    }
  });
  getPhone.on("text", async ctx => {
    // ctx.session.phone = ctx.message.text;
    await ctx.scene.leave();
    try {
      await axios.post(REMOTE_URL + CREATE_COURIER, {
        "FirstName": ctx.session.firstName,
        "LastName": ctx.session.lastName,
        "TelegramId": ctx.from.id,
        "TelegramChatId": ctx.chat.id,
        "Phone": ctx.message.text
      });
      await ctx.reply("Thank you for registering as courier!");
    } catch (err) {
      await ctx.reply("Something went wrong. Unexpected error occurred!")
    }

    await ctx.scene.leave();
    await startCommand(ctx);
  });
  getAddress.on("location", async ctx => {
    const {latitude, longitude} = ctx.message.location;
    ctx.reply("Thank you!");
    await ctx.scene.leave();
    try {
      await axios.post(REMOTE_URL + CREATE_CLIENT, {
        "FirstName": ctx.session.firstName,
        "LastName": ctx.session.lastName,
        "TelegramId": ctx.from.id,
        "TelegramChatId": ctx.chat.id,
        "DefaultAddressCoords": `${latitude},${longitude}`
      });
      ctx.reply("You registered successfully!");
    } catch (err) {
      ctx.reply("While registering unexpected error occurred. Try register later!");
    }
    await startCommand(ctx);
  })
};

export default loadRegCommand;