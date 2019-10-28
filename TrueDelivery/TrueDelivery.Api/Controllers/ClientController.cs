using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

using TrueDelivery.Api.Models;
using TrueDelivery.DataAccess.Entity;
using TrueDelivery.DataAccess.Enum;
using TrueDelivery.Api.Helpers;

namespace TrueDelivery.Api.Controllers
{
    public class ClientController : BaseApiController
    {
        public ClientController() : base()
        { }

        [HttpPost]
        public IHttpActionResult CreateClient(CreateClientModel client)
        {
            if (client == null) return BadRequest("client is null");
            
            if (context.GetTable<Client>().Where(x => x.TelegramId == client.TelegramId).Any())
            {
                return BadRequest("client is exist");
            }

            Client clientEntity = new Client()
            {
                Id = Guid.NewGuid(),
                CreationTimestamp = DateTime.Now,
                State = StateEnum.Active,
                FirstName = client.FirstName,
                LastName = client.LastName,
                TelegramId = client.TelegramId,
                TelegramChatId = client.TelegramChatId,
                DefaultAddress = client.DefaultAddress
            };

            context.GetTable<Client>().InsertOnSubmit(clientEntity);
            context.SubmitChanges();
            return Ok();
        }

        [HttpGet]
        public IHttpActionResult GetInfo(string identifier, IdentifierEnum identifierType)
        {
            var client = ClientHelper.GetClient(context, identifier, identifierType);

            if (client == null)
            {
                var courier = CourierHelper.GetCourier(context, identifier, identifierType);
                if (courier == null) return BadRequest();
                return Json(new { courier.FirstName, courier.LastName, courier.State, courier.Phone, isCourier = true});
            }

            return Json(new { client.FirstName, client.LastName, client.DefaultAddress, client.DefaultAddressCoords, client.TelegramChatId, isCourier = false});
        }


    }
}
