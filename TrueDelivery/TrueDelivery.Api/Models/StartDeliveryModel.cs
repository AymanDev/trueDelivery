using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TrueDelivery.DataAccess.Enum;

namespace TrueDelivery.Api.Models
{
    public class StartDeliveryModel
    {
        public string Identifier { get; set; }
        public IdentifierEnum IdentifierType { get; set; }
        public Guid OrderId { get; set; }
    }
}