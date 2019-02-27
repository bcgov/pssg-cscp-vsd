export class CrimeInformationModel {
  typeOfCrime: string;

  //whenDidCrimeOccur: number | null;  // Probably not used
  crimePeriodStart: Date;
  crimePeriodEnd: Date | null;
  //applicationFiledWithinOneYearFromCrime: number;
  whyDidYouNotApplySooner: string;

  crimeLocations: string;
  crimeDetails: string;
  crimeInjuries: string;
  
  wasReportMadeToPolice: number | null;

  policeReportedWhichPoliceForce: string;
  policeReportedDate: Date | null;
  policeReportedPoliceFileNumber: string;
  policeReportedInvestigatingOfficer: string;

  noPoliceReportIdentification: string;

  offenderFirstName: string;
  offenderMiddleName: string;
  offenderLastName: string;
  offenderRelationship: string;
  offenderBeenCharged: number | null;

  //        courtFiles: this.fb.array([]),

  courtFileNumber: string;
  courtLocation: string;

  haveYouSuedOffender: number | null;

  suedCourtLocation: string;
  suedCourtFileNumber: string;
  intendToSueOffender: number | null;
}
