import WizardScene from "telegraf/scenes/wizard";
import Stage from "telegraf/stage";
import Scene from "telegraf/scenes/base";

const loadRegCommand = (bot) => {
  const stage = new Stage();
  const getFirstName = new Scene("getFirstName");
  stage.register(getFirstName);
  const getLastName = new Scene("getLastName");
  stage.register(getLastName);
  const getAddress = new Scene("getAddress");
  stage.register(getAddress);

  bot.use(stage.middleware());

  bot.command("reg", async ctx => {
    await ctx.reply("Enter your first name:");
    await ctx.scene.enter("getFirstName");
  });

  getFirstName.on("text", async ctx => {
    ctx.session.fistName = ctx.message.text;
    ctx.reply("Enter your last name:");
    await ctx.scene.leave();
    await ctx.scene.enter("getLastName");
  });
  getLastName.on("text", async ctx => {
    ctx.session.lastName = ctx.message.text;
    ctx.reply("Enter your address:");
    await ctx.scene.leave();
    await ctx.scene.enter("getAddress");
  });
  getAddress.on("text", async ctx => {
    ctx.session.address = ctx.message.text;
    ctx.reply("Thank you!");
    await ctx.scene.leave();
  })
};

export default loadRegCommand;