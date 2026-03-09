using System;
using System.Collections.Generic;
using System.Linq;
using Database.Model;
using Gov.Cscp.VictimServices.Public.JsonObjects;
using Gov.Cscp.VictimServices.Public.ViewModels;
using Microsoft.Xrm.Sdk;

namespace Gov.Cscp.VictimServices.Public.Models.Extensions
{
    /// <summary>
    /// Extension methods that map Dataverse early-bound entities directly to the AEM form-model types,
    /// replacing the legacy IDynamicsResultService / JSON-deserialization path.
    /// </summary>
    public static class AemEntityExtensions
    {
        // ------------------------------------------------------------------ //
        //  vsd_application  →  Application (JSON DTO)
        // ------------------------------------------------------------------ //

        public static Application ToApplicationJsonDto(this Vsd_Application e)
        {
            if (e == null)
                return null;

            return new Application
            {
                // Applicant identity
                vsd_applicanttype = e.GetAttributeValue<OptionSetValue>("vsd_applicanttype")?.Value ?? 0,
                vsd_applicantsfirstname = e.Vsd_ApplicantsFirstName,
                vsd_applicantsmiddlename = e.Vsd_ApplicantsMiddleName,
                vsd_applicantslastname = e.Vsd_ApplicantsLastName,
                vsd_otherfirstname = e.Vsd_OtherFirstName,
                vsd_otherlastname = e.Vsd_OtherLastName,
                vsd_dateofnamechange = e.Vsd_DateOfNameChange,
                vsd_cvap_relationshiptovictim = e.Vsd_Cvap_RelationshipToVictim,
                vsd_relationshipother1 = e.Vsd_RelationshipOther1,

                // Applicant demographics
                vsd_applicantsgendercode = (int?)e.Vsd_ApplicantsGenderCode,
                vsd_genderidentitytext = e.GetAttributeValue<string>("vsd_genderidentitytext"),
                vsd_pronouns = e.GetAttributeValue<OptionSetValue>("vsd_pronouns")?.Value,
                vsd_pronountext = e.GetAttributeValue<string>("vsd_pronountext"),
                vsd_primaryraceethnicity = e.GetAttributeValue<OptionSetValue>("vsd_primaryraceethnicity")?.Value,
                vsd_primaryraceethnicitytext = e.GetAttributeValue<string>("vsd_primaryraceethnicitytext"),
                vsd_indigenous = e.GetAttributeValue<OptionSetValue>("vsd_indigenous")?.Value,
                vsd_applicantsbirthdate = e.Vsd_ApplicantsBirthdate,
                vsd_applicantsmaritalstatus = e.GetAttributeValue<OptionSetValue>("vsd_applicantsmaritalstatus")?.Value,
                vsd_applicantsoccupation = e.Vsd_ApplicantsOccupation,
                vsd_applicantssocialinsurancenumber = e.Vsd_ApplicantsSocialInsuranceNumber,

                // Applicant contact
                vsd_applicantsprimaryphonenumber = e.Vsd_ApplicantsPrimaryPhoneNumber,
                vsd_voicemailoption = e.GetAttributeValue<OptionSetValue>("vsd_voicemailoption")?.Value,
                vsd_applicantsalternatephonenumber = e.Vsd_ApplicantsAlternatePhoneNumber,
                vsd_applicantsemail = e.Vsd_ApplicantsEmail,
                vsd_applicantspreferredmethodofcontact =
                    e.GetAttributeValue<OptionSetValue>("vsd_applicantspreferredmethodofcontact")?.Value ?? 0,

                // Applicant primary address
                vsd_applicantsprimaryaddressline1 = e.Vsd_ApplicantsPrimaryAddressLine1,
                vsd_applicantsprimaryaddressline2 = e.Vsd_ApplicantsPrimaryAddressLine2,
                vsd_applicantsprimaryaddressline3 = e.Vsd_ApplicantsPrimaryAddressLine3,
                vsd_applicantsprimarycity = e.Vsd_ApplicantsPrimaryCity,
                vsd_applicantsprimaryprovince = e.Vsd_ApplicantsPrimaryProvince,
                vsd_applicantsprimarypostalcode = e.Vsd_ApplicantsPrimaryPostalCode,
                vsd_applicantsprimarycountry = e.Vsd_ApplicantsPrimaryCountry,

                // Applicant alternate address
                vsd_applicantsalternateaddressline1 = e.Vsd_ApplicantsAlternateAddressLine1,
                vsd_applicantsalternateaddressline2 = e.Vsd_ApplicantsAlternateAddressLine2,
                vsd_applicantsalternatecity = e.Vsd_ApplicantsAlternateCity,
                vsd_applicantsalternateprovince = e.Vsd_ApplicantsAlternateProvince,
                vsd_applicantsalternatepostalcode = e.Vsd_ApplicantsAlternatePostalCode,
                vsd_applicantsalternatecountry = e.Vsd_ApplicantsAlternateCountry,

                // Victim identity
                vsd_cvap_victimfirstname = e.GetAttributeValue<string>("vsd_cvap_victimfirstname"),
                vsd_cvap_victimmiddlename = e.GetAttributeValue<string>("vsd_cvap_victimmiddlename"),
                vsd_cvap_victimlastname = e.GetAttributeValue<string>("vsd_cvap_victimlastname"),
                vsd_cvap_victimmaritalstatus = e.GetAttributeValue<OptionSetValue>(
                    "vsd_cvap_victimmaritalstatus"
                )?.Value,
                vsd_cvap_victimotherfirstname = e.GetAttributeValue<string>("vsd_cvap_victimotherfirstname"),
                vsd_cvap_victimotherlastname = e.GetAttributeValue<string>("vsd_cvap_victimotherlastname"),
                vsd_cvap_victimdateofnamechange = e.Vsd_Cvap_VictimDateOfNameChange,
                vsd_cvap_victimgendercode = e.GetAttributeValue<OptionSetValue>("vsd_cvap_victimgendercode")?.Value,
                vsd_victimgendertext = e.GetAttributeValue<string>("vsd_victimgendertext"),
                vsd_victimpronouns = e.GetAttributeValue<OptionSetValue>("vsd_victimpronouns")?.Value,
                vsd_victimpronountext = e.GetAttributeValue<string>("vsd_victimpronountext"),
                vsd_victimprimaryraceethnicity = e.GetAttributeValue<OptionSetValue>(
                    "vsd_victimprimaryraceethnicity"
                )?.Value,
                vsd_victimprimaryraceethnicitytext = e.GetAttributeValue<string>("vsd_victimprimaryraceethnicitytext"),
                vsd_victimindigenous = e.GetAttributeValue<OptionSetValue>("vsd_victimindigenous")?.Value,
                vsd_cvap_victimbirthdate = e.Vsd_Cvap_VictimBirthdate,
                vsd_cvap_victimsocialinsurancenumber = e.GetAttributeValue<string>(
                    "vsd_cvap_victimsocialinsurancenumber"
                ),
                vsd_cvap_victimoccupation = e.GetAttributeValue<string>("vsd_cvap_victimoccupation"),
                vsd_cvap_victimprimaryphonenumber = e.GetAttributeValue<string>("vsd_cvap_victimprimaryphonenumber"),
                vsd_cvap_victimalternatephonenumber = e.GetAttributeValue<string>(
                    "vsd_cvap_victimalternatephonenumber"
                ),
                vsd_cvap_victimemailaddress = e.GetAttributeValue<string>("vsd_cvap_victimemailaddress"),
                vsd_cvap_victimaddressline1 = e.GetAttributeValue<string>("vsd_cvap_victimaddressline1"),
                vsd_cvap_victimaddressline2 = e.GetAttributeValue<string>("vsd_cvap_victimaddressline2"),
                vsd_cvap_victimcity = e.GetAttributeValue<string>("vsd_cvap_victimcity"),
                vsd_cvap_victimpostalcode = e.GetAttributeValue<string>("vsd_cvap_victimpostalcode"),
                vsd_cvap_victimprovince = e.GetAttributeValue<string>("vsd_cvap_victimprovince"),
                vsd_cvap_victimcountry = e.GetAttributeValue<string>("vsd_cvap_victimcountry"),

                // Crime information
                vsd_cvap_typeofcrime = e.GetAttributeValue<string>("vsd_cvap_typeofcrime"),
                vsd_cvap_unsureofspecificcrimedates = e.Vsd_Cvap_UnsureOfSpecificCrimeDates ?? false,
                vsd_cvap_crimestartdate = e.Vsd_Cvap_CrimeStartDate,
                vsd_cvap_crimeenddate = e.Vsd_Cvap_CrimeEndDate,
                vsd_cvap_overoneyear = e.GetAttributeValue<OptionSetValue>("vsd_cvap_overoneyear")?.Value,
                vsd_cvap_reasontoapplylate = e.GetAttributeValue<string>("vsd_cvap_reasontoapplylate"),
                vsd_cvap_crimelocations = e.Vsd_Cvap_CrimeLocations,
                vsd_cvap_victimdeceased = e.GetAttributeValue<OptionSetValue>("vsd_cvap_victimdeceased")?.Value,
                vsd_cvap_victimdateofdeath = e.Vsd_Cvap_VictimDateOfDeath,
                vsd_cvap_crimedetails = e.Vsd_Cvap_CrimeDetails,
                vsd_cvap_injuries = e.GetAttributeValue<string>("vsd_cvap_injuries"),
                vsd_cvap_multipleaccused = e.GetAttributeValue<OptionSetValue>("vsd_cvap_multipleaccused")?.Value,
                vsd_cvap_reporttopolice = e.GetAttributeValue<OptionSetValue>("vsd_cvap_reporttopolice")?.Value,
                vsd_cvap_crimereportedto = e.Vsd_Cvap_CrimeReportedTo,

                // Offender
                vsd_cvap_offenderfirstname = e.Vsd_Cvap_OffenderFirstName,
                vsd_cvap_offendermiddlename = e.GetAttributeValue<string>("vsd_cvap_offendermiddlename"),
                vsd_cvap_offenderlastname = e.GetAttributeValue<string>("vsd_cvap_offenderlastname"),
                vsd_cvap_relationshiptooffender = e.GetAttributeValue<string>("vsd_cvap_relationshiptooffender"),
                vsd_cvap_isoffendercharged = (int?)e.Vsd_Cvap_IsOffenderCharged,
                vsd_cvap_isoffendersued = e.GetAttributeValue<OptionSetValue>("vsd_cvap_isoffendersued")?.Value,
                vsd_cvap_intentiontosueoffender = (int?)e.Vsd_Cvap_IntentionToSueOffender,

                // Restitution / civil action
                vsd_racaf_appliedforrestitution = e.GetAttributeValue<OptionSetValue>(
                    "vsd_racaf_appliedforrestitution"
                )?.Value,
                vsd_racaf_requestedexpenses = e.GetAttributeValue<string>("vsd_racaf_requestedexpenses"),
                vsd_racaf_expensesawarded = (float?)e.Vsd_RACaF_ExpensesAwarded,
                vsd_racaf_amountreceived = (float?)e.Vsd_RACaF_AmountReceived,
                vsd_racaf_legalactiontaken = e.GetAttributeValue<OptionSetValue>("vsd_racaf_legalactiontaken")?.Value,
                vsd_racaf_lawyerorfirmname = e.GetAttributeValue<string>("vsd_racaf_lawyerorfirmname"),
                vsd_racaf_lawyeraddressline1 = e.GetAttributeValue<string>("vsd_racaf_lawyeraddressline1"),
                vsd_racaf_lawyeraddressline2 = e.GetAttributeValue<string>("vsd_racaf_lawyeraddressline2"),
                vsd_racaf_lawyercity = e.GetAttributeValue<string>("vsd_racaf_lawyercity"),
                vsd_racaf_lawyerprovince = e.GetAttributeValue<string>("vsd_racaf_lawyerprovince"),
                vsd_racaf_lawyerpostalcode = e.GetAttributeValue<string>("vsd_racaf_lawyerpostalcode"),
                vsd_racaf_lawyercountry = e.GetAttributeValue<string>("vsd_racaf_lawyercountry"),
                vsd_racaf_signature = e.GetAttributeValue<string>("vsd_racaf_signature"),
                vsd_racaf_fullname = e.GetAttributeValue<string>("vsd_racaf_fullname"),

                // Health / MSP
                vsd_applicantspersonalhealthnumber = e.Vsd_ApplicantsPersonalHealthNumber,
                vsd_applicantsmspprovince = e.Vsd_ApplicantSmSpProvince,
                vsd_applicantsmspprovinceother = e.Vsd_ApplicantSmSpProvinceOther,
                vsd_applicantsextendedhealthprovidername = e.Vsd_ApplicantsExtendedHealthProviderName,
                vsd_applicantsextendedhealthnumber = e.Vsd_ApplicantsExtendedHealthNumber,
                vsd_cvap_otherhealthcoverage = e.GetAttributeValue<OptionSetValue>(
                    "vsd_cvap_otherhealthcoverage"
                )?.Value,
                vsd_cvap_treatmenthospitalname = e.GetAttributeValue<string>("vsd_cvap_treatmenthospitalname"),
                vsd_cvap_treatmentdate = e.Vsd_Cvap_TreatmentDate,

                // Benefits (multi-select optionsets serialised to comma-separated ints)
                vsd_cvap_benefitsrequested = SerializeMultiSelect(e.Vsd_Cvap_BenefitsRequested),
                vsd_cvap_benefitsrequestedother = e.Vsd_Cvap_BenefitsRequestedOther,
                vsd_cvap_otherbenefits = SerializeMultiSelect(e.Vsd_Cvap_OtherBenefits),
                vsd_cvap_otherbenefitsother = e.Vsd_Cvap_OtherBenefitsOther,
                vsd_cvap_benefitsrequesteddescription = e.Vsd_Cvap_BenefitsRequestedDescription,

                // IFM / employment
                vsd_cvap_ifmemployedduringcrime = e.GetAttributeValue<OptionSetValue>(
                    "vsd_cvap_ifmemployedduringcrime"
                )?.Value,
                vsd_cvap_ifmatworkduringcrime = e.GetAttributeValue<OptionSetValue>(
                    "vsd_cvap_ifmatworkduringcrime"
                )?.Value,
                vsd_cvap_ifmwcbclaimnumber = e.GetAttributeValue<string>("vsd_cvap_ifmwcbclaimnumber"),
                vsd_cvap_ifmmissedwork = e.GetAttributeValue<OptionSetValue>("vsd_cvap_ifmmissedwork")?.Value,
                vsd_cvap_ifmmissedworkstart = e.Vsd_Cvap_IfMMissedWorkStart,
                vsd_cvap_ifmmissedworkend = e.Vsd_Cvap_IfMMissedWorkEnd,
                vsd_cvap_ifmareyoustilloffwork = e.GetAttributeValue<OptionSetValue>(
                    "vsd_cvap_ifmareyoustilloffwork"
                )?.Value,
                vsd_cvap_ifmlostwages = e.GetAttributeValue<OptionSetValue>("vsd_cvap_ifmlostwages")?.Value,
                vsd_cvap_ifmselfemployed = e.GetAttributeValue<OptionSetValue>("vsd_cvap_ifmselfemployed")?.Value,
                vsd_cvap_ifmcontactemployer = e.GetAttributeValue<OptionSetValue>("vsd_cvap_ifmcontactemployer")?.Value,

                // Declaration / authorisation
                vsd_cvap_onbehalfofdeclaration = (int?)e.Vsd_Cvap_OnBehalfOfDeclaration,
                vsd_applicantssignature = e.Vsd_ApplicantsSignature,
                vsd_authorizationsignature = e.Vsd_AuthorizationSignature,
                vsd_cvap_optionalauthorization = e.GetAttributeValue<OptionSetValue>(
                    "vsd_cvap_optionalauthorization"
                )?.Value,
                vsd_cvap_agency_person_authorization = e.GetAttributeValue<OptionSetValue>(
                    "vsd_cvap_agency_person_authorization"
                )?.Value,
                vsd_optionalauthorizationsignature = e.GetAttributeValue<string>("vsd_optionalauthorizationsignature"),

                vsd_cvap_crimedocumentuploaded = e.Vsd_Cvap_CrimeDocumentUploaded ?? false,
                vsd_cvap_onbehalfofdocumentuploaded = e.Vsd_Cvap_OnBehalfOfDocumentUploaded ?? false,
            };
        }

        // ------------------------------------------------------------------ //
        //  vsd_applicationcourtinformation  →  Courtinfocollection
        // ------------------------------------------------------------------ //

        public static Courtinfocollection ToDto(this Vsd_ApplicationCourtInformation e) =>
            e == null
                ? null
                : new Courtinfocollection
                {
                    vsd_courtfilenumber = e.Vsd_CourtFileNumber,
                    vsd_courtlocation = e.Vsd_CourtLocation,
                };

        // ------------------------------------------------------------------ //
        //  vsd_applicationpolicenumber  →  Policefilenumbercollection
        // ------------------------------------------------------------------ //

        public static Policefilenumbercollection ToDto(this Vsd_ApplicationPoliceNumber e) =>
            e == null
                ? null
                : new Policefilenumbercollection
                {
                    vsd_policefilenumber = e.Vsd_PoliceFileNumber,
                    vsd_investigatingpoliceofficername = e.Vsd_InvestigatingPoliceOfficerName,
                    vsd_policedetachment = e.Vsd_PoliceDetachment,
                    vsd_policereportingstartdate = e.Vsd_PoliceReportingStartDate,
                    vsd_policereportingenddate = e.Vsd_PoliceReportingEndDate,
                };

        // ------------------------------------------------------------------ //
        //  vsd_participant  →  Providercollection
        // ------------------------------------------------------------------ //

        public static Providercollection ToDto(this Vsd_Participant e) =>
            e == null
                ? null
                : new Providercollection
                {
                    vsd_name = e.Vsd_Name,
                    vsd_phonenumber = e.Vsd_PhoneNumber,
                    vsd_fax = e.Vsd_Fax,
                    vsd_addressline1 = e.Vsd_AddressLine1,
                    vsd_addressline2 = e.Vsd_AddressLine2,
                    vsd_city = e.Vsd_City,
                    vsd_province = e.Vsd_Province,
                    vsd_postalcode = e.Vsd_PostalCode,
                    vsd_email = e.Vsd_Email,
                    vsd_relationship1 = e.Vsd_Relationship1,
                    vsd_relationship2 = e.Vsd_Relationship2,
                    vsd_relationship1other = e.Vsd_Relationship1Other,
                    vsd_relationship2other = e.Vsd_Relationship2Other,
                    vsd_country = e.Vsd_Country,
                    vsd_firstname = e.Vsd_FirstName,
                    vsd_lastname = e.Vsd_LastName,
                    vsd_companyname = e.Vsd_CompanyName,
                    vsd_preferredmethodofcontact = (int?)e.Vsd_PreferredMethodOfContact,
                    vsd_alternatephonenumber = e.Vsd_AlternatePhoneNumber,
                    vsd_middlename = e.Vsd_MiddleName,
                };

        // ------------------------------------------------------------------ //
        //  Aggregate: application + related collections  →  ApplicationFormModel
        // ------------------------------------------------------------------ //

        public static ApplicationFormModel ToApplicationFormModel(
            this Vsd_Application application,
            IEnumerable<Vsd_ApplicationCourtInformation> courtInfos,
            IEnumerable<Vsd_ApplicationPoliceNumber> policeNumbers,
            IEnumerable<Vsd_Participant> participants
        )
        {
            var dynamics = new ApplicationDynamicsModel
            {
                Application = application.ToApplicationJsonDto(),
                CourtInfoCollection = courtInfos?.Select(c => c.ToDto()).ToArray() ?? [],
                PoliceFileNumberCollection = policeNumbers?.Select(p => p.ToDto()).ToArray() ?? [],
                ProviderCollection = participants?.Select(p => p.ToDto()).ToArray() ?? [],
            };
            return dynamics.ToApplicationFormModel();
        }

        // ------------------------------------------------------------------ //
        //  vsd_invoicelinedetail  →  LineItemDynamicsModel
        // ------------------------------------------------------------------ //

        public static LineItemDynamicsModel ToDto(this Vsd_InvoiceLineDetail e) =>
            e == null
                ? null
                : new LineItemDynamicsModel
                {
                    vsd_name = e.Vsd_Name,
                    vsd_cvap_counsellingtype = (int?)e.Vsd_Cvap_CounsellingType,
                    vsd_cvap_sessionduration = (float?)e.Vsd_Cvap_SessionDuration,
                    vsd_missedsession = e.Vsd_MissedSession,
                    vsd_cvap_sessiondate = e.Vsd_Cvap_SessionDate,
                };

        // ------------------------------------------------------------------ //
        //  vsd_invoice  →  CounsellorInvoiceFormDynamicsModel
        // ------------------------------------------------------------------ //

        public static CounsellorInvoiceFormDynamicsModel ToDto(this Vsd_Invoice e) =>
            e == null
                ? null
                : new CounsellorInvoiceFormDynamicsModel
                {
                    vsd_payeenumber = e.Vsd_PayeeNumber,
                    vsd_emailaddress = e.Vsd_EmailAddress,
                    vsd_cvap_counsellorregistrationnumber = e.Vsd_Cvap_CounsellorRegistrationNumber,
                    vsd_cvap_nameofcounsellortext = e.Vsd_Cvap_NameOfCounsellorText,
                    vsd_claimnumbertext = e.Vsd_ClaimNumberText,
                    vsd_claimantnametext = e.Vsd_ClaimantNameText,
                    vsd_claimantlastnametext = e.Vsd_ClaimantLastNameText,
                    vsd_payeeinvoicenumber = e.Vsd_PayeeInvoiceNumber,
                    vsd_invoicedate = e.Vsd_InvoicedAte?.ToString("s"),
                    vsd_signature = e.Vsd_Signature,
                    vsd_cvap_counselloremailtext = e.Vsd_Cvap_CounsellorEmailText,
                };

        // ------------------------------------------------------------------ //
        //  Aggregate: invoice + line items  →  CounsellorInvoiceFormModel
        // ------------------------------------------------------------------ //

        public static CounsellorInvoiceFormModel ToFormModel(
            this Vsd_Invoice invoice,
            IEnumerable<Vsd_InvoiceLineDetail> lineItems
        )
        {
            var dto = invoice.ToDto();
            dto.InvoiceLineItems = lineItems?.Select(l => l.ToDto()).ToArray() ?? [];
            return dto.ToFormModel();
        }

        // ------------------------------------------------------------------ //
        //  Helpers
        // ------------------------------------------------------------------ //

        private static string SerializeMultiSelect<T>(IEnumerable<T> values)
            where T : Enum => values == null ? null : string.Join(",", values.Select(v => Convert.ToInt32(v)));
    }
}
