using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Data.Linq;
using System.Configuration;

namespace TrueDelivery.Api.Controllers
{
    public class BaseApiController : ApiController
    {
        protected DataContext context;

        public BaseApiController() : base()
        {
            context = new DataContext(ConfigurationManager.ConnectionStrings["DatabaseConnection"].ConnectionString);
        }
    }
}
