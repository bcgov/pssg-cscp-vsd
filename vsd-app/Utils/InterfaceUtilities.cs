using Newtonsoft.Json;
using System;
using System.Reflection;
using static Gov.Cscp.VictimServices.Public.Controllers.JusticeController;

namespace Gov.Cscp.VictimServices.Public.Utils
{
    public class InterfaceUtilities
    {
        public static object ReturnErrorMessaging(string textDynamicsResponse)
        {
            var dynamicsResponse = JsonConvert.DeserializeObject<DynamicsResponse>(textDynamicsResponse);

            // Local error handler to try to give some reasonable feedback to user about what happened
            bool localSuccess = true;
            string localErrorMessage = "";
            if (dynamicsResponse.Result.Length.Equals(3))
            {
                if (dynamicsResponse.Result != "200")
                {
                    localSuccess = false;
                    localErrorMessage = "Error Code: " + dynamicsResponse.Result;
                }
            }
            else
            {
                if (dynamicsResponse.Result.Substring(2, 5) == "error")
                {
                    localSuccess = false;
                    localErrorMessage = "Generic Dynamics Error";
                }
                if (dynamicsResponse.Result.Substring(0, 5) == "Error")
                {
                    localSuccess = false;
                    localErrorMessage = dynamicsResponse.Result;
                }
            }
            var result = new { IsSuccess = localSuccess, Status = "Application Save", Message = localErrorMessage };
            return result;
        }
    }
}
