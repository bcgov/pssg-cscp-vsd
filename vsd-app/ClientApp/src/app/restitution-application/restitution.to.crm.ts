import { iCRMApplication, iCRMCourtInfo, iCRMParticipant, iRestitutionCRM } from "../interfaces/dynamics/crm-restitution";
import { iRestitutionApplication, iCourtFile, iDocument } from "../interfaces/restitution.interface";
import { ApplicationType, CRMBoolean, EnumHelper } from "../shared/enums-list";


export function convertRestitutionToCRM(application: iRestitutionApplication) {
    console.log("converting restitution application");
    console.log(application);

    let crm_application: iRestitutionCRM = {
        Application: getCRMApplication(application),
    }

    let courtInfo = getCRMCourtInfoCollection(application);
    if (courtInfo.length > 0) crm_application.CourtInfoCollection = courtInfo;

    let providers = getCRMProviderCollection(application);
    if (providers.length > 0) crm_application.ProviderCollection = providers;

    let documents = getCRMDocumentCollection(application);
    if (documents.length > 0) crm_application.DocumentCollection = documents;


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

        vsd_applicantspreferredmethodofcontact: null,
        // vsd_smspreferred: null,
        vsd_applicantsprimaryphonenumber: '',
        vsd_applicantsalternatephonenumber: '',
        vsd_applicantsemail: '',
        vsd_applicantsprimaryaddressline1: '',
        vsd_applicantsprimaryaddressline2: '',
        vsd_applicantsprimarycity: '',
        vsd_applicantsprimaryprovince: '',
        vsd_applicantsprimarypostalcode: '',
        vsd_applicantsprimarycountry: '',
        vsd_voicemailoption: null,
        vsd_applicantssignature: application.RestitutionInformation.signature,
    }

    let hasDesignate = (application.RestitutionInformation.authorizeDesignate && application.RestitutionInformation.designate.length > 0);

    if (!hasDesignate) {
        crm_application.vsd_applicantspreferredmethodofcontact = application.RestitutionInformation.contactInformation.preferredMethodOfContact;
        // crm_application.vsd_smspreferred = application.RestitutionInformation.contactInformation.smsPreferred;
        crm_application.vsd_applicantsprimaryphonenumber = application.RestitutionInformation.contactInformation.phoneNumber;
        crm_application.vsd_applicantsalternatephonenumber = application.RestitutionInformation.contactInformation.alternatePhoneNumber;
        crm_application.vsd_applicantsemail = application.RestitutionInformation.contactInformation.email;
        crm_application.vsd_applicantsprimaryaddressline1 = application.RestitutionInformation.contactInformation.mailingAddress.line1;
        crm_application.vsd_applicantsprimaryaddressline2 = application.RestitutionInformation.contactInformation.mailingAddress.line2;
        crm_application.vsd_applicantsprimarycity = application.RestitutionInformation.contactInformation.mailingAddress.city;
        crm_application.vsd_applicantsprimaryprovince = application.RestitutionInformation.contactInformation.mailingAddress.province;
        crm_application.vsd_applicantsprimarypostalcode = application.RestitutionInformation.contactInformation.mailingAddress.postalCode;
        crm_application.vsd_applicantsprimarycountry = application.RestitutionInformation.contactInformation.mailingAddress.country;
        crm_application.vsd_voicemailoption = application.RestitutionInformation.contactInformation.leaveVoicemail;
    }

    return crm_application;
}

function getCRMCourtInfoCollection(application: iRestitutionApplication) {
    let ret: iCRMCourtInfo[] = [];

    application.RestitutionInformation.courtFiles.forEach(file => {
        if (checkHasFileInfo(file)) {
            ret.push({
                vsd_courtfilenumber: file.fileNumber,
                vsd_courtlocation: file.location,
            });
        }
    });

    return ret;
}

function getCRMProviderCollection(application: iRestitutionApplication) {
    let ret: iCRMParticipant[] = [];
    let enumHelper = new EnumHelper();

    if (application.RestitutionInformation.authorizeDesignate && application.RestitutionInformation.designate.length > 0) {
        let designate = application.RestitutionInformation.designate[0];
        //add designate...
        let toAdd: iCRMParticipant = {
            vsd_firstname: designate.firstName,
            vsd_lastname: designate.lastName,
            vsd_preferredname: designate.preferredName,
            //need crm field: designate.actOnBehalf,
            vsd_relationship1: "Designate",

            //set contact info
            vsd_addressline1: application.RestitutionInformation.contactInformation.mailingAddress.line1,
            vsd_addressline2: application.RestitutionInformation.contactInformation.mailingAddress.line2,
            vsd_city: application.RestitutionInformation.contactInformation.mailingAddress.city,
            vsd_province: application.RestitutionInformation.contactInformation.mailingAddress.province,
            vsd_postalcode: application.RestitutionInformation.contactInformation.mailingAddress.postalCode,
            vsd_country: application.RestitutionInformation.contactInformation.mailingAddress.country,
            vsd_phonenumber: application.RestitutionInformation.contactInformation.phoneNumber,
            vsd_alternatephonenumber: application.RestitutionInformation.contactInformation.alternatePhoneNumber,
            vsd_email: application.RestitutionInformation.contactInformation.email,
            vsd_voicemailoptions: application.RestitutionInformation.contactInformation.leaveVoicemail,
        };

        switch (application.RestitutionInformation.contactInformation.preferredMethodOfContact) {
            case enumHelper.ContactMethods.BLANK.val:
                toAdd.vsd_restcontactpreferenceforupdates = enumHelper.ParticipantContactMethods.BLANK.val;
                break;
            case enumHelper.ContactMethods.Email.val:
                toAdd.vsd_restcontactpreferenceforupdates = enumHelper.ParticipantContactMethods.Email.val;
                break;
            case enumHelper.ContactMethods.Mail.val:
                toAdd.vsd_restcontactpreferenceforupdates = enumHelper.ParticipantContactMethods.Mail.val;
                break;
            case enumHelper.ContactMethods.Phone.val:
                toAdd.vsd_restcontactpreferenceforupdates = enumHelper.ParticipantContactMethods.Phone.val;
                break;
        }

        // if (application.RestitutionInformation.contactInformation.smsPreferred == CRMBoolean.True) {
        //     toAdd.vsd_restcontactpreferenceforupdates = enumHelper.ParticipantContactMethods.SMS.val;
        // }

        ret.push(toAdd);
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
            vsd_relationship1: "Probation Officer",
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
function checkHasFileInfo(file: iCourtFile) {
    return (file && (file.fileNumber || file.location));
}
function checkProbationOfficerHasValue(application: iRestitutionApplication) {
    return (application.RestitutionInformation.probationOfficerFirstName || application.RestitutionInformation.probationOfficerLastName || application.RestitutionInformation.probationOfficerPhoneNumber || application.RestitutionInformation.probationOfficerEmail || application.RestitutionInformation.probationOfficerCustodyLocation)
}

function checkObjectHasValue(obj: any) {
    return Object.values(obj).some(value => !!value);
}

