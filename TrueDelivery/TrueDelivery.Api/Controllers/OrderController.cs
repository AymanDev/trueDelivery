using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Data.Linq.Mapping;

using TrueDelivery.Api.Models;
using TrueDelivery.DataAccess.Entity;
using TrueDelivery.DataAccess.Enum;
using TrueDelivery.Api.Helpers;
using TrueDelivery.Api.Tools.HereApi;

namespace TrueDelivery.Api.Controllers
{
    public class OrderController : BaseApiController
    {
        public OrderController() : base()
        { }

        [HttpPost]
        public IHttpActionResult Create(OrderCreatingModel orderModel)
        {
            var client = ClientHelper.GetClient(context, orderModel.Identifier, orderModel.IdentifierType);
            HereApi api = new HereApi();
            Order order = new Order()
            {
                Id = Guid.NewGuid(),
                CreationTimestamp = DateTime.Now,
                State = OrderStateEnum.Draft,
                Description = orderModel.Description,
                Photo = orderModel.Photo,
                RecipientDescription = orderModel.RecipientDescription,
                EndAddress = api.GetAdress(orderModel.EndAddressCoords),
                EndAddressCoords = orderModel.EndAddressCoords,
                StartAddress = api.GetAdress(orderModel.StartAddressCoords),
                StartAddressCoords = orderModel.StartAddressCoords,
                ClientId = client.Id,
                StateChangeTimestamp = DateTime.Now

            };
            context.GetTable<Order>().InsertOnSubmit(order);

            context.SubmitChanges();

            return Ok();
        }

        [HttpGet]
        public IHttpActionResult GetClientsOrders(string identifier, IdentifierEnum identifierType)
        {
            var client = ClientHelper.GetClient(context, identifier, identifierType);

            if (client == null) return BadRequest("Client does't found!");

            var orders = context.GetTable<Order>()
                .Where(x => x.State == OrderStateEnum.Draft || x.State == OrderStateEnum.Deliveried)
                .Where(x => x.ClientId == client.Id).ToList();

            return Json(orders);
        }
    }
}
