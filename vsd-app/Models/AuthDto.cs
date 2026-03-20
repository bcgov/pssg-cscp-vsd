using System.ComponentModel.DataAnnotations;

namespace Gov.Cscp.VictimServices.Public.Models
{
    /// <summary>
    /// Request body for POST /api/auth/login.
    /// </summary>
    public class LoginRequest
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }
    }

    /// <summary>
    /// Response body returned on successful login.
    /// </summary>
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Token { get; set; }
        public string Username { get; set; }
    }
}
