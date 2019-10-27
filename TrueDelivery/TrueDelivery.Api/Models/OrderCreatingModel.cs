using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TrueDelivery.DataAccess.Enum;

namespace TrueDelivery.Api.Models
{
    public class OrderCreatingModel
    {
        public string Description { get; set; }

        public string StartAddress { get; set; }

        public string StartAddressCoords { get; set; }

        public string EndAddress { get; set; }

        public string EndAddressCoords { get; set; }

        public string Photo { get; set; }

        public string RecipientDescription { get; set; }

        public string Identifier { get; set; }

        public IdentifierEnum IdentifierType { get; set; }

    }
}