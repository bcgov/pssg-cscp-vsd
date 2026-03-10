using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    /// <summary>
    /// Temporary local authentication endpoint.
    /// Will be replaced by Keycloak integration.
    /// </summary>
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly ILocalAuthService _authService;
        private readonly ILogger _logger;

        public AuthController(ILocalAuthService authService)
        {
            _authService = authService;
            _logger = Log.Logger;
        }

        // ──────────────────────────────────────────────────────────────────────
        // POST /api/auth/login
        // Validates credentials and returns a signed JWT.
        // ──────────────────────────────────────────────────────────────────────

        [HttpPost("login")]
        [AllowAnonymous]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _logger.Information("Login attempt for user {Username}.", request.Username);

            var token = _authService.Authenticate(request.Username, request.Password);

            if (token == null)
            {
                _logger.Warning("Failed login attempt for user {Username}.", request.Username);
                return Unauthorized(new { success = false, error = "Invalid username or password." });
            }

            _logger.Information("User {Username} logged in successfully.", request.Username);

            return Ok(
                new LoginResponse
                {
                    Success = true,
                    Token = token,
                    Username = request.Username,
                }
            );
        }
    }
}
