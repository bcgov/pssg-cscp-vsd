using System;
using System.Linq;
using Gov.Cscp.VictimServices.Public.JsonObjects;
using Gov.Cscp.VictimServices.Public.ViewModels;

namespace Gov.Cscp.VictimServices.Public.Models.Extensions
{
    public static class VictimRestitutionModelExtensions
    {
        public static VictimRestitutionDynamicsModel ToVictimRestitutionModel(this VictimRestitutionFormModel model)
        {
            var application = new VictimRestitutionDynamicsModel();
            application.Application = new Application();

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
            try
            {
                if (model.DocumentCollectionInformation != null)
                {
                    Documentcollection tempDocumentCollection = new Documentcollection();
                    tempDocumentCollection.body = model.DocumentCollectionInformation.body;
                    tempDocumentCollection.filename = model.DocumentCollectionInformation.fileName;
                    application.DocumentCollection = new Documentcollection[1];
                    application.DocumentCollection[0] = tempDocumentCollection;



                    //application.DocumentCollection[1].body = model.DocumentCollectionInformation.body;
                    //application.DocumentCollection[1].filename = model.DocumentCollectionInformation.fileName;

                    //application.DocumentCollection = model.DocumentCollectionInformation.Select(g => new Documentcollection
                    //{
                    //    body = g.body,
                    //    filename = g.fileName
                    //}).ToArray();
                }
            }
            catch (Exception e)
            {
                string errormessage = e.Message;
            }


            if (model.RestitutionInformation.courtFiles != null)
            {
                if (model.RestitutionInformation.courtFiles.Count() > 0)
                {
                    application.CourtInfoCollection = model.RestitutionInformation.courtFiles.Select(f => new Courtinfocollection
                    {
                        vsd_courtfilenumber = f.courtFileNumber,
                        vsd_courtlocation = f.courtLocation
                    }).ToArray();
                }
            }


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
    }
}
