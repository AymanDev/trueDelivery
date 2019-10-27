using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using System.IO;
using System.Text.RegularExpressions;
using System.Configuration;
using System;
using Newtonsoft.Json;

namespace TrueDelivery.Api.Tools.HereApi
{
    public class HereApi
    {
        public string AppId { get; private set; }
        public string AppCode { get; private set; }

        public HereApi()
        {
            AppId = ConfigurationManager.AppSettings.Get("HERE_API_ID");
            AppCode = ConfigurationManager.AppSettings.Get("HERE_API_APP_CODE");
        }

        string SendRequest(string link)
        {
            var request = WebRequest.Create(link);
            var response = request.GetResponse();

            var answer = new StringBuilder();
            using (Stream stream = response.GetResponseStream())
            using (StreamReader reader = new StreamReader(stream))
                answer.Append(reader.ReadToEnd());

            response.Close();

            return answer.ToString();
        }

        public List<string> GenerateOrdersForCourier(
            IEnumerable<string> wayPoints,
            int countPoint,
            RoutingType routing = RoutingType.Fastest,
            TransportType transport = TransportType.Pedestrian
        )
        {
            var request = GenerateOrdersForCourier(wayPoints, routing, transport);

            return request.GetRange(1, countPoint);
        }
        public List<string> GenerateOrdersForCourier(
            IEnumerable<string> wayPoints,
            RoutingType routing = RoutingType.Fastest,
            TransportType transport = TransportType.Pedestrian
        )
        {
            var points = wayPoints.ToList();
            points.Add(points.First());

            var request = new StringBuilder(HERE_API_WSE);
            request.Append("/2/findsequence.json?");

            request.Append($"start={wayPoints.First()}&");
            for (var i = 1; i < wayPoints.Count() - 1; i++)
                request.Append($"destination{i}={wayPoints.ElementAt(i)}&");

            request.Append($"end={wayPoints.Last()}&");

            request.Append($"mode={GetModeWse(routing, transport)}&");

            request.Append($"app_id={AppId}&");
            request.Append($"app_code={AppCode}");

            var answer = SendRequest(request.ToString());
            var listId = _parseRegex.Matches(answer)
                .Cast<Match>()
                .Select(m => m.Value)
                .ToList();

            var result = new List<string>();
            foreach (var id in listId)
            {
                var obj = JsonConvert.DeserializeObject<Route>(id);
                result.Add(obj.id);
            }  
            return result;
        }

        string GetModeWse(RoutingType routing, TransportType transport)
        {
            var routingStr = routing == RoutingType.Fastest ? "fastest" : "shortest";
            var transportStr = transport == TransportType.Car ? "car" : "pedestrian";

            return $"{routingStr};{transportStr}";
        }

        public string GetAdress(string point)
        {
            var request = new StringBuilder(HERE_API_GEOCODING);
            request.Append("/6.2/reversegeocode.json?");

            request.Append($"prox={point},1&");

            request.Append("mode=retrieveAddresses&maxresults=1&&");

            request.Append($"app_id={AppId}&");
            request.Append($"app_code={AppCode}");

            var answer = SendRequest(request.ToString());
            var result = _labelRegex.Match(answer).Groups["label"].Value;

            return result;
        }

        public TimeSpan GetTimeTravel(
            string pointStart,
            string pointEnd,
            RoutingType routing = RoutingType.Fastest,
            TransportType transport = TransportType.Pedestrian
        )
        {
            var request = new StringBuilder(HERE_API_ROUTE);
            request.Append("/routing/7.2/calculateroute.json?");

            request.Append($"waypoint0={pointStart}&waypoint1={pointEnd}&");

            request.Append($"mode={GetModeWse(routing, transport)}&");

            request.Append($"app_id={AppId}&");
            request.Append($"app_code={AppCode}");

            var answer = SendRequest(request.ToString());
            var result = _timeRegex.Match(answer).Groups["time"].Value;

            TimeSpan timeTravel = new TimeSpan(0, Convert.ToInt32(result), 0);

            return timeTravel;
        }

        const string HERE_API_WSE = "https://wse.api.here.com";
        const string HERE_API_GEOCODING = "https://reverse.geocoder.api.here.com";
        const string HERE_API_ROUTE = "https://route.api.here.com";

        readonly Regex _parseRegex = new Regex("{\"id.*?}", RegexOptions.Compiled);
        readonly Regex _labelRegex = new Regex("\"Label\": ?\"(?<label>.*?)\",", RegexOptions.Compiled);
        readonly Regex _timeRegex = new Regex("\"travelTime\": ?(?<time>.+?),", RegexOptions.Compiled);

        public enum RoutingType
        {
            Fastest,
            Shortest
        }

        public enum TransportType
        {
            Car,
            Pedestrian
        }

        private class Route
        {
            public string id;
            public double lat;
            public double lng;
            public int sequence;
            public object estimatedArrival;
            public object estimatedDeparture;
            public object[] fulfilledConstraints;
        }
    }
}