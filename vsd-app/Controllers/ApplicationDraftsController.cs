using System;
using System.Linq;
using Gov.Cscp.VictimServices.Public.Models;
using Manager.Contract;
using Microsoft.AspNetCore.Mvc;
using Resources;
using Serilog;
using Shared.Contract;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    /// <summary>
    /// Manages application and invoice drafts, allowing users to create, retrieve,
    /// partially save, and cancel in-progress CVAP forms before final submission.
    /// </summary>
    [Route("api/[controller]")]
    public class ApplicationDraftsController : Controller
    {
        private readonly IApplicationDraftRepository _draftRepository;
        private readonly ILogger _logger;

        public ApplicationDraftsController(IApplicationDraftRepository draftRepository)
        {
            _draftRepository = draftRepository;
            _logger = Log.Logger;
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
                _logger.Information("Retrieving application draft list.");

                var drafts = _draftRepository.Query(new ApplicationDraftQuery { ActiveOnly = true }).ToList();

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
                _logger.Information("Retrieving application draft {DraftId}.", draftId);

                var draft = _draftRepository
                    .Query(new ApplicationDraftQuery { Id = draftId, ActiveOnly = false })
                    .FirstOrDefault();

                if (draft == null)
                    return NotFound(new { success = false, error = $"Draft '{draftId}' not found." });

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

                _logger.Information("Creating application draft for DraftType {DraftType}.", request.DraftType);

                var draft = new ApplicationDraft
                {
                    DraftType = (Manager.Contract.DraftType)request.DraftType,
                    DraftData = request.FormData,
                    DraftedDate = DateTime.UtcNow,
                    StateCode = StateCode.Active,
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

                _logger.Information("Partially saving application draft {DraftId}.", draftId);

                var existing = _draftRepository
                    .Query(new ApplicationDraftQuery { Id = draftId, ActiveOnly = true })
                    .FirstOrDefault();

                if (existing == null)
                    return NotFound(new { success = false, error = $"Draft '{draftId}' not found." });

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
                _logger.Information("Cancelling application draft {DraftId}.", draftId);

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
