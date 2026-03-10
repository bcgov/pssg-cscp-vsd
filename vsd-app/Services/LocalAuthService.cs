using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Gov.Cscp.VictimServices.Public.Services
{
    /// <summary>
    /// Temporary local authentication service with hardcoded users.
    /// Will be replaced by Keycloak integration.
    /// </summary>
    public interface ILocalAuthService
    {
        /// <summary>
        /// Validates username/password against hardcoded users and returns a JWT if valid.
        /// Returns null if credentials are invalid.
        /// </summary>
        string Authenticate(string username, string password);
    }

    public class LocalAuthService : ILocalAuthService
    {
        private static readonly Dictionary<string, (string Password, string DisplayName)> Users = new(
            StringComparer.OrdinalIgnoreCase
        )
        {
            ["user1"] = ("pass1", "User One"),
            ["user2"] = ("pass2", "User Two"),
        };

        private readonly string _jwtSecret;
        private readonly string _jwtIssuer;
        private readonly int _tokenExpiryMinutes;

        public LocalAuthService(IConfiguration configuration)
        {
            _jwtSecret =
                configuration["LocalAuth:Secret"]
                ?? throw new InvalidOperationException("LocalAuth:Secret is not configured.");
            _jwtIssuer = configuration["LocalAuth:Issuer"] ?? "vsd-local";
            _tokenExpiryMinutes = int.TryParse(configuration["LocalAuth:TokenExpiryMinutes"], out var mins) ? mins : 60;
        }

        public string Authenticate(string username, string password)
        {
            if (
                string.IsNullOrWhiteSpace(username)
                || !Users.TryGetValue(username, out var user)
                || user.Password != password
            )
            {
                return null;
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(JwtRegisteredClaimNames.Name, user.DisplayName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var token = new JwtSecurityToken(
                issuer: _jwtIssuer,
                audience: _jwtIssuer,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_tokenExpiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
