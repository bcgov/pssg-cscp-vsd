import { iCRMApplication, iCRMCourtInfo, iCRMParticipant, iRestitutionCRM } from "../interfaces/dynamics/crm-restitution";
import { iRestitutionApplication, iCourtFile, iDocument } from "../interfaces/restitution.interface";
import { ApplicationType } from "../shared/enums-list";


export function convertRestitutionToCRM(application: iRestitutionApplication) {
    console.log("converting restitution application");
    console.log(application);

    let crm_application: iRestitutionCRM = {
        Application: getCRMApplication(application),
        CourtInfoCollection: getCRMCourtInfoCollection(application),
        ProviderCollection: getCRMProviderCollection(application),
        DocumentCollection: getCRMDocumentCollection(application),
    }

    console.log("restitution crm:");
    console.log(crm_application);

    return crm_application;
}

function getCRMApplication(application: iRestitutionApplication) {
    let crm_application: iCRMApplication = {
        vsd_applicanttype: application.ApplicationType.val,
        vsd_applicantsfirstname: application.RestitutionInformation.firstName,
        vsd_applicantsmiddlename: application.RestitutionInformation.middleName,
        vsd_applicantslastname: application.RestitutionInformation.lastName,
        vsd_otherfirstname: application.RestitutionInformation.otherFirstName,
        vsd_otherlastname: application.RestitutionInformation.otherLastName,
        vsd_applicantsgendercode: application.RestitutionInformation.gender,
        vsd_applicantsbirthdate: application.RestitutionInformation.birthDate,
        vsd_indigenous: application.RestitutionInformation.indigenousStatus,
        vsd_applicantspreferredmethodofcontact: application.RestitutionInformation.contactInformation.preferredMethodOfContact,
        vsd_applicantsprimaryphonenumber: application.RestitutionInformation.contactInformation.phoneNumber,
        vsd_applicantsalternatephonenumber: application.RestitutionInformation.contactInformation.alternatePhoneNumber,
        vsd_applicantsemail: application.RestitutionInformation.contactInformation.email,
        vsd_applicantsprimaryaddressline1: application.RestitutionInformation.contactInformation.mailingAddress.line1,
        vsd_applicantsprimaryaddressline2: application.RestitutionInformation.contactInformation.mailingAddress.line2,
        vsd_applicantsprimarycity: application.RestitutionInformation.contactInformation.mailingAddress.city,
        vsd_applicantsprimaryprovince: application.RestitutionInformation.contactInformation.mailingAddress.province,
        vsd_applicantsprimarypostalcode: application.RestitutionInformation.contactInformation.mailingAddress.postalCode,
        vsd_applicantsprimarycountry: application.RestitutionInformation.contactInformation.mailingAddress.country,
        vsd_voicemailoption: application.RestitutionInformation.contactInformation.leaveVoicemail,
        vsd_applicantssignature: application.RestitutionInformation.signature,
    }

    return crm_application;
}

function getCRMCourtInfoCollection(application: iRestitutionApplication) {
    let ret: iCRMCourtInfo[] = [];

    application.RestitutionInformation.courtFiles.forEach(file => {
        ret.push({
            vsd_courtfilenumber: file.fileNumber,
            vsd_courtlocation: file.location,
        });
    });

    return ret;
}

function getCRMProviderCollection(application: iRestitutionApplication) {
    let ret: iCRMParticipant[] = [];

    if (application.RestitutionInformation.authorizeDesignate && application.RestitutionInformation.designate.length > 0) {
        let designate = application.RestitutionInformation.designate[0];
        //add designate...
        ret.push({
            vsd_firstname: designate.firstName,
            vsd_lastname: designate.lastName,
            vsd_preferredname: designate.preferredName,
            //need crm field: designate.actOnBehalf,
            vsd_relationship1: "Authorized Person"
        });
    }

    //if victim application - there may be offenders (which are included in the "courtFiles")
    application.RestitutionInformation.courtFiles.forEach(file => {
        if (checkFileHasOffender(file)) {
            ret.push({
                vsd_firstname: file.firstName,
                vsd_middlename: file.middleName,
                vsd_lastname: file.lastName,
                vsd_relationship1: "Offender",
                vsd_relationship2: file.relationship
            });
        }
    });

    if (application.ApplicationType.val === ApplicationType.Offender_Application && checkProbationOfficerHasValue(application)) {
        ret.push({
            vsd_firstname: application.RestitutionInformation.probationOfficerFirstName,
            vsd_lastname: application.RestitutionInformation.probationOfficerLastName,
            vsd_phonenumber: application.RestitutionInformation.probationOfficerPhoneNumber,
            vsd_email: application.RestitutionInformation.probationOfficerEmail,
            vsd_rest_custodylocation: application.RestitutionInformation.probationOfficerCustodyLocation,
            vsd_relationship1: "Parole Officer",
        });
    }

    if (application.ApplicationType.val === ApplicationType.Victim_Application && checkObjectHasValue(application.RestitutionInformation.vsw[0])) {
        let vsw = application.RestitutionInformation.vsw[0];
        ret.push({
            vsd_firstname: vsw.firstName,
            vsd_lastname: vsw.lastName,
            vsd_rest_programname: vsw.program,
            vsd_phonenumber: vsw.phoneNumber,
            vsd_email: vsw.email,
            vsd_relationship1: "Victim Service Worker",
        });
    }

    return ret;
}

function getCRMDocumentCollection(application: iRestitutionApplication) {
    let ret: iDocument[] = [];
    application.RestitutionInformation.documents.forEach(doc => {
        ret.push({
            filename: doc.filename,
            subject: doc.subject,
            body: doc.body
        });
    });
    return ret;
}

function checkFileHasOffender(file: iCourtFile) {
    return (file && (file.firstName || file.middleName || file.lastName || file.relationship));
}
function checkProbationOfficerHasValue(application: iRestitutionApplication) {
    return (application.RestitutionInformation.probationOfficerFirstName || application.RestitutionInformation.probationOfficerLastName || application.RestitutionInformation.probationOfficerPhoneNumber || application.RestitutionInformation.probationOfficerEmail || application.RestitutionInformation.probationOfficerCustodyLocation)
}

function checkObjectHasValue(obj: any) {
    return Object.values(obj).some(value => !!value);
}

