using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Web.Http;

namespace PwaPushNotification.Controllers
{    
    public class PushController : ApiController
    {
        [HttpPost]
        [ActionName("/api/push/push")]
        public HttpResponseMessage Push(PushTransferClass ObjpushTransferClass)
        {
            var _Token = "7931AD57F8204D27B68067B228AA24487E90F6A30633881A66E71C24A01F093F892254AFBB5BDC5DBB98853A9B3455E06014C6868FA2C497E64A213B89511CAF";            

            SubscriptionClass _Subscription = new SubscriptionClass
            {
                Endpoint = ObjpushTransferClass.Endpoint,
                P256DH = ObjpushTransferClass.P256DH,
                Auth = ObjpushTransferClass.Auth
            };

            VapidDetailsClass _VapidDetails = new VapidDetailsClass
            {
                Subject = "mailto:example@example.com",
                PublicKey = "BAqjaDzlwzIZuTetsdnXmooGGpJPriK-ffvieZfmTar8_j4OQiBqrBDrJphUIxjuLsf49RF_PJ5GhOShxIna09I",
                PrivateKey = "p-RfRFYjJ7NRBS3fjVev8TKzL9ivZWT7uLuU-oaoVy0"
            };
            TransferClass _Transfer = new TransferClass
            {
                PayLoad = ObjpushTransferClass.PayLoad,
                ObjSubscription = _Subscription,
                ObjVapidDetails = _VapidDetails

            };

            string _BaseAddress = "https://web2netservice.azurewebsites.net/";
            //string _BaseAddress = "https://localhost:44327/";
            string _APIAddress = "/api/PushNotifications/";

            using (HttpClient _Client = new HttpClient())
            {
                _Client.BaseAddress = new Uri(_BaseAddress);
                _Client.DefaultRequestHeaders.Accept.Clear();
                _Client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                _Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _Token);
                StringContent _JsonContent = new StringContent(JsonConvert.SerializeObject(_Transfer), Encoding.UTF8, "application/json");
                HttpResponseMessage _ResponsePost = _Client.PostAsync(_APIAddress, _JsonContent).Result;
                if (_ResponsePost.IsSuccessStatusCode)
                {
                    var _ResponseContentString = _ResponsePost.Content.ReadAsStringAsync().Result;

                    return Request.CreateResponse(HttpStatusCode.OK, _ResponseContentString);
                }
                else
                {                    
                    return Request.CreateResponse(HttpStatusCode.OK, _ResponsePost);
                }
            }

            
        }
    }

    public class PushTransferClass
    {
        public string PayLoad { get; set; }
        public string Endpoint { get; set; }
        public string P256DH { get; set; }
        public string Auth { get; set; }
        public PushTransferClass()
        {
            this.PayLoad = "";
            this.Endpoint = "";
            this.P256DH = "";
            this.Auth = "";
        }
    }

    public class TransferClass
    {
        public string PayLoad { get; set; }
        public SubscriptionClass ObjSubscription { get; set; }
        public VapidDetailsClass ObjVapidDetails { get; set; }
        public TransferClass()
        {
            this.PayLoad = "";
            this.ObjSubscription = new SubscriptionClass();
            this.ObjVapidDetails = new VapidDetailsClass();
        }
    }    

    public class SubscriptionClass
    {
        public string Endpoint { get; set; }
        public string P256DH { get; set; }
        public string Auth { get; set; }
        public SubscriptionClass()
        {
            this.Endpoint = "";
            this.P256DH = "";
            this.Auth = "";
        }
    }

    public class VapidDetailsClass
    {
        public string Subject { get; set; }
        public string PublicKey { get; set; }
        public string PrivateKey { get; set; }
        public VapidDetailsClass()
        {
            this.Subject = "";
            this.PublicKey = "";
            this.PrivateKey = "";
        }

    }
}
