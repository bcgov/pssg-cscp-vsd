// <auto-generated>
// Code generated by Microsoft (R) AutoRest Code Generator.
// Changes may cause incorrect behavior and will be lost if the code is
// regenerated.
// </auto-generated>

namespace Gov.Jag.VictimServices.Interfaces.Models
{
    using Newtonsoft.Json;
    using System.Collections;
    using System.Collections.Generic;
    using System.Linq;

    /// <summary>
    /// resourcespec
    /// </summary>
    public partial class MicrosoftDynamicsCRMresourcespec
    {
        /// <summary>
        /// Initializes a new instance of the MicrosoftDynamicsCRMresourcespec
        /// class.
        /// </summary>
        public MicrosoftDynamicsCRMresourcespec()
        {
            CustomInit();
        }

        /// <summary>
        /// Initializes a new instance of the MicrosoftDynamicsCRMresourcespec
        /// class.
        /// </summary>
        public MicrosoftDynamicsCRMresourcespec(int? requiredcount = default(int?), string _organizationidValue = default(string), System.DateTimeOffset? modifiedon = default(System.DateTimeOffset?), System.DateTimeOffset? createdon = default(System.DateTimeOffset?), string constraints = default(string), string description = default(string), string resourcespecid = default(string), long? versionnumber = default(long?), bool? samesite = default(bool?), string objectiveexpression = default(string), string objecttypecode = default(string), string _businessunitidValue = default(string), string name = default(string), string _modifiedonbehalfbyValue = default(string), string _createdonbehalfbyValue = default(string), double? effortrequired = default(double?), string _modifiedbyValue = default(string), string groupobjectid = default(string), string _createdbyValue = default(string), MicrosoftDynamicsCRMorganization organizationid = default(MicrosoftDynamicsCRMorganization), MicrosoftDynamicsCRMsystemuser modifiedonbehalfby = default(MicrosoftDynamicsCRMsystemuser), MicrosoftDynamicsCRMsystemuser createdonbehalfby = default(MicrosoftDynamicsCRMsystemuser), MicrosoftDynamicsCRMconstraintbasedgroup groupobjectidConstraintbasedgroup = default(MicrosoftDynamicsCRMconstraintbasedgroup), MicrosoftDynamicsCRMbusinessunit businessunitid = default(MicrosoftDynamicsCRMbusinessunit), MicrosoftDynamicsCRMsystemuser createdby = default(MicrosoftDynamicsCRMsystemuser), MicrosoftDynamicsCRMsystemuser modifiedby = default(MicrosoftDynamicsCRMsystemuser), IList<MicrosoftDynamicsCRMactivityparty> activityPartyResourceSpec = default(IList<MicrosoftDynamicsCRMactivityparty>), IList<MicrosoftDynamicsCRMbulkdeletefailure> resourceSpecBulkDeleteFailures = default(IList<MicrosoftDynamicsCRMbulkdeletefailure>), MicrosoftDynamicsCRMteam groupobjectidTeam = default(MicrosoftDynamicsCRMteam), IList<MicrosoftDynamicsCRMresource> resourcespecResources = default(IList<MicrosoftDynamicsCRMresource>), IList<MicrosoftDynamicsCRMannotation> resourceSpecAnnotation = default(IList<MicrosoftDynamicsCRMannotation>), IList<MicrosoftDynamicsCRMservice> resourceSpecServices = default(IList<MicrosoftDynamicsCRMservice>), IList<MicrosoftDynamicsCRMasyncoperation> resourceSpecAsyncOperations = default(IList<MicrosoftDynamicsCRMasyncoperation>))
        {
            Requiredcount = requiredcount;
            this._organizationidValue = _organizationidValue;
            Modifiedon = modifiedon;
            Createdon = createdon;
            Constraints = constraints;
            Description = description;
            Resourcespecid = resourcespecid;
            Versionnumber = versionnumber;
            Samesite = samesite;
            Objectiveexpression = objectiveexpression;
            Objecttypecode = objecttypecode;
            this._businessunitidValue = _businessunitidValue;
            Name = name;
            this._modifiedonbehalfbyValue = _modifiedonbehalfbyValue;
            this._createdonbehalfbyValue = _createdonbehalfbyValue;
            Effortrequired = effortrequired;
            this._modifiedbyValue = _modifiedbyValue;
            Groupobjectid = groupobjectid;
            this._createdbyValue = _createdbyValue;
            Organizationid = organizationid;
            Modifiedonbehalfby = modifiedonbehalfby;
            Createdonbehalfby = createdonbehalfby;
            GroupobjectidConstraintbasedgroup = groupobjectidConstraintbasedgroup;
            Businessunitid = businessunitid;
            Createdby = createdby;
            Modifiedby = modifiedby;
            ActivityPartyResourceSpec = activityPartyResourceSpec;
            ResourceSpecBulkDeleteFailures = resourceSpecBulkDeleteFailures;
            GroupobjectidTeam = groupobjectidTeam;
            ResourcespecResources = resourcespecResources;
            ResourceSpecAnnotation = resourceSpecAnnotation;
            ResourceSpecServices = resourceSpecServices;
            ResourceSpecAsyncOperations = resourceSpecAsyncOperations;
            CustomInit();
        }

        /// <summary>
        /// An initialization method that performs custom operations like setting defaults
        /// </summary>
        partial void CustomInit();

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "requiredcount")]
        public int? Requiredcount { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "_organizationid_value")]
        public string _organizationidValue { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "modifiedon")]
        public System.DateTimeOffset? Modifiedon { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "createdon")]
        public System.DateTimeOffset? Createdon { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "constraints")]
        public string Constraints { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "description")]
        public string Description { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "resourcespecid")]
        public string Resourcespecid { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "versionnumber")]
        public long? Versionnumber { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "samesite")]
        public bool? Samesite { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "objectiveexpression")]
        public string Objectiveexpression { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "objecttypecode")]
        public string Objecttypecode { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "_businessunitid_value")]
        public string _businessunitidValue { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "_modifiedonbehalfby_value")]
        public string _modifiedonbehalfbyValue { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "_createdonbehalfby_value")]
        public string _createdonbehalfbyValue { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "effortrequired")]
        public double? Effortrequired { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "_modifiedby_value")]
        public string _modifiedbyValue { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "groupobjectid")]
        public string Groupobjectid { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "_createdby_value")]
        public string _createdbyValue { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "organizationid")]
        public MicrosoftDynamicsCRMorganization Organizationid { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "modifiedonbehalfby")]
        public MicrosoftDynamicsCRMsystemuser Modifiedonbehalfby { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "createdonbehalfby")]
        public MicrosoftDynamicsCRMsystemuser Createdonbehalfby { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "groupobjectid_constraintbasedgroup")]
        public MicrosoftDynamicsCRMconstraintbasedgroup GroupobjectidConstraintbasedgroup { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "businessunitid")]
        public MicrosoftDynamicsCRMbusinessunit Businessunitid { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "createdby")]
        public MicrosoftDynamicsCRMsystemuser Createdby { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "modifiedby")]
        public MicrosoftDynamicsCRMsystemuser Modifiedby { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "ActivityPartyResourceSpec")]
        public IList<MicrosoftDynamicsCRMactivityparty> ActivityPartyResourceSpec { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "ResourceSpec_BulkDeleteFailures")]
        public IList<MicrosoftDynamicsCRMbulkdeletefailure> ResourceSpecBulkDeleteFailures { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "groupobjectid_team")]
        public MicrosoftDynamicsCRMteam GroupobjectidTeam { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "resourcespec_resources")]
        public IList<MicrosoftDynamicsCRMresource> ResourcespecResources { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "ResourceSpec_Annotation")]
        public IList<MicrosoftDynamicsCRMannotation> ResourceSpecAnnotation { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "resource_spec_services")]
        public IList<MicrosoftDynamicsCRMservice> ResourceSpecServices { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "ResourceSpec_AsyncOperations")]
        public IList<MicrosoftDynamicsCRMasyncoperation> ResourceSpecAsyncOperations { get; set; }

    }
}
