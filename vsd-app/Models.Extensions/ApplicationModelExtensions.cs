using System;
using System.Collections.Generic;
using System.Configuration.Provider;
using System.Linq;
using System.Xml.Serialization;
using Gov.Cscp.VictimServices.Public.Infrastructure;
using Gov.Cscp.VictimServices.Public.JsonObjects;
using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.ViewModels;
using static System.Net.Mime.MediaTypeNames;
using Application = Gov.Cscp.VictimServices.Public.JsonObjects.Application;
using VSDAddress = Gov.Cscp.VictimServices.Public.ViewModels.Address;
using VSDCourtfile = Gov.Cscp.VictimServices.Public.ViewModels.Courtfile;

namespace Gov.Cscp.VictimServices.Public.Models.Extensions
{
    public static class ApplicationModelExtensions
    {
        public static ApplicationDynamicsModel ToVsdVictimsModel(this ApplicationFormModel model)
        {
            ApplicationDynamicsModel application = new ApplicationDynamicsModel();
            application.Application = new Application();

            if (model == null)
                return null;

            application.Application.vsd_applicanttype = model.ApplicationType;
            if (model.PersonalInformation != null)
            {
                application.Application.vsd_applicantsfirstname = model.PersonalInformation.firstName;
                application.Application.vsd_applicantsmiddlename = model.PersonalInformation.middleName;
                application.Application.vsd_applicantslastname = model.PersonalInformation.lastName;
                application.Application.vsd_otherfirstname = model.PersonalInformation.otherFirstName;
                application.Application.vsd_otherlastname = model.PersonalInformation.otherLastName;
                if (model.PersonalInformation.dateOfNameChange.HasValue)
                {
                    application.Application.vsd_dateofnamechange = model.PersonalInformation.dateOfNameChange;
                }

                if (
                    application.Application.vsd_applicanttype == (int)ApplicationType.ImmediateFamilyMember
                    || application.Application.vsd_applicanttype == (int)ApplicationType.Witness
                )
                {
                    application.Application.vsd_cvap_relationshiptovictim = model
                        .PersonalInformation
                        .relationshipToVictim;
                    application.Application.vsd_relationshipother1 = model
                        .PersonalInformation
                        .relationshipToVictimOther;
                }

                application.Application.vsd_applicantsgendercode = model.PersonalInformation.gender;
                application.Application.vsd_genderidentitytext = model.PersonalInformation.otherGender;
                application.Application.vsd_pronouns = model.PersonalInformation.pronouns;
                application.Application.vsd_pronountext = model.PersonalInformation.otherPronouns;
                application.Application.vsd_primaryraceethnicity = model.PersonalInformation.raceEthnicity;
                application.Application.vsd_primaryraceethnicitytext = model.PersonalInformation.otherRaceEthnicity;
                application.Application.vsd_indigenous = model.PersonalInformation.indigenousStatus;

                if (model.PersonalInformation.birthDate.HasValue)
                {
                    application.Application.vsd_applicantsbirthdate = model.PersonalInformation.birthDate.Value;
                }
                application.Application.vsd_applicantsmaritalstatus = model.PersonalInformation.maritalStatus;

                application.Application.vsd_applicantsoccupation = model.PersonalInformation.occupation;

                application.Application.vsd_applicantssocialinsurancenumber = model.PersonalInformation.sin;
                if (
                    !String.IsNullOrEmpty(application.Application.vsd_applicantssocialinsurancenumber)
                    && application.Application.vsd_applicantssocialinsurancenumber.Length == 9
                )
                {
                    application.Application.vsd_applicantssocialinsurancenumber =
                        application.Application.vsd_applicantssocialinsurancenumber.Substring(0, 3)
                        + " "
                        + application.Application.vsd_applicantssocialinsurancenumber.Substring(3, 3)
                        + " "
                        + application.Application.vsd_applicantssocialinsurancenumber.Substring(6);
                }

                application.Application.vsd_applicantsprimaryphonenumber = model.PersonalInformation.phoneNumber;
                if (model.PersonalInformation.leaveVoicemail > 0)
                {
                    application.Application.vsd_voicemailoption = model.PersonalInformation.leaveVoicemail;
                }
                application.Application.vsd_applicantsalternatephonenumber = model
                    .PersonalInformation
                    .alternatePhoneNumber;
                application.Application.vsd_applicantsemail = model.PersonalInformation.email;
                application.Application.vsd_applicantspreferredmethodofcontact = model
                    .PersonalInformation
                    .preferredMethodOfContact;

                if (model.PersonalInformation.primaryAddress != null)
                {
                    application.Application.vsd_applicantsprimaryaddressline1 = model
                        .PersonalInformation
                        .primaryAddress
                        .line1;
                    application.Application.vsd_applicantsprimaryaddressline2 = model
                        .PersonalInformation
                        .primaryAddress
                        .line2;
                    application.Application.vsd_applicantsprimarycity = model.PersonalInformation.primaryAddress.city;
                    application.Application.vsd_applicantsprimaryprovince = model
                        .PersonalInformation
                        .primaryAddress
                        .province;
                    application.Application.vsd_applicantsprimarycountry = model
                        .PersonalInformation
                        .primaryAddress
                        .country;
                    application.Application.vsd_applicantsprimarypostalcode = model
                        .PersonalInformation
                        .primaryAddress
                        .postalCode;

                    //postal code formatting - if it is a Canadian postal code of expected length
                    if (
                        !String.IsNullOrEmpty(application.Application.vsd_applicantsprimarycountry)
                        && application.Application.vsd_applicantsprimarycountry.Equals("Canada")
                        && !String.IsNullOrEmpty(application.Application.vsd_applicantsprimarypostalcode)
                    )
                    {
                        application.Application.vsd_applicantsprimarypostalcode =
                            application.Application.vsd_applicantsprimarypostalcode.ToUpper();
                        if (application.Application.vsd_applicantsprimarypostalcode.Length == 6)
                        {
                            application.Application.vsd_applicantsprimarypostalcode =
                                application.Application.vsd_applicantsprimarypostalcode.Substring(0, 3)
                                + " "
                                + application.Application.vsd_applicantsprimarypostalcode.Substring(3);
                        }
                    }

                    if (
                        model.PersonalInformation.doNotLiveAtAddress
                        && string.IsNullOrEmpty(model.PersonalInformation.mailRecipient)
                    )
                    {
                        application.Application.vsd_applicantsprimaryaddressline3 = "c/o";
                    }
                    else if (!string.IsNullOrEmpty(model.PersonalInformation.mailRecipient))
                    {
                        application.Application.vsd_applicantsprimaryaddressline3 =
                            "c/o " + model.PersonalInformation.mailRecipient;
                    }
                }

                if (model.PersonalInformation.alternateAddress != null)
                {
                    application.Application.vsd_applicantsalternateaddressline1 = model
                        .PersonalInformation
                        .alternateAddress
                        .line1;
                    application.Application.vsd_applicantsalternateaddressline2 = model
                        .PersonalInformation
                        .alternateAddress
                        .line2;
                    application.Application.vsd_applicantsalternatecity = model
                        .PersonalInformation
                        .alternateAddress
                        .city;
                    application.Application.vsd_applicantsalternateprovince = model
                        .PersonalInformation
                        .alternateAddress
                        .province;
                    application.Application.vsd_applicantsalternatecountry = model
                        .PersonalInformation
                        .alternateAddress
                        .country;
                    application.Application.vsd_applicantsalternatepostalcode = model
                        .PersonalInformation
                        .alternateAddress
                        .postalCode;

                    //postal code formatting - if it is a Canadian postal code of expected length
                    if (
                        !String.IsNullOrEmpty(application.Application.vsd_applicantsalternatecountry)
                        && application.Application.vsd_applicantsalternatecountry.Equals("Canada")
                        && !String.IsNullOrEmpty(application.Application.vsd_applicantsalternatepostalcode)
                    )
                    {
                        application.Application.vsd_applicantsalternatepostalcode =
                            application.Application.vsd_applicantsalternatepostalcode.ToUpper();
                        if (application.Application.vsd_applicantsalternatepostalcode.Length == 6)
                        {
                            application.Application.vsd_applicantsalternatepostalcode =
                                application.Application.vsd_applicantsalternatepostalcode.Substring(0, 3)
                                + " "
                                + application.Application.vsd_applicantsalternatepostalcode.Substring(3);
                        }
                    }
                }
            }

            if (model.VictimInformation != null)
            {
                application.Application.vsd_cvap_victimfirstname = model.VictimInformation.firstName;
                application.Application.vsd_cvap_victimmiddlename = model.VictimInformation.middleName;
                application.Application.vsd_cvap_victimlastname = model.VictimInformation.lastName;
                application.Application.vsd_cvap_victimotherfirstname = model.VictimInformation.otherFirstName;
                application.Application.vsd_cvap_victimotherlastname = model.VictimInformation.otherLastName;

                application.Application.vsd_cvap_victimmaritalstatus = model.VictimInformation.maritalStatus;

                if (model.VictimInformation.dateOfNameChange.HasValue)
                {
                    application.Application.vsd_cvap_victimdateofnamechange = model.VictimInformation.dateOfNameChange;
                }

                application.Application.vsd_cvap_victimgendercode = model.VictimInformation.gender;
                application.Application.vsd_victimgendertext = model.VictimInformation.otherGender;
                application.Application.vsd_victimpronouns = model.VictimInformation.pronouns;
                application.Application.vsd_victimpronountext = model.VictimInformation.otherPronouns;
                application.Application.vsd_victimprimaryraceethnicity = model.VictimInformation.raceEthnicity;
                application.Application.vsd_victimprimaryraceethnicitytext = model.VictimInformation.otherRaceEthnicity;
                application.Application.vsd_victimindigenous = model.VictimInformation.indigenousStatus;

                if (model.VictimInformation.birthDate.HasValue)
                {
                    application.Application.vsd_cvap_victimbirthdate = model.VictimInformation.birthDate.Value;
                }

                application.Application.vsd_cvap_victimoccupation = model.VictimInformation.occupation;

                application.Application.vsd_cvap_victimsocialinsurancenumber = model.VictimInformation.sin;
                if (
                    !String.IsNullOrEmpty(application.Application.vsd_cvap_victimsocialinsurancenumber)
                    && application.Application.vsd_cvap_victimsocialinsurancenumber.Length == 9
                )
                {
                    application.Application.vsd_cvap_victimsocialinsurancenumber =
                        application.Application.vsd_cvap_victimsocialinsurancenumber.Substring(0, 3)
                        + " "
                        + application.Application.vsd_cvap_victimsocialinsurancenumber.Substring(3, 3)
                        + " "
                        + application.Application.vsd_cvap_victimsocialinsurancenumber.Substring(6);
                }

                application.Application.vsd_cvap_victimprimaryphonenumber = model.VictimInformation.phoneNumber;
                application.Application.vsd_cvap_victimalternatephonenumber = model
                    .VictimInformation
                    .alternatePhoneNumber;
                application.Application.vsd_cvap_victimemailaddress = model.VictimInformation.email;

                if (model.VictimInformation.primaryAddress != null)
                {
                    application.Application.vsd_cvap_victimaddressline1 = model.VictimInformation.primaryAddress.line1;
                    application.Application.vsd_cvap_victimaddressline2 = model.VictimInformation.primaryAddress.line2;
                    application.Application.vsd_cvap_victimcity = model.VictimInformation.primaryAddress.city;
                    application.Application.vsd_cvap_victimprovince = model.VictimInformation.primaryAddress.province;
                    application.Application.vsd_cvap_victimcountry = model.VictimInformation.primaryAddress.country;
                    application.Application.vsd_cvap_victimpostalcode = model
                        .VictimInformation
                        .primaryAddress
                        .postalCode;

                    //postal code formatting - if it is a Canadian postal code of expected length
                    if (
                        !String.IsNullOrEmpty(application.Application.vsd_cvap_victimcountry)
                        && application.Application.vsd_cvap_victimcountry.Equals("Canada")
                        && !String.IsNullOrEmpty(application.Application.vsd_cvap_victimpostalcode)
                    )
                    {
                        application.Application.vsd_cvap_victimpostalcode =
                            application.Application.vsd_cvap_victimpostalcode.ToUpper();
                        if (application.Application.vsd_cvap_victimpostalcode.Length == 6)
                        {
                            application.Application.vsd_cvap_victimpostalcode =
                                application.Application.vsd_cvap_victimpostalcode.Substring(0, 3)
                                + " "
                                + application.Application.vsd_cvap_victimpostalcode.Substring(3);
                        }
                    }
                }
            }

            if (model.CrimeInformation != null)
            {
                application.Application.vsd_cvap_typeofcrime = model.CrimeInformation.typeOfCrime;
                application.Application.vsd_cvap_unsureofspecificcrimedates = model.CrimeInformation.unsureOfCrimeDates;
                if (model.CrimeInformation.crimePeriodStart.HasValue)
                {
                    application.Application.vsd_cvap_crimestartdate = model.CrimeInformation.crimePeriodStart;
                }
                if (model.CrimeInformation.crimePeriodEnd.HasValue)
                {
                    application.Application.vsd_cvap_crimeenddate = model.CrimeInformation.crimePeriodEnd;
                }

                application.Application.vsd_cvap_overoneyear = model.CrimeInformation.overOneYearFromCrime; // TODO: Verify mapping - I think it's right but just different names
                application.Application.vsd_cvap_reasontoapplylate = model.CrimeInformation.whyDidYouNotApplySooner; // TODO: Verify mapping - I think it's right but just different names

                if (
                    application.Application.vsd_applicanttype == (int)ApplicationType.ImmediateFamilyMember
                    || application.Application.vsd_applicanttype == (int)ApplicationType.Witness
                )
                {
                    application.Application.vsd_cvap_victimdeceased = model.CrimeInformation.victimDeceasedFromCrime;
                    application.Application.vsd_cvap_victimdateofdeath = model.CrimeInformation.dateOfDeath;
                }

                // Add Crime Locations as an array separated by line feeds
                if (model.CrimeInformation.crimeLocations.Count() > 0)
                {
                    string tempOutput = "";
                    foreach (Crimelocation tempCrimeLocation in model.CrimeInformation.crimeLocations)
                    {
                        tempOutput = tempOutput + tempCrimeLocation.location + "\r\n";
                    }
                    application.Application.vsd_cvap_crimelocations = tempOutput.Substring(0, tempOutput.Length - 2);
                }

                application.Application.vsd_cvap_crimedetails = model.CrimeInformation.crimeDetails;
                application.Application.vsd_cvap_injuries = model.CrimeInformation.crimeInjuries;

                // Include upload files
                try
                {
                    int documentCollectionLength =
                        model.CrimeInformation.documents.Length
                        + model.RepresentativeInformation.documents.Length
                        + model.ApplicationPDFs.Length;
                    if (model.EmploymentIncomeInformation != null)
                    {
                        documentCollectionLength += model.EmploymentIncomeInformation.documents.Length;
                    }

                    application.Application.vsd_cvap_crimedocumentuploaded =
                        model.CrimeInformation.documents.Length > 0;
                    application.Application.vsd_cvap_onbehalfofdocumentuploaded =
                        model.RepresentativeInformation.documents.Length > 0;

                    if (documentCollectionLength > 0)
                    {
                        application.DocumentCollection = new Documentcollection[documentCollectionLength];
                        int documentIndex = 0;

                        //PDF copy of application, and extra copy of just the auth page
                        for (int i = 0; i < model.ApplicationPDFs.Length; ++i)
                        {
                            Documentcollection tempDocumentCollection = new Documentcollection();
                            tempDocumentCollection.body = model.ApplicationPDFs[i].body;
                            tempDocumentCollection.filename = model.ApplicationPDFs[i].fileName;
                            tempDocumentCollection.subject = model.ApplicationPDFs[i].subject;
                            application.DocumentCollection[documentIndex] = tempDocumentCollection;
                            ++documentIndex;
                        }

                        for (int i = 0; i < model.CrimeInformation.documents.Length; ++i)
                        {
                            Documentcollection tempDocumentCollection = new Documentcollection();
                            tempDocumentCollection.body = model.CrimeInformation.documents[i].body;
                            tempDocumentCollection.filename = model.CrimeInformation.documents[i].fileName;
                            tempDocumentCollection.subject = model.CrimeInformation.documents[i].subject;
                            application.DocumentCollection[documentIndex] = tempDocumentCollection;
                            ++documentIndex;
                        }

                        for (int i = 0; i < model.RepresentativeInformation.documents.Length; ++i)
                        {
                            Documentcollection tempDocumentCollection = new Documentcollection();
                            tempDocumentCollection.body = model.RepresentativeInformation.documents[i].body;
                            tempDocumentCollection.filename = model.RepresentativeInformation.documents[i].fileName;
                            tempDocumentCollection.subject = model.RepresentativeInformation.documents[i].subject;
                            application.DocumentCollection[documentIndex] = tempDocumentCollection;
                            ++documentIndex;
                        }

                        for (int i = 0; i < model.EmploymentIncomeInformation?.documents.Length; ++i)
                        {
                            Documentcollection tempDocumentCollection = new Documentcollection();
                            tempDocumentCollection.body = model.EmploymentIncomeInformation.documents[i].body;
                            tempDocumentCollection.filename = model.EmploymentIncomeInformation.documents[i].fileName;
                            tempDocumentCollection.subject = model.EmploymentIncomeInformation.documents[i].subject;
                            application.DocumentCollection[documentIndex] = tempDocumentCollection;
                            ++documentIndex;
                        }
                    }
                }
                catch (Exception e)
                {
                    string errormessage = e.Message;
                }

                application.Application.vsd_cvap_reporttopolice = model.CrimeInformation.wasReportMadeToPolice;
                application.Application.vsd_cvap_crimereportedto = model.CrimeInformation.noPoliceReportIdentification; // TODO: verify mapping - I think it's right, but different names

                // Setup policeFiles, don't show if there isn't any
                if (model.CrimeInformation.policeReports != null && model.CrimeInformation.policeReports.Length > 0)
                {
                    application.PoliceFileNumberCollection = model
                        .CrimeInformation.policeReports.Select(r => new Policefilenumbercollection
                        {
                            vsd_investigatingpoliceofficername = r.investigatingOfficer,
                            vsd_policefilenumber = r.policeFileNumber,
                            vsd_policedetachment = r.policeDetachment.Equals("Other")
                                ? r.policeDetachmentOther
                                : r.policeDetachment,
                            vsd_policereportingstartdate = r.reportStartDate,
                            vsd_policereportingenddate = r.reportEndDate,
                        })
                        .ToArray();
                }

                application.Application.vsd_cvap_multipleaccused = model.CrimeInformation.moreThanOneOffender
                    ? (int)CRMBoolean.True
                    : (int)CRMBoolean.False;

                if (
                    !string.IsNullOrEmpty(model.CrimeInformation.offenderFirstName)
                    || !string.IsNullOrEmpty(model.CrimeInformation.offenderMiddleName)
                    || !string.IsNullOrEmpty(model.CrimeInformation.offenderLastName)
                    || !string.IsNullOrEmpty(model.CrimeInformation.offenderRelationship)
                )
                {
                    Providercollection[] tempProviderCollection = new Providercollection[1];
                    tempProviderCollection[0] = new Providercollection();
                    tempProviderCollection[0].vsd_firstname = model.CrimeInformation.offenderFirstName;
                    tempProviderCollection[0].vsd_middlename = model.CrimeInformation.offenderMiddleName;
                    tempProviderCollection[0].vsd_lastname = model.CrimeInformation.offenderLastName;
                    tempProviderCollection[0].vsd_relationship1 = "Accused";
                    tempProviderCollection[0].vsd_relationship2 = "Other";
                    tempProviderCollection[0].vsd_relationship2other = model.CrimeInformation.offenderRelationship;

                    AddProvidersToCollection(tempProviderCollection, application);
                }

                if (model.CrimeInformation.additionalOffenders.Length > 0)
                {
                    Providercollection[] tempProviderCollection = model
                        .CrimeInformation.additionalOffenders.Select(o => new Providercollection
                        {
                            vsd_firstname = o.firstName,
                            vsd_middlename = o.middleName,
                            vsd_lastname = o.lastName,
                            vsd_relationship1 = "Accused",
                            vsd_relationship2 = "Other",
                            vsd_relationship2other = o.relationship,
                        })
                        .Where(o =>
                            !string.IsNullOrEmpty(o.vsd_firstname)
                            || !string.IsNullOrEmpty(o.vsd_middlename)
                            || !string.IsNullOrEmpty(o.vsd_lastname)
                            || !string.IsNullOrEmpty(o.vsd_relationship2other)
                        )
                        .ToArray();

                    AddProvidersToCollection(tempProviderCollection, application);
                }

                // application.Application.vsd_cvap_offenderfirstname = model.CrimeInformation.offenderFirstName;
                // application.Application.vsd_cvap_offendermiddlename = model.CrimeInformation.offenderMiddleName;
                // application.Application.vsd_cvap_offenderlastname = model.CrimeInformation.offenderLastName;
                // application.Application.vsd_cvap_relationshiptooffender = model.CrimeInformation.offenderRelationship;

                application.Application.vsd_cvap_isoffendercharged = model.CrimeInformation.offenderBeenCharged;
                application.Application.vsd_cvap_isoffendersued = model.CrimeInformation.haveYouSuedOffender;
                application.Application.vsd_cvap_intentiontosueoffender = model.CrimeInformation.intendToSueOffender;

                // Setup courtFiles, don't show if there isn't any
                if (model.CrimeInformation.courtFiles != null)
                {
                    if (model.CrimeInformation.courtFiles.Count() > 0)
                    {
                        if (model.CrimeInformation.courtFiles[0].courtFileNumber.Length > 0)
                        {
                            application.CourtInfoCollection = model
                                .CrimeInformation.courtFiles.Select(f => new Courtinfocollection
                                {
                                    vsd_courtfilenumber = f.courtFileNumber,
                                    vsd_courtlocation = f.courtLocation,
                                })
                                .ToArray();
                        }
                    }
                }

                if (model.CrimeInformation.racafInformation != null)
                {
                    application.Application.vsd_racaf_appliedforrestitution = model
                        .CrimeInformation
                        .racafInformation
                        .applyToCourtForMoneyFromOffender;
                    application.Application.vsd_racaf_requestedexpenses = model
                        .CrimeInformation
                        .racafInformation
                        .expensesRequested;
                    if (!string.IsNullOrEmpty(model.CrimeInformation.racafInformation.expensesAwarded))
                    {
                        application.Application.vsd_racaf_expensesawarded = decimal.Parse(
                            model.CrimeInformation.racafInformation.expensesAwarded
                        );
                    }

                    if (!string.IsNullOrEmpty(model.CrimeInformation.racafInformation.expensesReceived))
                    {
                        application.Application.vsd_racaf_amountreceived = decimal.Parse(
                            model.CrimeInformation.racafInformation.expensesReceived
                        );
                    }

                    application.Application.vsd_racaf_legalactiontaken = model
                        .CrimeInformation
                        .racafInformation
                        .willBeTakingLegalAction;
                    application.Application.vsd_racaf_lawyerorfirmname = model
                        .CrimeInformation
                        .racafInformation
                        .lawyerOrFirmName;
                    application.Application.vsd_racaf_lawyeraddressline1 = model
                        .CrimeInformation
                        .racafInformation
                        .lawyerAddress
                        ?.line1;
                    application.Application.vsd_racaf_lawyeraddressline2 = model
                        .CrimeInformation
                        .racafInformation
                        .lawyerAddress
                        ?.line2;
                    application.Application.vsd_racaf_lawyercity = model
                        .CrimeInformation
                        .racafInformation
                        .lawyerAddress
                        ?.city;
                    application.Application.vsd_racaf_lawyerprovince = model
                        .CrimeInformation
                        .racafInformation
                        .lawyerAddress
                        ?.province;
                    application.Application.vsd_racaf_lawyerpostalcode = model
                        .CrimeInformation
                        .racafInformation
                        .lawyerAddress
                        ?.postalCode;
                    application.Application.vsd_racaf_lawyercountry = model
                        .CrimeInformation
                        .racafInformation
                        .lawyerAddress
                        ?.country;

                    //postal code formatting - if it is a Canadian postal code of expected length
                    if (
                        !String.IsNullOrEmpty(application.Application.vsd_racaf_lawyercountry)
                        && application.Application.vsd_racaf_lawyercountry.Equals("Canada")
                        && !String.IsNullOrEmpty(application.Application.vsd_racaf_lawyerpostalcode)
                    )
                    {
                        application.Application.vsd_racaf_lawyerpostalcode =
                            application.Application.vsd_racaf_lawyerpostalcode.ToUpper();
                        if (application.Application.vsd_racaf_lawyerpostalcode.Length == 6)
                        {
                            application.Application.vsd_racaf_lawyerpostalcode =
                                application.Application.vsd_racaf_lawyerpostalcode.Substring(0, 3)
                                + " "
                                + application.Application.vsd_racaf_lawyerpostalcode.Substring(3);
                        }
                    }

                    application.Application.vsd_racaf_signature = model.CrimeInformation.racafInformation.signature;
                    application.Application.vsd_racaf_fullname = model.CrimeInformation.racafInformation.signName;
                }
            }

            if (model.MedicalInformation != null)
            {
                application.Application.vsd_applicantspersonalhealthnumber = model
                    .MedicalInformation
                    .personalHealthNumber;
                application.Application.vsd_applicantsmspprovince = model
                    .MedicalInformation
                    .haveMedicalCoverageProvince;
                application.Application.vsd_applicantsmspprovinceother = model
                    .MedicalInformation
                    .haveMedicalCoverageProvinceOther;

                application.Application.vsd_cvap_otherhealthcoverage = model
                    .MedicalInformation
                    .doYouHaveOtherHealthCoverage;

                application.Application.vsd_applicantsextendedhealthprovidername = model
                    .MedicalInformation
                    .otherHealthCoverageProviderName; // TODO: verify mapping, "other" seems weird here
                application.Application.vsd_applicantsextendedhealthnumber = model
                    .MedicalInformation
                    .otherHealthCoverageExtendedPlanNumber; // TODO: verify mapping, "other" seems weird here

                application.Application.vsd_cvap_treatmenthospitalname = model.MedicalInformation.treatedAtHospitalName;
                if (model.MedicalInformation.treatedOutsideBc)
                {
                    application.Application.vsd_cvap_treatmenthospitalname = model
                        .MedicalInformation
                        .treatedOutsideBcHospitalName;
                }

                if (model.MedicalInformation.treatedAtHospitalDate.HasValue)
                {
                    application.Application.vsd_cvap_treatmentdate = model.MedicalInformation.treatedAtHospitalDate;
                }

                // Setup otherTreatments, don't show if there isn't any
                if (model.MedicalInformation.otherTreatments != null)
                {
                    if (model.MedicalInformation.otherTreatments.Count() > 0)
                    {
                        Providercollection[] tempProviderCollection = model
                            .MedicalInformation.otherTreatments.Select(t => new Providercollection
                            {
                                vsd_companyname = t.providerCompany,
                                vsd_firstname = t.providerFirstName,
                                vsd_lastname = t.providerLastName,
                                vsd_phonenumber = t.providerPhoneNumber,
                                vsd_addressline1 = t.providerAddress != null ? t.providerAddress.line1 : "",
                                vsd_addressline2 = t.providerAddress != null ? t.providerAddress.line2 : "",
                                vsd_city = t.providerAddress != null ? t.providerAddress.city : "",
                                vsd_province = t.providerAddress != null ? t.providerAddress.province : "",
                                vsd_country = t.providerAddress != null ? t.providerAddress.country : "",
                                vsd_postalcode = t.providerAddress != null ? t.providerAddress.postalCode : "",
                                vsd_relationship1 = t.providerType,
                                vsd_email = !String.IsNullOrEmpty(t.providerEmail) ? t.providerEmail : "",
                                vsd_fax = !String.IsNullOrEmpty(t.providerFax) ? t.providerFax : "",
                                vsd_relationship1other = t.providerTypeText,
                            })
                            .Where(t => !string.IsNullOrEmpty(t.vsd_relationship1))
                            .ToArray();

                        AddProvidersToCollection(tempProviderCollection, application);
                    }
                }

                // Setup Representatives, if available
                if (model.AuthorizationInformation != null)
                {
                    // application.Application.vsd_authorizationsignature = model.AuthorizationInformation.signature;
                    if (
                        model.AuthorizationInformation.authorizedPerson != null
                        && model.AuthorizationInformation.authorizedPerson.Length > 0
                    )
                    {
                        Providercollection[] tempProviderCollection = model
                            .AuthorizationInformation.authorizedPerson.Select(t => new Providercollection
                            {
                                vsd_firstname = t.authorizedPersonFirstName,
                                vsd_lastname = t.authorizedPersonLastName,
                                vsd_companyname = t.authorizedPersonAgencyName,
                                vsd_phonenumber = t.authorizedPersonPhoneNumber,
                                vsd_email = t.authorizedPersonEmail,
                                vsd_addressline1 = t.authorizedPersonAgencyAddress.line1,
                                vsd_addressline2 = t.authorizedPersonAgencyAddress.line2,
                                vsd_city = t.authorizedPersonAgencyAddress.city,
                                vsd_province = t.authorizedPersonAgencyAddress.province,
                                vsd_country = t.authorizedPersonAgencyAddress.country,
                                vsd_postalcode = t.authorizedPersonAgencyAddress.postalCode,
                                vsd_relationship1 = "Authorized Person",
                                vsd_relationship2 = t.authorizedPersonRelationship,
                                vsd_relationship2other = t.authorizedPersonRelationship.Equals("Other")
                                    ? t.authorizedPersonRelationshipOther
                                    : "",
                            })
                            .ToArray();

                        AddProvidersToCollection(tempProviderCollection, application);
                    }
                }
            }

            // Add employer information to Provider collection
            if (model.EmploymentIncomeInformation != null && model.ExpenseInformation.haveLostEmploymentIncomeExpenses)
            {
                if (model.EmploymentIncomeInformation.employers.Count() > 0)
                {
                    if (!String.IsNullOrEmpty(model.EmploymentIncomeInformation.employers[0].employerName))
                    {
                        Providercollection[] tempProviderCollection = model
                            .EmploymentIncomeInformation.employers.Select(f => new Providercollection
                            {
                                vsd_companyname = f.employerName,
                                vsd_phonenumber = f.employerPhoneNumber,
                                vsd_addressline1 = f.employerAddress.line1,
                                vsd_addressline2 = f.employerAddress.line2,
                                vsd_city = f.employerAddress.city,
                                vsd_province = f.employerAddress.province,
                                vsd_postalcode = f.employerAddress.postalCode,
                                vsd_country = f.employerAddress.country,
                                vsd_firstname = f.employerFirstName,
                                vsd_lastname = f.employerLastName,
                                vsd_relationship1 = "Employer",
                                vsd_email = f.employerEmail,
                                vsd_fax = f.employerFax,
                            })
                            .ToArray();

                        AddProvidersToCollection(tempProviderCollection, application);
                    }
                }
            }

            // Add medical doctor information
            if (
                !string.IsNullOrEmpty(model.MedicalInformation.familyDoctorClinic)
                || !string.IsNullOrEmpty(model.MedicalInformation.familyDoctorFirstName)
                || !string.IsNullOrEmpty(model.MedicalInformation.familyDoctorLastName)
            )
            {
                Providercollection[] tempProviderCollection = new Providercollection[1];
                tempProviderCollection[0] = new Providercollection();
                tempProviderCollection[0].vsd_companyname = model.MedicalInformation.familyDoctorClinic;
                tempProviderCollection[0].vsd_firstname = model.MedicalInformation.familyDoctorFirstName;
                tempProviderCollection[0].vsd_lastname = model.MedicalInformation.familyDoctorLastName;
                tempProviderCollection[0].vsd_email = model.MedicalInformation.familyDoctorEmail;
                tempProviderCollection[0].vsd_phonenumber = model.MedicalInformation.familyDoctorPhoneNumber;
                tempProviderCollection[0].vsd_fax = model.MedicalInformation.familyDoctorFax;
                if (model.MedicalInformation.familyDoctorAddress != null)
                {
                    tempProviderCollection[0].vsd_addressline1 = model.MedicalInformation.familyDoctorAddress.line1;
                    tempProviderCollection[0].vsd_addressline2 = model.MedicalInformation.familyDoctorAddress.line2;
                    tempProviderCollection[0].vsd_country = model.MedicalInformation.familyDoctorAddress.country;
                    tempProviderCollection[0].vsd_province = model.MedicalInformation.familyDoctorAddress.province;
                    tempProviderCollection[0].vsd_city = model.MedicalInformation.familyDoctorAddress.city;
                    tempProviderCollection[0].vsd_postalcode = model.MedicalInformation.familyDoctorAddress.postalCode;
                }
                tempProviderCollection[0].vsd_relationship1 = "Family Doctor";

                AddProvidersToCollection(tempProviderCollection, application);
            }

            if (model.RepresentativeInformation != null)
            {
                if (model.RepresentativeInformation.representativeFirstName != null)
                {
                    if (model.RepresentativeInformation.representativeFirstName.Length > 0)
                    {
                        // Add the Representative information to the JSON sent to Dynamics
                        Providercollection[] tempProviderCollection = new Providercollection[1];
                        tempProviderCollection[0] = new Providercollection();
                        tempProviderCollection[0].vsd_phonenumber = model
                            .RepresentativeInformation
                            .representativePhoneNumber;
                        tempProviderCollection[0].vsd_alternatephonenumber = model
                            .RepresentativeInformation
                            .representativeAlternatePhoneNumber;
                        tempProviderCollection[0].vsd_preferredmethodofcontact = model
                            .RepresentativeInformation
                            .representativePreferredMethodOfContact;
                        tempProviderCollection[0].vsd_email = model.RepresentativeInformation.representativeEmail;
                        tempProviderCollection[0].vsd_firstname = model
                            .RepresentativeInformation
                            .representativeFirstName;
                        tempProviderCollection[0].vsd_middlename = model
                            .RepresentativeInformation
                            .representativeMiddleName;
                        tempProviderCollection[0].vsd_lastname = model.RepresentativeInformation.representativeLastName;
                        tempProviderCollection[0].vsd_relationship1 = model
                            .RepresentativeInformation
                            .relationshipToPerson;

                        if (model.RepresentativeInformation.representativeAddress != null)
                        {
                            tempProviderCollection[0].vsd_addressline1 = model
                                .RepresentativeInformation
                                .representativeAddress
                                .line1;
                            tempProviderCollection[0].vsd_addressline2 = model
                                .RepresentativeInformation
                                .representativeAddress
                                .line2;
                            tempProviderCollection[0].vsd_country = model
                                .RepresentativeInformation
                                .representativeAddress
                                .country;
                            tempProviderCollection[0].vsd_province = model
                                .RepresentativeInformation
                                .representativeAddress
                                .province;
                            tempProviderCollection[0].vsd_city = model
                                .RepresentativeInformation
                                .representativeAddress
                                .city;
                            tempProviderCollection[0].vsd_postalcode = model
                                .RepresentativeInformation
                                .representativeAddress
                                .postalCode;
                        }

                        AddProvidersToCollection(tempProviderCollection, application);
                    }
                }
            }

            if (model.ExpenseInformation != null)
            {
                // Build Expenses CSV String
                string tempExpenses = "";
                if (model.ExpenseInformation.haveMedicalExpenses)
                {
                    tempExpenses = tempExpenses + "100000000,";
                }
                if (model.ExpenseInformation.haveDentalExpenses)
                {
                    tempExpenses = tempExpenses + "100000001,";
                }
                if (model.ExpenseInformation.havePrescriptionDrugExpenses)
                {
                    tempExpenses = tempExpenses + "100000002,";
                }
                if (model.ExpenseInformation.haveCounsellingExpenses)
                {
                    tempExpenses = tempExpenses + "100000003,";
                }
                if (model.ExpenseInformation.haveCounsellingTransportation)
                {
                    tempExpenses = tempExpenses + "100000025,";
                }
                if (model.ExpenseInformation.haveLostEmploymentIncomeExpenses)
                {
                    tempExpenses = tempExpenses + "100000004,";
                }
                if (model.ExpenseInformation.havePersonalPropertyLostExpenses)
                {
                    tempExpenses = tempExpenses + "100000005,";
                }
                if (model.ExpenseInformation.haveProtectiveMeasureExpenses)
                {
                    tempExpenses = tempExpenses + "100000006,";
                }
                if (model.ExpenseInformation.haveMovingExpenses)
                {
                    tempExpenses = tempExpenses + "100000018,";
                }
                if (model.ExpenseInformation.haveProtectiveMovingExpenses)
                {
                    tempExpenses = tempExpenses + "100000023,";
                }
                if (model.ExpenseInformation.haveTransportationToObtainBenefits)
                {
                    tempExpenses = tempExpenses + "100000024,";
                }
                if (model.ExpenseInformation.haveDisabilityExpenses)
                {
                    tempExpenses = tempExpenses + "100000007,";
                }
                if (model.ExpenseInformation.haveCrimeSceneCleaningExpenses)
                {
                    tempExpenses = tempExpenses + "100000008,";
                }
                if (model.ExpenseInformation.haveOtherExpenses)
                {
                    tempExpenses = tempExpenses + "100000009,";
                }
                //Additional Benefits
                if (model.ExpenseInformation.haveVocationalServicesExpenses)
                {
                    tempExpenses = tempExpenses + "100000011,";
                }
                if (model.ExpenseInformation.haveIncomeSupportExpenses)
                {
                    tempExpenses = tempExpenses + "100000010,";
                }
                if (model.ExpenseInformation.haveChildcareExpenses)
                {
                    tempExpenses = tempExpenses + "100000013,";
                }
                if (model.ExpenseInformation.haveLegalProceedingExpenses)
                {
                    tempExpenses = tempExpenses + "100000026,";
                }
                if (model.ExpenseInformation.haveFuneralExpenses)
                {
                    tempExpenses = tempExpenses + "100000020,";
                }
                if (model.ExpenseInformation.haveBereavementLeaveExpenses)
                {
                    tempExpenses = tempExpenses + "100000021,";
                }
                if (model.ExpenseInformation.haveLostOfParentalGuidanceExpenses)
                {
                    tempExpenses = tempExpenses + "100000022,";
                }
                if (model.ExpenseInformation.haveHomeMakerExpenses)
                {
                    tempExpenses = tempExpenses + "100000014,";
                }

                if (tempExpenses.Length > 0)
                {
                    tempExpenses = tempExpenses.Substring(0, tempExpenses.Length - 1);
                    application.Application.vsd_cvap_benefitsrequested = tempExpenses;
                }
                application.Application.vsd_cvap_benefitsrequestedother = model
                    .ExpenseInformation
                    .otherSpecificExpenses;
                application.Application.vsd_cvap_benefitsrequesteddescription = model
                    .ExpenseInformation
                    .additionalBenefitsDetails;

                // Build Benefits CSV String
                string tempBenefits = "";
                if (model.ExpenseInformation.haveLifeInsuranceBenefits)
                {
                    tempBenefits = tempBenefits + "100000007,";
                }
                if (model.ExpenseInformation.haveDisabilityPlanBenefits)
                {
                    tempBenefits = tempBenefits + "100000000,";
                }
                if (model.ExpenseInformation.haveEmploymentInsuranceBenefits)
                {
                    tempBenefits = tempBenefits + "100000001,";
                }
                if (model.ExpenseInformation.haveIncomeAssistanceBenefits)
                {
                    tempBenefits = tempBenefits + "100000002,";
                }
                if (model.ExpenseInformation.haveCanadaPensionPlanBenefits)
                {
                    tempBenefits = tempBenefits + "100000003,";
                }
                if (model.ExpenseInformation.haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits)
                {
                    tempBenefits = tempBenefits + "100000004,";
                }
                if (model.ExpenseInformation.haveCivilActionBenefits)
                {
                    tempBenefits = tempBenefits + "100000005,";
                }
                if (model.ExpenseInformation.haveOtherBenefits)
                {
                    tempBenefits = tempBenefits + "100000006,";
                }
                if (tempBenefits.Length > 0)
                {
                    tempBenefits = tempBenefits.Substring(0, tempBenefits.Length - 1);
                    application.Application.vsd_cvap_otherbenefits = tempBenefits;
                }
                application.Application.vsd_cvap_otherbenefitsother = model.ExpenseInformation.otherSpecificBenefits;
            }

            //handling for IFM form - it collects income loss information on the expense information
            if (
                application.Application.vsd_applicanttype == (int)ApplicationType.ImmediateFamilyMember
                && model.CrimeInformation.victimDeceasedFromCrime == 100000001
            )
            {
                application.Application.vsd_cvap_ifmmissedwork = model.ExpenseInformation.missedWorkDueToDeathOfVictim;
                application.Application.vsd_cvap_ifmmissedworkstart = model.ExpenseInformation.daysWorkMissedStart;
                application.Application.vsd_cvap_ifmmissedworkend = model.ExpenseInformation.daysWorkMissedEnd;

                application.Application.vsd_cvap_ifmlostwages = model.ExpenseInformation.didYouLoseWages;
                application.Application.vsd_cvap_ifmcontactemployer = model.ExpenseInformation.mayContactEmployer;

                if (model.ExpenseInformation.employers.Count() > 0)
                {
                    if (!String.IsNullOrEmpty(model.ExpenseInformation.employers[0].employerName))
                    {
                        Providercollection[] tempProviderCollection = model
                            .ExpenseInformation.employers.Select(f => new Providercollection
                            {
                                vsd_companyname = f.employerName,
                                vsd_phonenumber = f.employerPhoneNumber,
                                vsd_addressline1 = f.employerAddress.line1,
                                vsd_addressline2 = f.employerAddress.line2,
                                vsd_city = f.employerAddress.city,
                                vsd_province = f.employerAddress.province,
                                vsd_postalcode = f.employerAddress.postalCode,
                                vsd_country = f.employerAddress.country,
                                vsd_firstname = f.employerFirstName,
                                vsd_lastname = f.employerLastName,
                                vsd_relationship1 = "Employer",
                                vsd_email = f.employerEmail,
                                vsd_fax = f.employerFax,
                            })
                            .ToArray();

                        AddProvidersToCollection(tempProviderCollection, application);
                    }
                }
            }

            //handling for VICTIM form - it collects income loss information on the employment income information
            if (model.EmploymentIncomeInformation != null && model.ExpenseInformation.haveLostEmploymentIncomeExpenses)
            {
                if (model.EmploymentIncomeInformation.wereYouEmployedAtTimeOfCrime.HasValue)
                {
                    application.Application.vsd_cvap_ifmemployedduringcrime = model
                        .EmploymentIncomeInformation
                        .wereYouEmployedAtTimeOfCrime;
                }
                application.Application.vsd_cvap_ifmatworkduringcrime = model
                    .EmploymentIncomeInformation
                    .wereYouAtWorkAtTimeOfIncident;
                application.Application.vsd_cvap_ifmwcbclaimnumber = model
                    .EmploymentIncomeInformation
                    .workersCompensationClaimNumber;
                application.Application.vsd_cvap_ifmmissedwork = model
                    .EmploymentIncomeInformation
                    .didYouMissWorkDueToCrime;
                if (model.EmploymentIncomeInformation.daysWorkMissedStart.HasValue)
                {
                    application.Application.vsd_cvap_ifmmissedworkstart = model
                        .EmploymentIncomeInformation
                        .daysWorkMissedStart;
                }
                if (model.EmploymentIncomeInformation.daysWorkMissedEnd.HasValue)
                {
                    application.Application.vsd_cvap_ifmmissedworkend = model
                        .EmploymentIncomeInformation
                        .daysWorkMissedEnd;
                }

                if (model.EmploymentIncomeInformation.areYouStillOffWork.HasValue)
                {
                    application.Application.vsd_cvap_ifmareyoustilloffwork = model
                        .EmploymentIncomeInformation
                        .areYouStillOffWork;
                }
                application.Application.vsd_cvap_ifmlostwages = model.EmploymentIncomeInformation.didYouLoseWages;
                if (model.EmploymentIncomeInformation.areYouSelfEmployed > 0)
                {
                    application.Application.vsd_cvap_ifmselfemployed = model
                        .EmploymentIncomeInformation
                        .areYouSelfEmployed;
                }
                application.Application.vsd_cvap_ifmcontactemployer = model
                    .EmploymentIncomeInformation
                    .mayContactEmployer;
            }

            if (model.RepresentativeInformation != null)
            {
                application.Application.vsd_cvap_onbehalfofdeclaration = model
                    .RepresentativeInformation
                    .completingOnBehalfOf;
            }

            if (model.AuthorizationInformation != null)
            {
                application.Application.vsd_cvap_onbehalfofdeclaration = model
                    .RepresentativeInformation
                    .completingOnBehalfOf;
                application.Application.vsd_authorizationsignature = model.AuthorizationInformation.signature;
            }

            if (
                model.RepresentativeInformation?.completingOnBehalfOf == (int)OnBehalfOfEnum.LegalRepGuardian
                && model.RepresentativeInformation?.relationshipToPerson
                    == "Third party applying on behalf of an incapable adult"
            )
            {
                application.Application.vsd_cvap_onbehalfofdeclaration = (int)OnBehalfOfEnum.ThirdParty;
            }

            if (model.DeclarationInformation != null)
            {
                application.Application.vsd_applicantssignature = model.DeclarationInformation.signature;
            }

            if (model.AuthorizationInformation.allowCvapStaffSharing > 0)
            {
                application.Application.vsd_cvap_optionalauthorization = model
                    .AuthorizationInformation
                    .allowCvapStaffSharing;
            }
            application.Application.vsd_optionalauthorizationsignature = model
                .AuthorizationInformation
                .authorizedPersonSignature;

            return application;
        }

        private static void AddProvidersToCollection(
            Providercollection[] providers,
            ApplicationDynamicsModel application
        )
        {
            foreach (Providercollection provider in providers)
            {
                //postal code formatting - if it is a Canadian postal code of expected length
                if (
                    !String.IsNullOrEmpty(provider.vsd_country)
                    && provider.vsd_country.Equals("Canada")
                    && !String.IsNullOrEmpty(provider.vsd_postalcode)
                )
                {
                    provider.vsd_postalcode = provider.vsd_postalcode.ToUpper();
                    if (provider.vsd_postalcode.Length == 6)
                    {
                        provider.vsd_postalcode =
                            provider.vsd_postalcode.Substring(0, 3) + " " + provider.vsd_postalcode.Substring(3);
                    }
                }
            }

            int tempProviderCount = 0;
            if (application.ProviderCollection == null)
            {
                tempProviderCount = 0;
            }
            else
            {
                tempProviderCount = application.ProviderCollection.Count();
            }
            Providercollection[] tempCombinedCollection = new Providercollection[tempProviderCount + providers.Count()];
            if (application.ProviderCollection == null)
            {
                tempCombinedCollection = providers;
            }
            else
            {
                Array.Copy(application.ProviderCollection, tempCombinedCollection, tempProviderCount);
            }
            Array.Copy(providers, 0, tempCombinedCollection, tempProviderCount, providers.Count());
            if (tempCombinedCollection.Length > 0)
            {
                application.ProviderCollection = tempCombinedCollection;
            }
        }

        public static ApplicationFormModel ToApplicationFormModel(this ApplicationDynamicsModel dynamics)
        {
            if (dynamics == null)
                return null;

            var app = dynamics.Application;

            var model = new ApplicationFormModel
            {
                ApplicationDate = DateTime.Now, // or derive from Dynamics if available
                PersonalInformation = MapPersonalInformation(app),
                MedicalInformation = MapToMedicalInformation(app, dynamics.ProviderCollection),
                CrimeInformation = MapCrimeInformation(
                    app,
                    dynamics.CourtInfoCollection,
                    dynamics.PoliceFileNumberCollection,
                    dynamics.ProviderCollection
                ),
                RepresentativeInformation = MapRepresentativeInformation(app, dynamics.ProviderCollection),
                DeclarationInformation = MapDeclarationInformation(app),
                AuthorizationInformation = MapAuthorizationInformation(app, dynamics.ProviderCollection),
                VictimInformation = MapVictimInformation(app),
                ExpenseInformation = MapToExpenseInformation(app),
                EmploymentIncomeInformation = MapEmploymentIncomeInformation(app, dynamics.ProviderCollection),

                // Add other sections here as needed
            };

            return model;
        }

        private static Employmentincomeinformation MapEmploymentIncomeInformation(
            Application app,
            Providercollection[] providercollection
        )
        {
            var employers = providercollection?.Where(p => p.vsd_relationship1 == "Employer");
            return new Employmentincomeinformation
            {
                wereYouEmployedAtTimeOfCrime = app.vsd_cvap_ifmemployedduringcrime,
                wereYouAtWorkAtTimeOfIncident = app.vsd_cvap_ifmatworkduringcrime,
                //haveYouAppliedForWorkersCompensation
                workersCompensationClaimNumber = app.vsd_cvap_ifmwcbclaimnumber,
                didYouMissWorkDueToCrime = app.vsd_cvap_ifmmissedwork,
                daysWorkMissedStart = app.vsd_cvap_ifmmissedworkstart,
                daysWorkMissedEnd = app.vsd_cvap_ifmmissedworkend,
                areYouStillOffWork = app.vsd_cvap_ifmareyoustilloffwork,
                didYouLoseWages = app.vsd_cvap_ifmlostwages,
                areYouSelfEmployed = app.vsd_cvap_ifmselfemployed,

                mayContactEmployer = app.vsd_cvap_ifmcontactemployer,
                employers = employers
                    .Select(f => new Employer
                    {
                        employerName = f.vsd_companyname,
                        employerPhoneNumber = f.vsd_phonenumber,
                        employerFirstName = f.vsd_firstname,
                        employerLastName = f.vsd_lastname,
                        employerEmail = f.vsd_email,
                        employerFax = f.vsd_fax,
                        employerAddress = new VSDAddress
                        {
                            line1 = f?.vsd_addressline1,
                            line2 = f.vsd_addressline2,
                            city = f.vsd_city,
                            province = f.vsd_province,
                            country = f.vsd_country,
                            postalCode = f.vsd_postalcode,
                        },
                    })
                    .ToArray(),
            };
        }

        private static Personalinformation MapPersonalInformation(Application app)
        {
            if (app == null)
                return null;

            return new Personalinformation
            {
                firstName = app.vsd_applicantsfirstname,
                middleName = app.vsd_applicantsmiddlename,
                lastName = app.vsd_applicantslastname,
                otherFirstName = app.vsd_otherfirstname,
                otherLastName = app.vsd_otherlastname,
                dateOfNameChange = app.vsd_dateofnamechange,
                relationshipToVictim = app.vsd_cvap_relationshiptovictim,
                relationshipToVictimOther = app.vsd_relationshipother1,
                gender = app.vsd_applicantsgendercode,
                birthDate = app.vsd_applicantsbirthdate,
                maritalStatus = app.vsd_applicantsmaritalstatus,
                occupation = app.vsd_applicantsoccupation,
                sin = app.vsd_applicantssocialinsurancenumber,
                indigenousStatus = app.vsd_indigenous,
                preferredMethodOfContact = app.vsd_applicantspreferredmethodofcontact,
                leaveVoicemail = app.vsd_voicemailoption,
                phoneNumber = app.vsd_applicantsprimaryphonenumber,
                alternatePhoneNumber = app.vsd_applicantsalternatephonenumber,
                email = app.vsd_applicantsemail,
                primaryAddress = new VSDAddress
                {
                    line1 = app.vsd_applicantsprimaryaddressline1,
                    line2 = app.vsd_applicantsprimaryaddressline2,
                    city = app.vsd_applicantsprimarycity,
                    province = app.vsd_applicantsprimaryprovince,
                    postalCode = app.vsd_applicantsprimarypostalcode,
                    country = app.vsd_applicantsprimarycountry,
                },
                alternateAddress = new VSDAddress
                {
                    line1 = app.vsd_applicantsalternateaddressline1,
                    line2 = app.vsd_applicantsalternateaddressline2,
                    city = app.vsd_applicantsalternatecity,
                    province = app.vsd_applicantsalternateprovince,
                    postalCode = app.vsd_applicantsalternatepostalcode,
                    country = app.vsd_applicantsalternatecountry,
                },
            };
        }

        private static Crimeinformation MapCrimeInformation(
            Application app,
            Courtinfocollection[] courts,
            Policefilenumbercollection[] policeFiles,
            Providercollection[] providercollection
        )
        {
            if (app == null)
                return null;

            var n = courts.Length;

            var offender = providercollection.FirstOrDefault(p => p.vsd_relationship1 == "Accused");

            return new Crimeinformation
            {
                typeOfCrime = app.vsd_cvap_typeofcrime,
                unsureOfCrimeDates = app.vsd_cvap_unsureofspecificcrimedates,
                crimePeriodStart = app.vsd_cvap_crimestartdate,
                crimePeriodEnd = app.vsd_cvap_crimeenddate,
                whyDidYouNotApplySooner = app.vsd_cvap_reasontoapplylate,
                crimeDetails = app.vsd_cvap_crimedetails,
                crimeInjuries = app.vsd_cvap_injuries,
                wasReportMadeToPolice = app.vsd_cvap_reporttopolice,
                victimDeceasedFromCrime = app.vsd_cvap_victimdeceased,
                dateOfDeath = app.vsd_cvap_victimdateofdeath,
                offenderFirstName = offender?.vsd_firstname,
                offenderLastName = offender?.vsd_lastname,
                offenderMiddleName = offender?.vsd_middlename,
                offenderRelationship = offender?.vsd_relationship2,
                haveYouSuedOffender = app.vsd_cvap_isoffendersued ?? 0,
                intendToSueOffender = app.vsd_cvap_intentiontosueoffender,
                overOneYearFromCrime = app.vsd_cvap_overoneyear,
                noPoliceReportIdentification = app.vsd_cvap_crimereportedto,
                offenderBeenCharged = app.vsd_cvap_isoffendercharged,
                racafInformation = new Racafinformation
                {
                    applyToCourtForMoneyFromOffender = app.vsd_racaf_appliedforrestitution,
                    expensesRequested = app.vsd_racaf_requestedexpenses,
                    expensesAwarded = app.vsd_racaf_expensesawarded?.ToString(),
                    expensesReceived = app.vsd_racaf_amountreceived?.ToString(),
                    signName = app.vsd_racaf_fullname,
                    signature = app.vsd_racaf_signature,
                    willBeTakingLegalAction = app.vsd_racaf_legalactiontaken,
                    lawyerOrFirmName = app.vsd_racaf_lawyerorfirmname,
                    lawyerAddress = new VSDAddress
                    {
                        line1 = app.vsd_racaf_lawyeraddressline1,
                        line2 = app.vsd_racaf_lawyeraddressline2,
                        city = app.vsd_racaf_lawyercity,
                        postalCode = app.vsd_racaf_lawyerpostalcode,
                        province = app.vsd_racaf_lawyerprovince,
                        country = app.vsd_racaf_lawyercountry,
                    },
                },
                // Map police and court arrays if provided
                courtFiles = courts
                    ?.Select(c => new VSDCourtfile
                    {
                        courtFileNumber = c.vsd_courtfilenumber,
                        courtLocation = c.vsd_courtlocation,
                    })
                    .ToArray(),
                policeReports = policeFiles
                    ?.Select(p => new Policereport
                    {
                        policeFileNumber = p.vsd_policefilenumber,
                        reportStartDate = p.vsd_policereportingstartdate,
                        reportEndDate = p.vsd_policereportingenddate,
                        investigatingOfficer = p.vsd_investigatingpoliceofficername,
                    })
                    .ToArray(),
            };
        }

        private static Representativeinformation MapRepresentativeInformation(
            Application app,
            Providercollection[] providers
        )
        {
            if (providers == null || providers.Length == 0)
                return null;

            var first = providers.Last();

            return new Representativeinformation
            {
                representativeFirstName = first.vsd_firstname,
                representativeLastName = first.vsd_lastname,
                representativeMiddleName = first.vsd_middlename,
                representativePreferredMethodOfContact = first.vsd_preferredmethodofcontact,
                representativeAlternatePhoneNumber = first.vsd_alternatephonenumber,
                representativeEmail = first.vsd_email,
                representativePhoneNumber = first.vsd_phonenumber,
                relationshipToPerson = first.vsd_relationship1,
                completingOnBehalfOf = app.vsd_cvap_onbehalfofdeclaration,
                representativeAddress = new VSDAddress
                {
                    line1 = first.vsd_addressline1,
                    city = first.vsd_city,
                    postalCode = first.vsd_postalcode,
                    province = first.vsd_province,
                    country = first.vsd_country,
                },
            };
        }

        private static Declarationinformation MapDeclarationInformation(Application app) =>
            new Declarationinformation
            {
                declaredAndSigned = app.vsd_racaf_signature,
                signature = app.vsd_racaf_signature,
            };

        private static Authorizationinformation MapAuthorizationInformation(
            Application app,
            Providercollection[] providercollection
        )
        {
            var authorizedPerson = providercollection.Where(p => p.vsd_relationship1 == "Authorized Person");

            return new Authorizationinformation
            {
                signature = app.vsd_authorizationsignature,
                authorizedPerson = authorizedPerson
                    .Select(p => new AuthorizedPerson
                    {
                        authorizedPersonFirstName = p.vsd_firstname,
                        authorizedPersonLastName = p.vsd_lastname,
                        authorizedPersonAgencyName = p.vsd_companyname,
                        authorizedPersonPhoneNumber = p.vsd_phonenumber,
                        authorizedPersonEmail = p.vsd_email,
                        authorizedPersonAgencyAddress = new VSDAddress
                        {
                            line1 = p.vsd_addressline1,
                            line2 = p.vsd_addressline2,
                            city = p.vsd_city,
                            province = p.vsd_province,
                            country = p.vsd_country,
                            postalCode = p.vsd_postalcode,
                        },
                        authorizedPersonRelationship = p.vsd_relationship2,
                        authorizedPersonRelationshipOther =
                            p.vsd_relationship2 == "Other" ? p.vsd_relationship2other : null,
                    })
                    .ToArray(),
            };
        }

        private static VictimInformation MapVictimInformation(Application app)
        {
            if (app == null)
                return null;

            return new VictimInformation
            {
                firstName = app.vsd_cvap_victimfirstname,
                middleName = app.vsd_cvap_victimmiddlename,
                lastName = app.vsd_cvap_victimlastname,
                birthDate = app.vsd_cvap_victimbirthdate,
                gender = app.vsd_cvap_victimgendercode,
                maritalStatus = app.vsd_cvap_victimmaritalstatus,
                sin = app.vsd_cvap_victimsocialinsurancenumber,
                occupation = app.vsd_cvap_victimoccupation,
                phoneNumber = app.vsd_cvap_victimprimaryphonenumber,
                alternatePhoneNumber = app.vsd_cvap_victimalternatephonenumber,
                email = app.vsd_cvap_victimemailaddress,
                primaryAddress = new VSDAddress
                {
                    line1 = app.vsd_cvap_victimaddressline1,
                    line2 = app.vsd_cvap_victimaddressline2,
                    city = app.vsd_cvap_victimcity,
                    postalCode = app.vsd_cvap_victimpostalcode,
                    province = app.vsd_cvap_victimprovince,
                    country = app.vsd_cvap_victimcountry,
                },
            };
        }

        private static Medicalinformation MapToMedicalInformation(
            Application application,
            Providercollection[] providercollection
        )
        {
            if (application == null)
                return null;

            var familyDoctor = providercollection?.FirstOrDefault(p => p.vsd_relationship1 == "Family Doctor");

            var modelMedical = new Medicalinformation
            {
                personalHealthNumber = application.vsd_applicantspersonalhealthnumber,
                haveMedicalCoverageProvince = application.vsd_applicantsmspprovince,
                haveMedicalCoverageProvinceOther = application.vsd_applicantsmspprovinceother,
                doYouHaveOtherHealthCoverage = application.vsd_cvap_otherhealthcoverage,
                otherHealthCoverageProviderName = application.vsd_applicantsextendedhealthprovidername,
                otherHealthCoverageExtendedPlanNumber = application.vsd_applicantsextendedhealthnumber,
                treatedAtHospitalName = application.vsd_cvap_treatmenthospitalname,
                treatedAtHospitalDate = application.vsd_cvap_treatmentdate,
                familyDoctorClinic = familyDoctor?.vsd_companyname,
                familyDoctorFirstName = familyDoctor?.vsd_firstname,
                familyDoctorLastName = familyDoctor?.vsd_lastname,
                familyDoctorEmail = familyDoctor?.vsd_email,
                familyDoctorPhoneNumber = familyDoctor?.vsd_phonenumber,
                familyDoctorFax = familyDoctor?.vsd_fax,
                familyDoctorAddress = new VSDAddress
                {
                    line1 = familyDoctor?.vsd_addressline1,
                    line2 = familyDoctor?.vsd_addressline2,
                    city = familyDoctor?.vsd_city,
                    province = familyDoctor?.vsd_province,
                    country = familyDoctor?.vsd_country,
                    postalCode = familyDoctor?.vsd_postalcode,
                },
            };

            // Check if hospital name indicates it was outside BC (optional)
            if (
                !string.IsNullOrEmpty(application.vsd_cvap_treatmenthospitalname)
                && application.vsd_cvap_treatmenthospitalname == application.vsd_cvap_treatmenthospitalname
            ) // adjust your condition if needed
            {
                modelMedical.treatedOutsideBcHospitalName = application.vsd_cvap_treatmenthospitalname;
                modelMedical.treatedOutsideBc = true;
            }

            if (providercollection != null && providercollection.Any())
            {
                modelMedical.otherTreatments = providercollection
                    .Where(p => p.vsd_relationship1 == "Counsellor")
                    .Select(p => new Othertreatment
                    {
                        providerCompany = p.vsd_companyname,
                        providerFirstName = p.vsd_firstname,
                        providerLastName = p.vsd_lastname,
                        providerPhoneNumber = p.vsd_phonenumber,
                        providerFax = p.vsd_fax,
                        providerEmail = p.vsd_email,
                        providerType = p.vsd_relationship1,
                        providerTypeText = p.vsd_relationship1other,
                        providerAddress = new VSDAddress
                        {
                            line1 = p.vsd_addressline1,
                            line2 = p.vsd_addressline2,
                            city = p.vsd_city,
                            province = p.vsd_province,
                            country = p.vsd_country,
                            postalCode = p.vsd_postalcode,
                        },
                    })
                    .ToArray();
            }

            return modelMedical;
        }

        private static Expenseinformation MapToExpenseInformation(Application application)
        {
            if (application == null || string.IsNullOrEmpty(application.vsd_cvap_benefitsrequested))
                return new Expenseinformation(); // empty model

            var expenseInfo = new Expenseinformation();
            var codes = application.vsd_cvap_benefitsrequested?.Split(',', StringSplitOptions.RemoveEmptyEntries);
            var otherCodes = application.vsd_cvap_otherbenefits?.Split(',', StringSplitOptions.RemoveEmptyEntries);

            foreach (var code in codes)
            {
                switch (code.Trim())
                {
                    case "100000000":
                        expenseInfo.haveMedicalExpenses = true;
                        break;
                    case "100000001":
                        expenseInfo.haveDentalExpenses = true;
                        break;
                    case "100000002":
                        expenseInfo.havePrescriptionDrugExpenses = true;
                        break;
                    case "100000003":
                        expenseInfo.haveCounsellingExpenses = true;
                        break;
                    case "100000025":
                        expenseInfo.haveCounsellingTransportation = true;
                        break;
                    case "100000004":
                        expenseInfo.haveLostEmploymentIncomeExpenses = true;
                        break;
                    case "100000005":
                        expenseInfo.havePersonalPropertyLostExpenses = true;
                        break;
                    case "100000006":
                        expenseInfo.haveProtectiveMeasureExpenses = true;
                        break;
                    case "100000018":
                        expenseInfo.haveMovingExpenses = true;
                        break;
                    case "100000023":
                        expenseInfo.haveProtectiveMovingExpenses = true;
                        break;
                    case "100000024":
                        expenseInfo.haveTransportationToObtainBenefits = true;
                        break;
                    case "100000007":
                        expenseInfo.haveDisabilityExpenses = true;
                        break;
                    case "100000008":
                        expenseInfo.haveCrimeSceneCleaningExpenses = true;
                        break;
                    case "100000009":
                        expenseInfo.haveOtherExpenses = true;
                        break;

                    case "100000011":
                        expenseInfo.haveVocationalServicesExpenses = true;
                        break;
                    case "100000010":
                        expenseInfo.haveIncomeSupportExpenses = true;
                        break;
                    case "100000013":
                        expenseInfo.haveChildcareExpenses = true;
                        break;
                    case "100000026":
                        expenseInfo.haveLegalProceedingExpenses = true;
                        break;
                    case "100000020":
                        expenseInfo.haveFuneralExpenses = true;
                        break;
                    case "100000021":
                        expenseInfo.haveBereavementLeaveExpenses = true;
                        break;
                    case "100000022":
                        expenseInfo.haveLostOfParentalGuidanceExpenses = true;
                        break;
                    case "100000014":
                        expenseInfo.haveHomeMakerExpenses = true;
                        break;
                }
            }
            if (otherCodes != null)
            {
                foreach (var othercode in otherCodes)
                {
                    switch (othercode.Trim())
                    {
                        case "100000007":
                            expenseInfo.haveLifeInsuranceBenefits = true;
                            break;
                        case "100000000":
                            expenseInfo.haveDisabilityPlanBenefits = true;
                            break;
                        case "100000001":
                            expenseInfo.haveEmploymentInsuranceBenefits = true;
                            break;
                        case "100000002":
                            expenseInfo.haveIncomeAssistanceBenefits = true;
                            break;
                        case "100000003":
                            expenseInfo.haveCanadaPensionPlanBenefits = true;
                            break;
                        case "100000004":
                            expenseInfo.haveAboriginalAffairsAndNorthernDevelopmentCanadaBenefits = true;
                            break;
                        case "100000005":
                            expenseInfo.haveCivilActionBenefits = true;
                            break;
                        case "100000006":
                            expenseInfo.haveOtherBenefits = true;
                            break;
                    }
                }
            }

            return expenseInfo;
        }
    }
}
