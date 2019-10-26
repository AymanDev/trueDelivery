const regCommand = async (ctx) => {
  const {id, first_name, last_name} = ctx.from;
  ctx.reply("ЗПАЗЫБА ЗЫ РЕГУСТРАЦЫЮ");
};

export default regCommand;