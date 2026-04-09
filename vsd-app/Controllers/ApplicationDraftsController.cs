using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.Services;
using Manager.Contract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Resources;
using Serilog;
using Shared.Contract;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    /// <summary>
    /// Manages application and invoice drafts, allowing users to create, retrieve,
    /// partially save, and cancel in-progress CVAP forms before final submission.
    /// All operations are scoped to the authenticated user's Contact record.
    /// </summary>
    [Route("api/[controller]")]
    [Authorize]
    public class ApplicationDraftsController : Controller
    {
        private readonly IApplicationDraftRepository _draftRepository;
        private readonly IContactLookupService _contactLookup;
        private readonly ILogger _logger;

        public ApplicationDraftsController(
            IApplicationDraftRepository draftRepository,
            IContactLookupService contactLookup
        )
        {
            _draftRepository = draftRepository;
            _contactLookup = contactLookup;
            _logger = Log.Logger;
        }

        // ──────────────────────────────────────────────────────────────────────
        // Helpers
        // ──────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Extracts the identity-provider user ID from the JWT <c>sub</c> claim.
        /// This is a stable GUID issued by the IdP (local mock now, Keycloak later).
        /// </summary>
        private string GetUserId() =>
            User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        /// <summary>
        /// Extracts the display name (<c>name</c>) claim from the JWT.
        /// </summary>
        private string GetDisplayName()
        {
            var givenName =
                User.FindFirst(JwtRegisteredClaimNames.GivenName)?.Value
                ?? User.FindFirst("given_name")?.Value
                ?? User.FindFirst(ClaimTypes.GivenName)?.Value;

            var surname =
                User.FindFirst(JwtRegisteredClaimNames.FamilyName)?.Value
                ?? User.FindFirst("family_name")?.Value
                ?? User.FindFirst(ClaimTypes.Surname)?.Value;

            var fullName =
                User.FindFirst(JwtRegisteredClaimNames.Name)?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value;

            if (!string.IsNullOrWhiteSpace(givenName) || !string.IsNullOrWhiteSpace(surname))
            {
                return $"{givenName} {surname}".Trim();
            }

            return fullName ?? GetUserId();
        }

        // ──────────────────────────────────────────────────────────────────────
        // GET /api/applicationdrafts
        // Returns a summary list of all active drafts.
        // ──────────────────────────────────────────────────────────────────────

        [HttpGet]
        public IActionResult GetDrafts()
        {
            try
            {
                var userId = GetUserId();
                _logger.Information("Retrieving application draft list for user '{UserId}'.", userId);

                // If the user has no Contact yet, they can't have any drafts.
                var contactId = _contactLookup.GetContactId(userId);
                if (!contactId.HasValue)
                    return Ok(new List<ApplicationDraft>());

                var drafts = _draftRepository
                    .Query(new ApplicationDraftQuery { ActiveOnly = true, SubmitterId = contactId.Value })
                    .ToList();

                return Ok(drafts);
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while retrieving application draft list. Source = VSD");
                return StatusCode(500, new { success = false, error = e.Message });
            }
        }

        // ──────────────────────────────────────────────────────────────────────
        // GET /api/applicationdrafts/{draftId}
        // Returns the full form data for a single draft.
        // ──────────────────────────────────────────────────────────────────────

        [HttpGet("{draftId:guid}")]
        public IActionResult GetDraft(Guid draftId)
        {
            try
            {
                var userId = GetUserId();
                _logger.Information("Retrieving application draft {DraftId} for user '{UserId}'.", draftId, userId);

                var contactId = _contactLookup.GetContactId(userId);

                var draft = _draftRepository
                    .Query(new ApplicationDraftQuery { Id = draftId, ActiveOnly = false })
                    .FirstOrDefault();

                if (draft == null)
                    return NotFound(new { success = false, error = $"Draft '{draftId}' not found." });

                // Ownership check
                if (!contactId.HasValue || draft.SubmitterId != contactId.Value)
                    return StatusCode(403, new { success = false, error = "You do not own this draft." });

                return Ok(draft);
            }
            catch (Exception e)
            {
                _logger.Error(
                    e,
                    "Unexpected error while retrieving application draft {DraftId}. Source = VSD",
                    draftId
                );
                return StatusCode(500, new { success = false, error = e.Message });
            }
        }

        // ──────────────────────────────────────────────────────────────────────
        // POST /api/applicationdrafts
        // Creates a new draft and returns its generated ID.
        // ──────────────────────────────────────────────────────────────────────

        [HttpPost]
        public IActionResult CreateDraft([FromBody] CreateApplicationDraftRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.Error("API call to 'CreateDraft' made with invalid model state. Source = VSD");
                    return BadRequest(ModelState);
                }

                var userId = GetUserId();
                var displayName = GetDisplayName();
                _logger.Information(
                    "Creating application draft for user '{UserId}', DraftType {DraftType}.",
                    userId,
                    request.DraftType
                );

                // Lazy Contact creation — if the user has no Contact yet, create one now.
                var contactId = _contactLookup.GetOrCreateContactId(userId, displayName, null);

                var draft = new ApplicationDraft
                {
                    DraftType = (Manager.Contract.DraftType)request.DraftType,
                    DraftData = request.FormData,
                    DraftedDate = DateTime.UtcNow,
                    StateCode = StateCode.Active,
                    SubmitterId = contactId,
                };

                var newId = _draftRepository.Insert(draft);

                return CreatedAtAction(
                    nameof(GetDraft),
                    new { draftId = newId },
                    new { success = true, draftId = newId }
                );
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while creating application draft. Source = VSD");
                return StatusCode(500, new { success = false, error = e.Message });
            }
        }

        // ──────────────────────────────────────────────────────────────────────
        // PUT /api/applicationdrafts/{draftId}
        // Partially saves updated form data into an existing draft.
        // ──────────────────────────────────────────────────────────────────────

        [HttpPut("{draftId:guid}")]
        public IActionResult UpdateDraft(Guid draftId, [FromBody] UpdateApplicationDraftRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.Error(
                        "API call to 'UpdateDraft' made with invalid model state for draft {DraftId}. Source = VSD",
                        draftId
                    );
                    return BadRequest(ModelState);
                }

                var userId = GetUserId();
                _logger.Information(
                    "Partially saving application draft {DraftId} for user '{UserId}'.",
                    draftId,
                    userId
                );

                var contactId = _contactLookup.GetContactId(userId);

                var existing = _draftRepository
                    .Query(new ApplicationDraftQuery { Id = draftId, ActiveOnly = true })
                    .FirstOrDefault();

                if (existing == null)
                    return NotFound(new { success = false, error = $"Draft '{draftId}' not found." });

                // Ownership check
                if (!contactId.HasValue || existing.SubmitterId != contactId.Value)
                    return StatusCode(403, new { success = false, error = "You do not own this draft." });

                existing.DraftData = request.FormData;
                _draftRepository.Update(existing);

                return NoContent();
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unexpected error while updating application draft {DraftId}. Source = VSD", draftId);
                return StatusCode(500, new { success = false, error = e.Message });
            }
        }

        // ──────────────────────────────────────────────────────────────────────
        // DELETE /api/applicationdrafts/{draftId}
        // Cancels (soft-deletes) a draft, preserving the audit trail.
        // ──────────────────────────────────────────────────────────────────────

        [HttpDelete("{draftId:guid}")]
        public IActionResult CancelDraft(Guid draftId)
        {
            try
            {
                var userId = GetUserId();
                _logger.Information("Cancelling application draft {DraftId} for user '{UserId}'.", draftId, userId);

                var contactId = _contactLookup.GetContactId(userId);

                // Load the draft first to verify ownership before cancelling.
                var existing = _draftRepository
                    .Query(new ApplicationDraftQuery { Id = draftId, ActiveOnly = true })
                    .FirstOrDefault();

                if (existing == null)
                    return NotFound(new { success = false, error = $"Draft '{draftId}' not found." });

                // Ownership check
                if (!contactId.HasValue || existing.SubmitterId != contactId.Value)
                    return StatusCode(403, new { success = false, error = "You do not own this draft." });

                var cancelled = _draftRepository.Cancel(draftId);

                if (!cancelled)
                    return NotFound(new { success = false, error = $"Draft '{draftId}' not found." });

                return NoContent();
            }
            catch (Exception e)
            {
                _logger.Error(
                    e,
                    "Unexpected error while cancelling application draft {DraftId}. Source = VSD",
                    draftId
                );
                return StatusCode(500, new { success = false, error = e.Message });
            }
        }
    }
}
