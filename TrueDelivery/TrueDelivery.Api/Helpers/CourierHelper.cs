using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Linq;

using TrueDelivery.DataAccess.Entity;
using TrueDelivery.DataAccess.Enum;

namespace TrueDelivery.Api.Helpers
{
    public class CourierHelper
    {
        public static Courier GetCourier(DataContext context, string identifier, IdentifierEnum identifierType)
        {
            Courier courier = null;
            switch (identifierType)
            {
                case IdentifierEnum.Telegram:
                    courier = context.GetTable<Courier>().Where(x => x.TelegramId == Convert.ToInt32(identifier)).FirstOrDefault();
                    break;
                case IdentifierEnum.Mobile:
                    courier = context.GetTable<Courier>().Where(x => x.Id == new Guid(identifier)).FirstOrDefault();
                    break;
                default:
                    return null;
            }

            return courier;
        }
    }
}