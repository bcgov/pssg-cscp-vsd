using System.ComponentModel.DataAnnotations;

namespace Gov.Cscp.VictimServices.Public.Models
{
    /// <summary>
    /// Request body for creating a new draft (POST /api/applicationdrafts).
    /// </summary>
    public class CreateApplicationDraftRequest
    {
        /// <summary>
        /// 100000000 = Invoice, 100000001 = VictimApplication,
        /// 100000002 = WitnessApplication, 100000003 = FamilyMemberApplication.
        /// </summary>
        [Required]
        public int DraftType { get; set; }

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
