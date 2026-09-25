// Test data builders for the VSD (CVAP) application submission journey.
//
// Every record created by these tests MUST be trivially identifiable as
// load-test data so it can be found and purged from Dataverse afterwards.
// We do this by prefixing names/free-text fields with LOAD_TEST_TAG and a
// per-run marker (K6 run id + timestamp), and by never reusing a real
// person's information.
//
// Field notes: ApplicationFormModel.cs (vsd-app/ViewModels) only strictly
// requires the fields its Validate() methods check, given that none of the
// top-level section properties (PersonalInformation, CrimeInformation,
// MedicalInformation, etc.) are themselves [Required] - if you leave one
// null, ASP.NET's model binder never recurses into it and its internal
// [Required] attributes are never evaluated. That means a "minimal valid"
// payload is much smaller than the full Angular form. See MANUAL.md
// "Keeping payloads in sync" before trusting this doesn't drift from the
// real validation rules if the C# model changes.
//
// CRM option-set values mirrored from vsd-app/ViewModels/CrmConstants.cs:
import { randomIntBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const LOAD_TEST_TAG = 'K6-LOADTEST';

// Unique per test-run marker so a single execution's records can be found
// and deleted together (e.g. search Dataverse for this value).
export const RUN_MARKER = __ENV.RUN_MARKER || `${Date.now()}`;

const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley'];
const LAST_NAMES = ['Sample', 'Synthetic', 'Placeholder', 'Fixture'];

const Crm = {
  BoolTrue: 100000001,
  BoolFalse: 100000000,
  MultiBoolTrue: 100000000,
  MultiBoolFalse: 100000001,
  AppTypeWitness: 100000000,
  AppTypeIFM: 100000001,
  AppTypeVictim: 100000002,
  OnBehalfMyself: 100000000,
  ContactEmail: 1,
};

function taggedName(prefix) {
  return `${LOAD_TEST_TAG}-${prefix}-${RUN_MARKER}-${randomIntBetween(1000, 9999)}`;
}

function person() {
  return {
    firstName: taggedName(randomItem(FIRST_NAMES)),
    lastName: taggedName(randomItem(LAST_NAMES)),
  };
}

function address() {
  return {
    line1: `${randomIntBetween(100, 9999)} Synthetic St`,
    line2: '',
    city: 'Victoria',
    postalCode: 'V8V0A0',
    province: 'British Columbia',
    country: 'Canada',
  };
}

// Real submissions always include crime details regardless of application
// type, even though ApplicationFormModel.Validate() only strictly requires
// this section for IFM/Witness applications. haveYouSuedOffender=BoolFalse
// + intendToSueOffender=MultiBoolFalse deliberately avoids the
// "suedOrIntending" branch, which would otherwise require a fully-populated
// racafInformation block (signatures, expense breakdown, etc.).
//
// crimeLocations/additionalOffenders/documents/policeReports/courtFiles
// MUST be arrays, not omitted/null: vsd-app's
// Models.Extensions/ApplicationModelExtensions.cs (`ToVsdVictimsModel()`)
// calls `.Count()`/`.Length` on `crimeLocations` and `additionalOffenders`
// with no null-guard and outside its try/catch block - a null there throws
// an unhandled "Value cannot be null. (Parameter 'source')" / NRE and the
// submission 500s. See MANUAL.md "Known gotchas".
function crimeInformation() {
  return {
    crimePeriodStart: '2024-01-01T00:00:00Z',
    wasReportMadeToPolice: Crm.MultiBoolTrue, // reported -> skips noPoliceReportIdentification
    crimeDetails: `${LOAD_TEST_TAG} synthetic crime details (${RUN_MARKER}).`,
    crimeInjuries: `${LOAD_TEST_TAG} synthetic injuries (${RUN_MARKER}).`,
    offenderBeenCharged: Crm.BoolFalse,
    typeOfCrime: 'Assault',
    haveYouSuedOffender: Crm.BoolFalse,
    intendToSueOffender: Crm.MultiBoolFalse,
    victimDeceasedFromCrime: Crm.BoolFalse,
    crimeLocations: [],
    additionalOffenders: [],
    documents: [],
    policeReports: [],
    courtFiles: [],
  };
}

function declarationAndAuthorization(signerName) {
  const signature = `${LOAD_TEST_TAG}-signature-${RUN_MARKER}-${randomIntBetween(1000, 9999)}`;
  return {
    introduction: { understoodInformation: 'true' },
    declarationInformation: { declaredAndSigned: 'true', signature },
    authorizationInformation: {
      approvedAuthorityNotification: 'true',
      readAndUnderstoodTermsAndConditions: 'true',
      signName: signerName,
      signature,
    },
    representativeInformation: { completingOnBehalfOf: Crm.OnBehalfMyself, documents: [] },
  };
}

// vsd-app's Models.Extensions/ApplicationModelExtensions.cs dereferences
// model.MedicalInformation.familyDoctorClinic/FirstName/LastName
// unconditionally (no `if (model.MedicalInformation != null)` guard around
// that particular block) - omitting this section entirely throws a
// NullReferenceException and the submission 500s. All "no" answers here to
// avoid pulling in additional [Required]/conditional fields (province,
// hospital name, clinic name). See MANUAL.md "Known gotchas".
function medicalInformation() {
  return {
    doYouHaveMedicalServicesCoverage: 'false',
    doYouHaveOtherHealthCoverage: Crm.BoolFalse,
    wereYouTreatedAtHospital: 'false',
    beingTreatedByFamilyDoctor: 'false',
    hadOtherTreatments: 'false',
    otherTreatments: [],
  };
}

function baseApplication(applicationType, personalInfoExtra) {
  const applicant = person();
  const { introduction, declarationInformation, authorizationInformation, representativeInformation } = declarationAndAuthorization(`${applicant.firstName} ${applicant.lastName}`);

  return {
    ApplicationType: applicationType,
    ApplicationDate: new Date().toISOString(),
    ApplicationPDFs: [],
    Introduction: introduction,
    PersonalInformation: {
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      birthDate: '1990-01-01T00:00:00Z',
      preferredMethodOfContact: Crm.ContactEmail,
      email: `${applicant.firstName}.${applicant.lastName}@example.invalid`.toLowerCase(),
      agreeToCvapCommunicationExchange: 'true',
      primaryAddress: address(),
      ...personalInfoExtra,
    },
    CrimeInformation: crimeInformation(),
    MedicalInformation: medicalInformation(),
    DeclarationInformation: declarationInformation,
    AuthorizationInformation: authorizationInformation,
    RepresentativeInformation: representativeInformation,
  };
}

// AppTypeVictim (100000002): the only extra requirement is
// PersonalInformation.maritalStatus (range 100000000-100000006).
export function buildVictimApplicationPayload() {
  return baseApplication(Crm.AppTypeVictim, { maritalStatus: 100000000 });
}

// AppTypeIFM (100000001): requires PersonalInformation.relationshipToVictim.
// VictimInformation is deliberately omitted - ApplicationFormModel.Validate()
// only checks VictimInformation's fields when the object itself is
// non-null, so leaving it out skips that branch entirely.
export function buildIfmApplicationPayload() {
  return baseApplication(Crm.AppTypeIFM, { relationshipToVictim: 'Sibling' });
}

// AppTypeWitness (100000000): requires PersonalInformation.relationshipToVictimOther.
export function buildWitnessApplicationPayload() {
  return baseApplication(Crm.AppTypeWitness, { relationshipToVictimOther: 'Friend' });
}
