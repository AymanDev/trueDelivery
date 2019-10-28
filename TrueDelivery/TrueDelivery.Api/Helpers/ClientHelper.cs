using System;
using System.Collections.Generic;
using System.Data.Linq;
using System.Linq;
using System.Web;

using TrueDelivery.DataAccess.Entity;
using TrueDelivery.DataAccess.Enum;

namespace TrueDelivery.Api.Helpers
{
    public class ClientHelper
    {
        public static Client GetClient(DataContext context, string identifier, IdentifierEnum identifierType)
        {
            Client client = null;
            switch (identifierType)
            {
                case IdentifierEnum.Telegram:
                    client = context.GetTable<Client>().Where(x => x.TelegramId == Convert.ToInt32(identifier)).FirstOrDefault();
                    break;
                case IdentifierEnum.Mobile:
                    client = context.GetTable<Client>().Where(x => x.Id == new Guid(identifier)).FirstOrDefault();
                    break;
                default:
                    return null;
            }

            return client;
        }
    }
}