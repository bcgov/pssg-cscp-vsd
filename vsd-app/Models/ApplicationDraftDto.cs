using System;
using System.ComponentModel.DataAnnotations;

namespace Gov.Cscp.VictimServices.Public.Models
{
    /// <summary>
    /// Full representation of a saved application draft, including serialised form data.
    /// Returned by GET /api/applicationdrafts/{draftId}.
    /// </summary>
    public class ApplicationDraftDto
    {
        public Guid DraftId { get; set; }

        /// <summary>
        /// 100000002 = Victim, 100000001 = IFM, 100000000 = Witness.
        /// </summary>
        public int ApplicationType { get; set; }

        public string ApplicationTypeName { get; set; }

        /// <summary>
        /// Partial or complete application form data serialised as a JSON string.
        /// </summary>
        public string FormData { get; set; }

        public DateTime CreatedOn { get; set; }
        public DateTime LastModifiedOn { get; set; }
    }

    /// <summary>
    /// Lightweight summary row used in the drafts list (GET /api/applicationdrafts).
    /// </summary>
    public class ApplicationDraftSummaryDto
    {
        public Guid DraftId { get; set; }
        public int ApplicationType { get; set; }
        public string ApplicationTypeName { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime LastModifiedOn { get; set; }
    }

    /// <summary>
    /// Request body for creating a new draft (POST /api/applicationdrafts).
    /// </summary>
    public class CreateApplicationDraftRequest
    {
        /// <summary>
        /// 100000002 = Victim, 100000001 = IFM, 100000000 = Witness.
        /// </summary>
        [Required]
        public int ApplicationType { get; set; }

        /// <summary>
        /// Optional initial form data serialised as a JSON string.
        /// May be omitted when the user has not yet filled in any fields.
        /// </summary>
        public string FormData { get; set; }
    }

    /// <summary>
    /// Request body for a partial draft save (PUT /api/applicationdrafts/{draftId}).
    /// Only the fields included in FormData are persisted; omitted fields are preserved.
    /// </summary>
    public class UpdateApplicationDraftRequest
    {
        /// <summary>
        /// Updated partial form data serialised as a JSON string.
        /// </summary>
        [Required]
        public string FormData { get; set; }
    }
}
