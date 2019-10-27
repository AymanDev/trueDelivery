import Stage from "telegraf/stage";
import Scene from "telegraf/scenes/base";
import Markup from "telegraf/markup";
import {CREATE_ORDER, FINISH_DELIVERY, GET_CLIENT_ORDERS, GET_ORDERS, REMOTE_URL, START_DELIVERY} from "../helper";
import axios from "axios";
import startCommand from "./startCommand";

const loadOrderCommand = (bot) => {
  const stage = new Stage();
  const getDescription = new Scene("getDescription");
  stage.register(getDescription);
  const getStartAddress = new Scene("getStartAddress");
  stage.register(getStartAddress);
  const getEndAddress = new Scene("getEndAddress");
  stage.register(getEndAddress);
  const getPhoto = new Scene("getPhoto");
  stage.register(getPhoto);
  const getRecipientDescription = new Scene("getRecipientDescription");
  stage.register(getRecipientDescription);
  const getOrderLocation = new Scene("getOrderLocation");
  stage.register(getOrderLocation);
  bot.use(stage.middleware());

  bot.hears("Make order", async ctx => {
    await ctx.reply("Enter order description:");
    await ctx.scene.enter("getDescription");
  });
  bot.hears("Get orders", async ctx => {
    if (ctx.state.isCourier) {
      await ctx.reply("Send your location:");
      await ctx.scene.enter("getOrderLocation");
    } else {
      try {
        const {data} = await axios.get(REMOTE_URL + GET_CLIENT_ORDERS, {
          params: {
            Identifier: ctx.from.id,
            IdentifierType: 10
          }
        });

        for (let index = 0; index < data.length; index++) {
          const order = data[index];
          if (order.Photo) {
            await ctx.replyWithPhoto({url: order.Photo});
          }
          let orderStatus = "In-progress";
          if (order.Status === 20) {
            orderStatus = "Delivering";
          }
          if (order.Status === 30) {
            orderStatus = "Completed";
          }
          await ctx.reply(`Description: ${order.Description}\nCreated at: ${order.CreationTimestamp}\nStart address:${order.StartAddress}\nEnd address:${order.EndAddress}\nStatus:${orderStatus}`);
        }
      } catch (err) {
        console.error(err);
        await startCommand(ctx);
      }
    }
  });
  getOrderLocation.on("location", async ctx => {
    const {latitude, longitude} = ctx.message.location;

    try {
      const {data} = await axios.get(REMOTE_URL + GET_ORDERS, {
        params: {
          Location: `${latitude},${longitude}`,
          Identifier: ctx.from.id,
          IdentifierType: 10
        }
      });
      ctx.session.data = data;
      for (let index = 0; index < data.length; index++) {
        const order = data[index];
        if (order.Photo) {
          await ctx.replyWithPhoto({url: order.Photo});
        }
        await ctx.reply(`Description: ${order.Description}\nCreated at: ${order.CreationTimestamp}\nStart address:${order.StartAddress}\nEnd address:${order.EndAddress}`,
          Markup.inlineKeyboard([[
            Markup.callbackButton("Take order", "take_order_" + index, order.State !== 10),
            Markup.callbackButton("Finish order", "finish_order_" + index, order.State !== 20)]
          ]).oneTime().resize().extra());
      }
    } catch (err) {
      console.error(err);
      await ctx.reply("Unexpected error occurred! Please try later!");
    }
    await ctx.scene.leave();
  });
  bot.action(/take_order_.*/g, async ctx => {
    if (!ctx.session.data) {
      return;
    }

    const id = Number(ctx.match[0].replace("take_order_", ""));
    const order = ctx.session.data[id];
    console.debug(order);
    try {
      const response = await axios.post(REMOTE_URL + START_DELIVERY, {
        Identifier: ctx.from.id,
        IdentifierType: 10,
        OrderId: order.Id
      });
      await ctx.reply("Delivery started! Delivery will take: " + response.data);
    } catch (err) {
      await ctx.reply("Unexpected error occurred!");
      console.error(err);
    }
    await startCommand(ctx);
  });
  bot.action(/finish_order_/g, async ctx => {
    if (!ctx.session.data) {
      return;
    }

    const id = Number(ctx.match[0].replace("finish_order_", ""));
    const order = ctx.session.data[id];
    console.debug(order);
    try {
      const response = await axios.post(REMOTE_URL + FINISH_DELIVERY, {
        orderId: order.Id
      });
      await ctx.reply("Delivery Finished! Time spent: " + response.data);
    } catch (err) {
      await ctx.reply("Unexpected error occurred!");
      console.error(err);
    }
    await startCommand(ctx);
  });

  getDescription.on("text", async ctx => {
    ctx.session.description = ctx.message.text;
    await ctx.reply("Send start location:");
    await ctx.scene.leave();
    await ctx.scene.enter("getStartAddress");
  });
  getStartAddress.on("location", async ctx => {
    ctx.session.startLocation = ctx.message.location;
    await ctx.reply("Send end location:");
    await ctx.scene.leave();
    await ctx.scene.enter("getEndAddress");
  });
  getEndAddress.on("location", async ctx => {
    ctx.session.endLocation = ctx.message.location;
    await ctx.reply("Send item photo:");
    await ctx.scene.leave();
    await ctx.scene.enter("getPhoto");
  });
  getPhoto.on("photo", async ctx => {
    ctx.session.photo = await ctx.telegram.getFileLink(ctx.message.photo[0].file_id)
    await ctx.reply("Enter recipient description:");
    await ctx.scene.leave();
    await ctx.scene.enter("getRecipientDescription");
  });
  getRecipientDescription.on("text", async ctx => {
    ctx.session.recipientDescription = ctx.message.text;
    try {
      await axios.post(REMOTE_URL + CREATE_ORDER, {
        Description: ctx.session.description,
        StartAddressCoords: `${ctx.session.startLocation.latitude},${ctx.session.startLocation.longitude}`,
        EndAddressCoords: `${ctx.session.endLocation.latitude},${ctx.session.endLocation.longitude}`,
        Photo: ctx.session.photo,
        RecipientDescription: ctx.session.recipientDescription,
        Identifier: ctx.from.id,
        IdentifierType: 10
      });
      await ctx.reply("Order was sent!");
    } catch (err) {
      await ctx.reply("Order sending error!")
    }
    await ctx.scene.leave();
    await startCommand(ctx);
  })
};

export default loadOrderCommand;