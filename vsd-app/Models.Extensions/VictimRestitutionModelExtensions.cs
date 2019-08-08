using System;
using System.Collections.Generic;
using System.Linq;
using Gov.Cscp.VictimServices.Public.JsonObjects;
using Gov.Cscp.VictimServices.Public.ViewModels;
using Gov.Cscp.VictimServices.Public.Infrastructure;

namespace Gov.Cscp.VictimServices.Public.Models.Extensions
{
    public static class VictimRestitutionModelExtensions
    {
        public static VictimRestitutionDynamicsModel ToVictimRestitutionModel(this VictimRestitutionFormModel model)
        {
            var application = GetApplicationDefaults();

            if (model == null)
                return null;

            if (model.RestitutionInformation != null)
            {
                application.Application.vsd_applicantsfirstname = model.RestitutionInformation.victimFirstName;
                application.Application.vsd_applicantsmiddlename = model.RestitutionInformation.victimMiddleName;
                application.Application.vsd_applicantslastname = model.RestitutionInformation.victimLastName;
                if (model.RestitutionInformation.victimBirthDate.HasValue)
                {
                    application.Application.vsd_applicantsbirthdate = model.RestitutionInformation.victimBirthDate.Value;
                }
                application.Application.vsd_applicantsgendercode = model.RestitutionInformation.victimGender;
                application.Application.vsd_applicantspreferredmethodofcontact = model.RestitutionInformation.preferredMethodOfContact;
                application.Application.vsd_applicantsprimaryphonenumber = model.RestitutionInformation.phoneNumber;
                application.Application.vsd_applicantsalternatephonenumber = model.RestitutionInformation.alternatePhoneNumber;
                application.Application.vsd_applicantsemail = model.RestitutionInformation.email;

                if (model.RestitutionInformation.mailingAddress != null)
                {
                    application.Application.vsd_applicantsprimaryaddressline1 = model.RestitutionInformation.mailingAddress.line1;
                    application.Application.vsd_applicantsprimaryaddressline2 = model.RestitutionInformation.mailingAddress.line2;
                    application.Application.vsd_applicantsprimarycity = model.RestitutionInformation.mailingAddress.city;
                    application.Application.vsd_applicantsprimaryprovince = model.RestitutionInformation.mailingAddress.province;
                    application.Application.vsd_applicantsprimarypostalcode = model.RestitutionInformation.mailingAddress.postalCode;
                    application.Application.vsd_applicantsprimarycountry = model.RestitutionInformation.mailingAddress.country;
                }

                application.Application.vsd_cvap_offenderfirstname = model.RestitutionInformation.offenderFirstName;
                application.Application.vsd_cvap_offendermiddlename = model.RestitutionInformation.offenderMiddleName;
                application.Application.vsd_cvap_offenderlastname = model.RestitutionInformation.offenderLastName;
                application.Application.vsd_cvap_relationshiptooffender = model.RestitutionInformation.offenderRelationship;

                application.Application.vsd_applicantssignature = model.RestitutionInformation.signature; // TODO: where does this come from?
            }

            // TODO: Fix file mapping
            // how does the uploading work? is our array a list of file ids? Look them up and extract appropriate data...
            application.DocumentCollection = model.RestitutionInformation.restitutionOrders.Select(g => new Documentcollection
            {
                body = g.body,
                filename = g.fileName
            }).ToArray();

            application.CourtInfoCollection = model.RestitutionInformation.courtFiles.Select(f => new Courtinfocollection
            {
                vsd_courtfilenumber = f.courtFileNumber,
                vsd_courtlocation = f.courtLocation
            }).ToArray();

            // TODO: For some reason when this is moved to OpenShift, it doesn't work. 
            // Error Message: System.AggregateException: One or more errors occurred. (Value cannot be null.
            // Parameter name: source) --->System.ArgumentNullException: Value cannot be null.
            // Parameter name: source
            //application.ProviderCollection = model.RestitutionInformation.providerFiles.Select(t => new Providercollection
            //{
            //    vsd_name = "",
            //    vsd_phonenumber = "",
            //    vsd_addressline1 = "",
            //    vsd_addressline2 = "",
            //    vsd_city = "",
            //    vsd_province = "",
            //    vsd_postalcode = "",
            //    vsd_email = "",
            //    vsd_firstname = t.firstName,
            //    vsd_relationship1 = t.relationship,
            //    vsd_country = "",
            //    vsd_lastname = "",
            //    vsd_preferredmethodofcontact = null,
            //    vsd_alternatephonenumber = "",
            //    vsd_middlename = "",
            //}).ToArray();

            return application;
        }

        public static VictimRestitutionDynamicsModel GetApplicationDefaults()
        {
            return new VictimRestitutionDynamicsModel
            {
                Application = new Application
                {
                    //vsd_applicanttype = 100000002,
                    //VsdApplicantsfirstname = "CVAP DEV",
                    //VsdApplicantslastname = "Form Test",
                    //VsdApplicantsbirthdate = "1982-05-05T00:00:00",
                    //VsdApplicantsbirthdate = new DateTime(1983, 6, 4), //"1982-05-05T00:00:00",
                    //VsdApplicantsgendercode = 100000000,
                    //VsdApplicantsmaritalstatus = 100000000,
                    //VsdCvapTypeofcrime = "Break-in",
                    vsd_applicantsemail = "test@test.com",
                    vsd_applicantsprimaryphonenumber = "250-444-5656",
                    vsd_applicantssignature = "Crime Victim Guy",

                    //vsd_cvap_crimestartdate = new DateTime(2018, 6, 14), //"2018-06-03T00:00:00",

                    // TODO: Don't know where these two fields went...
                    // vsd_cvap_authorizationsigneddate = "2019-02-07T00:00:00",
                    // vsd_cvap_declarationsigneddate = "2019-02-07T00:00:00",
                    vsd_cvap_onbehalfofdeclaration = 100000000,
                },
                //CourtInfoCollection = new List<Courtinfocollection>
                //{
                //    new Courtinfocollection
                //    {
                //        vsd_courtfilenumber = "1234567",
                //        vsd_courtlocation = "Victoria"
                //    }
                //}.ToArray(),
                //ProviderCollection = new List<Providercollection>
                //{
                //    new Providercollection
                //    {
                //        vsd_name = "Mr. Smith",
                //        // TODO: Don't know where this field went
                //        // VsdType = 100000000
                //    }
                //}.ToArray()
            };
        }
    }
}
