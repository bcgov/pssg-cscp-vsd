using System.Security.Claims;
using Gov.Jag.VictimServices.Interfaces;
using Gov.Jag.VictimServices.Public.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace Gov.Jag.VictimServices.Public.Controllers
{
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        private readonly IConfiguration Configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserController (IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            Configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }
        
        protected ClaimsPrincipal CurrentUser => _httpContextAccessor.HttpContext.User;

        [HttpGet("current")]
        //[RequiresPermission(Permission.Login, Permission.NewUserRegistration)]
        public virtual IActionResult UsersCurrentGet()
        {
            var user = new ViewModels.User();
            return new JsonResult(user);
        }

        [HttpGet("current")]
        //[RequiresPermission(Permission.Login, Permission.NewUserRegistration)]
        public virtual IActionResult UsersCurrentGetViaSiteMinder()
        {
            SiteMinderAuthOptions siteMinderAuthOptions = new SiteMinderAuthOptions();

            var temp = _httpContextAccessor.HttpContext.Session.GetString("UserSettings");
            var userSettings = JsonConvert.DeserializeObject<UserSettings>(temp);
            var user = new ViewModels.User
            {
                id = userSettings.UserId,
                contactid = userSettings.ContactId,
                accountid = userSettings.AccountId,
                businessname = userSettings.BusinessLegalName,
                name = userSettings.UserDisplayName,
                UserType = userSettings.UserType
            };

            if (userSettings.IsNewUserRegistration)
            {
                user.isNewUser = true;
                user.lastname = CommonDynamicsExtensions.GetLastName(user.name);
                user.firstname = CommonDynamicsExtensions.GetFirstName(user.name);
                user.accountid = userSettings.AccountId;

                string siteminderBusinessGuid = _httpContextAccessor.HttpContext.Request.Headers[siteMinderAuthOptions.SiteMinderBusinessGuidKey];
                string siteminderUserGuid = _httpContextAccessor.HttpContext.Request.Headers[siteMinderAuthOptions.SiteMinderUserGuidKey];

                user.contactid = string.IsNullOrEmpty(siteminderUserGuid) ? userSettings.ContactId : siteminderUserGuid;
                user.accountid = string.IsNullOrEmpty(siteminderBusinessGuid) ? userSettings.AccountId : siteminderBusinessGuid;
            }
            else
            {
                user.lastname = userSettings.AuthenticatedUser.Surname;
                user.firstname = userSettings.AuthenticatedUser.GivenName;
                user.email = userSettings.AuthenticatedUser.Email;
                user.isNewUser = false;
            }

            return new JsonResult(user);
        }
    }
}
