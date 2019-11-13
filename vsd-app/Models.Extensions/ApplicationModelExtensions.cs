using System;
using System.Collections.Generic;
using System.Linq;
using Gov.Cscp.VictimServices.Public.JsonObjects;
using Gov.Cscp.VictimServices.Public.ViewModels;
using Gov.Cscp.VictimServices.Public.Infrastructure;

namespace Gov.Cscp.VictimServices.Public.Models.Extensions
{
    public static class ApplicationModelExtensions
    {
        public static ApplicationDynamicsModel ToVsdVictimsModel(this ApplicationFormModel model)
        {
            var application = GetApplicationDefaults();
            application.Application.vsd_applicanttype = (int)ApplicationType.Victim;

            if (model == null)
                return null;

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

                application.Application.vsd_applicantsgendercode = model.PersonalInformation.gender;
                if (model.PersonalInformation.birthDate.HasValue)
                {
                    application.Application.vsd_applicantsbirthdate = model.PersonalInformation.birthDate.Value;
                }
                application.Application.vsd_applicantsmaritalstatus = model.PersonalInformation.maritalStatus;

                application.Application.vsd_applicantsoccupation = model.PersonalInformation.occupation;
                application.Application.vsd_applicantssocialinsurancenumber = model.PersonalInformation.sin;

                // what format does dynamics expect in the JSON?
                // currently the Dynamics UI only allows a 10-digit number and uses some fancy input masking to include the parens and hyphens 
                // Form side should mimic the fancy javascript input masking from the Dynamics UI, and probably just represent it as a pure 10 digit number behind the scenes and in the JSON
                // Ideally the whole thing would support international numbers and use the E.164 standard for behind-the-scenes representation
                // (see https://www.sitepoint.com/working-phone-numbers-javascript/ for inspiration)
                // but for now we should only support whatever the Dynamics UI supports - no sense adding extra features that can't be used because of the Dynamics side
                application.Application.vsd_applicantsprimaryphonenumber = model.PersonalInformation.phoneNumber;
                application.Application.vsd_applicantsalternatephonenumber = model.PersonalInformation.alternatePhoneNumber;
                application.Application.vsd_applicantsemail = model.PersonalInformation.email;
                application.Application.vsd_applicantspreferredmethodofcontact = model.PersonalInformation.preferredMethodOfContact;

                if (model.PersonalInformation.primaryAddress != null)
                {
                    application.Application.vsd_applicantsprimaryaddressline1 = model.PersonalInformation.primaryAddress.line1;
                    application.Application.vsd_applicantsprimaryaddressline2 = model.PersonalInformation.primaryAddress.line2;
                    application.Application.vsd_applicantsprimarycity = model.PersonalInformation.primaryAddress.city;
                    application.Application.vsd_applicantsprimaryprovince = model.PersonalInformation.primaryAddress.province;
                    application.Application.vsd_applicantsprimarycountry = model.PersonalInformation.primaryAddress.country;
                    application.Application.vsd_applicantsprimarypostalcode = model.PersonalInformation.primaryAddress.postalCode;
                }

                if (model.PersonalInformation.alternateAddress != null)
                {
                    application.Application.vsd_applicantsalternateaddressline1 = model.PersonalInformation.alternateAddress.line1;
                    application.Application.vsd_applicantsalternateaddressline2 = model.PersonalInformation.alternateAddress.line2;
                    application.Application.vsd_applicantsalternatecity = model.PersonalInformation.alternateAddress.city;
                    application.Application.vsd_applicantsalternateprovince = model.PersonalInformation.alternateAddress.province;
                    application.Application.vsd_applicantsalternatecountry = model.PersonalInformation.alternateAddress.country;
                    application.Application.vsd_applicantsalternatepostalcode = model.PersonalInformation.alternateAddress.postalCode;
                }
            }

            if (model.CrimeInformation != null)
            {
                application.Application.vsd_cvap_typeofcrime = model.CrimeInformation.typeOfCrime;
                if (model.CrimeInformation.crimePeriodStart.HasValue)
                {
                    application.Application.vsd_cvap_crimestartdate = model.CrimeInformation.crimePeriodStart;
                }
                if (model.CrimeInformation.crimePeriodEnd.HasValue)
                {
                    application.Application.vsd_cvap_crimeenddate = model.CrimeInformation.crimePeriodEnd;
                }
                application.Application.vsd_cvap_reasontoapplylate = model.CrimeInformation.whyDidYouNotApplySooner; // TODO: Verify mapping - I think it's right but just different names

                // Add Crime Locations as an array separated by line feeds
                if (model.CrimeInformation.crimeLocations.Count() > 0)
                {
                    string tempOutput = "";
                    foreach(Crimelocation tempCrimeLocation in model.CrimeInformation.crimeLocations)
                        {
                        tempOutput = tempOutput + tempCrimeLocation.location + "\r\n";
                    }
                    application.Application.vsd_cvap_crimelocations = tempOutput.Substring(0, tempOutput.Length - 2);
                }

                application.Application.vsd_cvap_crimedetails = model.CrimeInformation.crimeDetails;
                application.Application.vsd_cvap_injuries = model.CrimeInformation.crimeInjuries;

                // Include upload file
                try
                {
                    if (model.CrimeInformation.additionalInformationFiles != null)
                    {
                        if (model.CrimeInformation.additionalInformationFiles.fileName.Length > 0)
                        {
                            Documentcollection tempDocumentCollection = new Documentcollection();
                            tempDocumentCollection.body = model.CrimeInformation.additionalInformationFiles.body;
                            tempDocumentCollection.filename = model.CrimeInformation.additionalInformationFiles.fileName;
                            application.DocumentCollection = new Documentcollection[1];
                            application.DocumentCollection[0] = tempDocumentCollection;
                        }
                    }
                }
                catch (Exception e)
                {
                    string errormessage = e.Message;
                }

                application.Application.vsd_cvap_reportedtopolice = model.CrimeInformation.wasReportMadeToPolice;
                application.Application.vsd_cvap_policedetachment = model.CrimeInformation.policeReportedWhichPoliceForce;
                if (model.CrimeInformation.policeReportedDate.HasValue)
                {
                    application.Application.vsd_cvap_policereportingstartdate = model.CrimeInformation.policeReportedDate;
                }
                if (model.CrimeInformation.policeReportedEndDate.HasValue)
                {
                    application.Application.vsd_cvap_policereportingenddate = model.CrimeInformation.policeReportedEndDate;
                }
                application.Application.vsd_cvap_crimereportedto = model.CrimeInformation.noPoliceReportIdentification; // TODO: verify mapping - I think it's right, but different names

                // Setup policeFiles, don't show if there isn't any
                if (model.CrimeInformation.policeReports != null)
                {
                    if (model.CrimeInformation.policeReports[0].policeFileNumber.Length > 0)
                    {
                        application.PoliceFileNumberCollection = model.CrimeInformation.policeReports.Select(r => new Policefilenumbercollection
                        {
                            vsd_investigatingpoliceofficername = r.investigatingOfficer,
                            vsd_policefilenumber = r.policeFileNumber
                        }).ToArray();
                    }
                }

                application.Application.vsd_cvap_offenderfirstname = model.CrimeInformation.offenderFirstName;
                application.Application.vsd_cvap_offendermiddlename = model.CrimeInformation.offenderMiddleName;
                application.Application.vsd_cvap_offenderlastname = model.CrimeInformation.offenderLastName;

                application.Application.vsd_cvap_relationshiptooffender = model.CrimeInformation.offenderRelationship;
                application.Application.vsd_cvap_isoffendercharged = model.CrimeInformation.offenderBeenCharged;

                // Setup courtFiles, don't show if there isn't any
                if (model.CrimeInformation.courtFiles != null)
                {
                    if (model.CrimeInformation.courtFiles[0].courtFileNumber.Length > 0)
                    {
                        application.CourtInfoCollection = model.CrimeInformation.courtFiles.Select(f => new Courtinfocollection
                        {
                            vsd_courtfilenumber = f.courtFileNumber,
                            vsd_courtlocation = f.courtLocation
                        }).ToArray();
                    }
                }

                application.Application.vsd_cvap_isoffendersued = model.CrimeInformation.haveYouSuedOffender;
                application.Application.vsd_cvap_intentiontosueoffender = model.CrimeInformation.intendToSueOffender;

                if (model.CrimeInformation.racafInformation != null)
                {
                    application.Application.vsd_racaf_appliedforrestitution = model.CrimeInformation.racafInformation.applyToCourtForMoneyFromOffender; 
                    application.Application.vsd_racaf_requestedexpenses = model.CrimeInformation.racafInformation.expensesRequested;
                    application.Application.vsd_racaf_expensesawarded = model.CrimeInformation.racafInformation.expensesAwarded; 
                    application.Application.vsd_racaf_amountreceived = model.CrimeInformation.racafInformation.expensesReceived; 

                    application.Application.vsd_racaf_legalactiontaken = model.CrimeInformation.racafInformation.willBeTakingLegalAction;
                    application.Application.vsd_racaf_lawyerorfirmname = model.CrimeInformation.racafInformation.lawyerOrFirmName;
                    application.Application.vsd_racaf_lawyeraddressline1 = model.CrimeInformation.racafInformation.lawyerAddress?.line1;
                    application.Application.vsd_racaf_lawyeraddressline2 = model.CrimeInformation.racafInformation.lawyerAddress?.line2;
                    application.Application.vsd_racaf_lawyercity = model.CrimeInformation.racafInformation.lawyerAddress?.city;
                    application.Application.vsd_racaf_lawyerprovince = model.CrimeInformation.racafInformation.lawyerAddress?.province;
                    application.Application.vsd_racaf_lawyerpostalcode = model.CrimeInformation.racafInformation.lawyerAddress?.postalCode;
                    application.Application.vsd_racaf_lawyercountry = model.CrimeInformation.racafInformation.lawyerAddress?.country;

                    application.Application.vsd_racaf_signature = model.CrimeInformation.racafInformation.signature;
                }
            }

            if (model.MedicalInformation != null)
            {
                application.Application.vsd_applicantspersonalhealthnumber = model.MedicalInformation.personalHealthNumber;
                application.Application.vsd_applicantsextendedhealthprovidername = model.MedicalInformation.otherHealthCoverageProviderName; // TODO: verify mapping, "other" seems weird here
                application.Application.vsd_applicantsextendedhealthnumber = model.MedicalInformation.otherHealthCoverageExtendedPlanNumber; // TODO: verify mapping, "other" seems weird here

                application.Application.vsd_cvap_treatmenthospitalname = model.MedicalInformation.treatedAtHospitalName;
                if (model.MedicalInformation.treatedAtHospitalDate.HasValue)
                {
                    application.Application.vsd_cvap_treatmentdate = model.MedicalInformation.treatedAtHospitalDate;
                }

                // Setup otherTreatments, don't show if there isn't any
                if (model.MedicalInformation.otherTreatments != null)
                {
                    if (model.MedicalInformation.otherTreatments.Count() > 0)
                    {
                        if (model.MedicalInformation.otherTreatments[0].providerName.Length > 0)
                        {
                            application.ProviderCollection = model.MedicalInformation.otherTreatments.Select(t => new Providercollection
                            {
                                vsd_name = t.providerName,
                                vsd_phonenumber = t.providerPhoneNumber,

                                vsd_addressline1 = t.providerAddress.line1,
                                vsd_addressline2 = t.providerAddress.line2,
                                vsd_city = t.providerAddress.city,
                                vsd_province = t.providerAddress.province,
                                vsd_country = t.providerAddress.country,
                                vsd_postalcode = t.providerAddress.postalCode,
                                vsd_relationship1 = t.providerType.ToString(),
                                //    // TODO: It looks like we're using this object in two different places - confirm that we can safely ignore the following fields in this context
                                //    vsd_firstname = "", // TODO: We don't collect a split name here
                                //    vsd_middlename = "", // TODO: We don't collect a split name here
                                //    vsd_lastname = "", // TODO: We don't collect a split name here
                                //    vsd_alternatephonenumber = "", // TODO: We don't collect an alternate phone number
                                //    vsd_email = "", // TODO: We don't collect an email here
                                //    //vsd_preferredmethodofcontact = 1, // TODO: We don't collect a contact method here
                                //    //vsd_preferredmethodofcontact = model.RepresentativeInformation.representativePreferredMethodOfContact, // TODO: This isn't correct either
                                //    vsd_relationship1 = "", // TODO: We don't collect a relationship here
                            }).ToArray();
                        }
                    }
                }
            }

            // Add employer information to Provider collection
            if (model.EmploymentIncomeInformation != null)
            {
                if (model.EmploymentIncomeInformation.employers.Count() > 0)
                {
                    if (model.EmploymentIncomeInformation.employers[0].employerFirstName != null)
                    {
                        Providercollection[] tempProviderCollection;
                        tempProviderCollection = model.EmploymentIncomeInformation.employers.Select(f => new Providercollection
                        {
                            vsd_name = f.employerName,
                            vsd_phonenumber = f.employerPhoneNumber,
                            vsd_addressline1 = f.employerAddress.line1,
                            vsd_addressline2 = f.employerAddress.line2,
                            vsd_city = f.employerAddress.city,
                            vsd_province = f.employerAddress.province,
                            vsd_postalcode = f.employerAddress.postalCode,
                            vsd_country = f.employerAddress.country,
                            vsd_firstname = f.employerFirstName,
                            vsd_lastname = f.employerLastName,
                            vsd_relationship1 = "100000005", // TODO: This is just an assumption, looking for confirmation from Mano
                        }).ToArray();

                        int tempProviderCount = 0;
                        if (application.ProviderCollection == null)
                        {
                            tempProviderCount = 0;
                        }
                        else
                        {
                            tempProviderCount = application.ProviderCollection.Count();
                        }
                        Providercollection[] tempCombinedCollection = new Providercollection[tempProviderCount + tempProviderCollection.Count()];
                        if (application.ProviderCollection == null)
                        {
                            tempCombinedCollection = tempProviderCollection;
                        }
                        else
                        {
                            Array.Copy(application.ProviderCollection, tempCombinedCollection, tempProviderCount);
                        }
                        Array.Copy(tempProviderCollection, 0, tempCombinedCollection, tempProviderCount, tempProviderCollection.Count());
                        application.ProviderCollection = tempCombinedCollection;
                    }
                }
            }

            // Add medical doctor information
            if (model.MedicalInformation.familyDoctorName != null)
            {
                if (model.MedicalInformation.familyDoctorName.Length > 0) // Only do this if there is something in this field
                {
                    Providercollection[] tempProviderCollection = new Providercollection[1];
                    tempProviderCollection[0] = new Providercollection();
                    tempProviderCollection[0].vsd_name = model.MedicalInformation.familyDoctorName;
                    tempProviderCollection[0].vsd_phonenumber = model.MedicalInformation.familyDoctorPhoneNumber;
                    tempProviderCollection[0].vsd_addressline1 = model.MedicalInformation.familyDoctorAddressLine1;
                    tempProviderCollection[0].vsd_addressline2 = model.MedicalInformation.familyDoctorAddressLine2;
                    tempProviderCollection[0].vsd_relationship1 = "100000000"; // TODO: This is just an assumption, looking for confirmation from Mano

                    int tempProviderCount = 0;
                    if (application.ProviderCollection == null)
                    {
                        tempProviderCount = 0;
                    }
                    else
                    {
                        tempProviderCount = application.ProviderCollection.Count();
                    }
                    Providercollection[] tempCombinedCollection = new Providercollection[tempProviderCount + tempProviderCollection.Count()];
                    if (application.ProviderCollection == null)
                    {
                        tempCombinedCollection = tempProviderCollection;
                    }
                    else
                    {
                        Array.Copy(application.ProviderCollection, tempCombinedCollection, tempProviderCount);
                    }
                    Array.Copy(tempProviderCollection, 0, tempCombinedCollection, tempProviderCount, tempProviderCollection.Count());
                    application.ProviderCollection = tempCombinedCollection;
                }
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
                        tempProviderCollection[0].vsd_name = "On Behalf of Victim";
                        tempProviderCollection[0].vsd_phonenumber = model.RepresentativeInformation.representativePhoneNumber;
                        tempProviderCollection[0].vsd_alternatephonenumber = model.RepresentativeInformation.representativeAlternatePhoneNumber;
                        tempProviderCollection[0].vsd_addressline1 = model.RepresentativeInformation.representativeAddress.line1;
                        tempProviderCollection[0].vsd_addressline2 = model.RepresentativeInformation.representativeAddress.line2;
                        tempProviderCollection[0].vsd_country = model.RepresentativeInformation.representativeAddress.country;
                        tempProviderCollection[0].vsd_province = model.RepresentativeInformation.representativeAddress.province;
                        tempProviderCollection[0].vsd_city = model.RepresentativeInformation.representativeAddress.city;
                        tempProviderCollection[0].vsd_preferredmethodofcontact = model.RepresentativeInformation.representativePreferredMethodOfContact;
                        tempProviderCollection[0].vsd_email = model.RepresentativeInformation.representativeEmail;
                        tempProviderCollection[0].vsd_firstname = model.RepresentativeInformation.representativeFirstName;
                        tempProviderCollection[0].vsd_middlename = model.RepresentativeInformation.representativeMiddleName;
                        tempProviderCollection[0].vsd_lastname = model.RepresentativeInformation.representativeLastName;
                        tempProviderCollection[0].vsd_relationship1 = "100000000"; // TODO: This is just an assumption, looking for confirmation from Mano

                        int tempProviderCount = 0;
                        if (application.ProviderCollection == null)
                        {
                            tempProviderCount = 0;
                        }
                        else
                        {
                            tempProviderCount = application.ProviderCollection.Count();
                        }
                        Providercollection[] tempCombinedCollection = new Providercollection[tempProviderCount + tempProviderCollection.Count()];
                        if (application.ProviderCollection == null)
                        {
                            tempCombinedCollection = tempProviderCollection;
                        }
                        else
                        {
                            Array.Copy(application.ProviderCollection, tempCombinedCollection, tempProviderCount);
                        }
                        Array.Copy(tempProviderCollection, 0, tempCombinedCollection, tempProviderCount, tempProviderCollection.Count());
                        application.ProviderCollection = tempCombinedCollection;
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
                if (tempExpenses.Length > 0)
                {
                    tempExpenses = tempExpenses.Substring(0, tempExpenses.Length - 1);
                    application.Application.vsd_cvap_benefitsrequested = tempExpenses;
                }
                application.Application.vsd_cvap_benefitsrequestedother = model.ExpenseInformation.otherSpecificExpenses;

                // Build Benefits CSV String
                string tempBenefits = "";
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

            if (model.EmploymentIncomeInformation != null)
            {
                // what is with all the "ifm" stuff?
                if (model.EmploymentIncomeInformation.wereYouEmployedAtTimeOfCrime.HasValue)
                {
                    application.Application.vsd_cvap_ifmemployedduringcrime = model.EmploymentIncomeInformation.wereYouEmployedAtTimeOfCrime;
                }
                application.Application.vsd_cvap_ifmatworkduringcrime = model.EmploymentIncomeInformation.wereYouAtWorkAtTimeOfIncident;
                application.Application.vsd_cvap_ifmwcbclaimnumber = model.EmploymentIncomeInformation.workersCompensationClaimNumber;
                application.Application.vsd_cvap_ifmmissedwork = model.EmploymentIncomeInformation.didYouMissWorkDueToCrime;
                if (model.EmploymentIncomeInformation.daysWorkMissedStart.HasValue)
                {
                    application.Application.vsd_cvap_ifmmissedworkstart = model.EmploymentIncomeInformation.daysWorkMissedStart;
                }
                if (model.EmploymentIncomeInformation.daysWorkMissedEnd.HasValue)
                {
                    application.Application.vsd_cvap_ifmmissedworkend = model.EmploymentIncomeInformation.daysWorkMissedEnd;
                }
                application.Application.vsd_cvap_ifmlostwages = model.EmploymentIncomeInformation.didYouLoseWages;
                if (model.EmploymentIncomeInformation.areYouSelfEmployed > 0)
                {
                    application.Application.vsd_cvap_ifmselfemployed = model.EmploymentIncomeInformation.areYouSelfEmployed;
                }
                application.Application.vsd_cvap_ifmcontactemployer = model.EmploymentIncomeInformation.mayContactEmployer; 
            }

            if (model.RepresentativeInformation != null)
            {
                application.Application.vsd_cvap_onbehalfofdeclaration = model.RepresentativeInformation.completingOnBehalfOf;
            }

            if (model.DeclarationInformation!= null)
            {
                // TODO: Apparently we don't do anything with this information? No obvious fields on the Dynamics side to feed this into
            }

            if (model.AuthorizationInformation != null)
            {
                application.Application.vsd_cvap_onbehalfofdeclaration = model.RepresentativeInformation.completingOnBehalfOf;
                application.Application.vsd_authorizationsignature = model.AuthorizationInformation.signature;
            }

            application.Application.vsd_applicantssignature = model.AuthorizationInformation.signature; // TODO: where does this come from?
            //application.Application.vsd_cvap_optionalauthorization = 0; // TODO: where does this come from?
            //application.Application.vsd_optionalauthorizationsignature = ""; // TODO: where does this come from?

            //application.DocumentCollection = new Documentcollection[1]; // TODO: bind collection
            

            return application;
        }

        public static ApplicationDynamicsModel GetApplicationDefaults()
        {
            return new ApplicationDynamicsModel
            {
                Application = new Application
                {
                    vsd_applicanttype = 100000002,
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

                    vsd_cvap_crimestartdate = new DateTime(2018, 6, 14), //"2018-06-03T00:00:00",

                    // TODO: Don't know where these two fields went...
                    // vsd_cvap_authorizationsigneddate = "2019-02-07T00:00:00",
                    // vsd_cvap_declarationsigneddate = "2019-02-07T00:00:00",
                    vsd_cvap_onbehalfofdeclaration = 100000000,
                },
                CourtInfoCollection = new List<Courtinfocollection>
                {
                    new Courtinfocollection
                    {
                        vsd_courtfilenumber = "1234567",
                        vsd_courtlocation = "Victoria"
                    }
                }.ToArray(),
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
