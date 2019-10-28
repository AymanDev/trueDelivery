using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using TrueDelivery.Api.Helpers;
using TrueDelivery.Api.Models;
using TrueDelivery.Api.Tools.HereApi;
using TrueDelivery.DataAccess.Entity;
using TrueDelivery.DataAccess.Enum;

namespace TrueDelivery.Api.Controllers
{
    public class CourierController : BaseApiController
    {
        public CourierController() : base()
        { }

        [HttpPost]
        public IHttpActionResult CreateWorkApplication(CreateCourierModel courierModel)
        {
            if (courierModel == null) return BadRequest("Model is empty");
            if (context.GetTable<Courier>().Where(x => x.Phone == courierModel.Phone).Any()) return BadRequest("Number is exist");

            var courier = new Courier()
            {
                Id = Guid.NewGuid(),
                State = CourierStateEnum.Draft,
                CreationTimestamp = DateTime.Now,
                FirstName = courierModel.FirstName,
                LastName = courierModel.LastName,
                Phone = courierModel.Phone,
                TelegramId = courierModel.TelegramId,
                TelegramChatId = courierModel.TelegramChatId
            };

            context.GetTable<Courier>().InsertOnSubmit(courier);

            context.SubmitChanges();

            return Ok();
        }

        [HttpGet]
        public IHttpActionResult GetOrders(string location, string identifier, IdentifierEnum identifierType)
        {
            var courier = CourierHelper.GetCourier(context, identifier, identifierType);
            if (courier == null) return BadRequest();

            HereApi api = new HereApi();

            var wayPoints = new List<string> { identifier + ";"+location };
            context.GetTable<Order>()
                //.Where(x =>x.State == OrderStateEnum.Draft)
                .OrderBy(x => x.CreationTimestamp).Take(5).ToList()
                .ForEach(x => wayPoints.Add(x.Id + ";" + x.StartAddressCoords));
            if (wayPoints.Count == 1) return Json(new object[] { });
            var ordersIds = new List<string>() { "FAA08AD6-A736-45EB-8F22-126BAB4163AF", "AE16E32E-DD2A-45FA-83B6-29A1DFB3E7B9 " };
            //var ordersIds = api.GenerateOrdersForCourier(wayPoints, 2);
            var orders = new List<Order>();
            foreach (var item in ordersIds)
            {
                orders.Add(context.GetTable<Order>().Where(x => x.Id == new Guid(item)).FirstOrDefault());
            };
            return Json(orders);
        }

        [HttpPost]
        public IHttpActionResult StartDelivery(StartDeliveryModel model)
        {

            Courier courier = CourierHelper.GetCourier(context, model.Identifier, model.IdentifierType);
            if (courier == null) return BadRequest();
            var order = context.GetTable<Order>().Where(x => x.Id == model.OrderId).FirstOrDefault();

            order.State = OrderStateEnum.InDelivery;
            order.StateChangeTimestamp = DateTime.Now;
            order.CourierId = courier.Id;
            context.SubmitChanges();
            HereApi api = new HereApi();
            var time = api.GetTimeTravel(order.StartAddressCoords, order.EndAddressCoords);
            return Json(time);
        }

        [HttpPost]
        public IHttpActionResult FinishDelivery(FinishDeliveryModel model)
        {
            var order = context.GetTable<Order>().Where(x => x.Id == model.OrderId).FirstOrDefault();

            TimeSpan dif = DateTime.Now - order.StateChangeTimestamp;
            order.StateChangeTimestamp = DateTime.Now;
            order.State = OrderStateEnum.Deliveried;

            context.SubmitChanges();
            return Ok(dif);
        }
    }
}
