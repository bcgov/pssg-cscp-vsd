export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'YYYY-MM-DD',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export class EnumHelper {

  public Gender = {
    0: '--',
    100000000: 'M',
    100000001: 'F',
    100000002: 'X',
  };

  public RelationshipToVictim = {
    0: '--',
    100000000: 'Spouse',
    100000001: 'Parent/Guardian',
    100000002: 'Child',
    100000003: 'Sibling',
    100000004: 'Other',
  }

  public MaritalStatus = {
    0: '--',
    100000000: 'Married',
    100000001: 'Common Law',
    100000002: 'Widowed',
    100000003: 'Divorced',
    100000004: 'Separated',
    100000005: 'Single',
  }

  public IndigenousStatus = {
    0: "",
    100000000: "First Nations",
    100000001: "Métis",
    100000002: "Inuit",
    100000003: "Prefer Not to Answer",
    100000004: "Not Applicable",
  }

  public VoicemailOptions = {
    0: "",
    100000000: "Primary and Alternate",
    100000001: "Primary only",
    100000002: "Alternate only",
    100000003: "No Voicemail",
  }

  public ApplicantPreferredMethodOfContact = {
    0: '--',
    2: 'Phone Call',
    1: 'Email',
    4: 'Primary Mail',
    100000002: 'Alternate Mail',
  }

  public ParticipantPreferredMethodOfContact = {
    // There are two drop downs being accessed by this which is why items appear twice
    0: '--',
    100000000: 'Email',
    100000001: 'Phone Call',
    100000002: 'Mail',
  }

  public ReportMadeToPolice = {
    0: '--',
    100000000: 'Yes',
    100000001: 'No',
    100000002: 'Unknown',
  }

  public OffenderBeenCharged = {
    0: '--',
    100000000: 'Yes',
    100000001: 'No',
    100000002: 'Unknown',
  }

  public HaveYouSuedOffender = {
    0: '--',
    100000000: 'No',
    100000001: 'Yes',
  }

  public IntendToSueOffender = {
    0: '--',
    100000000: 'Yes',
    100000001: 'No',
    100000002: 'Undecided',
  }

  public ApplyToCourtForMoneyFromOffender = {
    0: '--',
    100000000: 'Yes',
    100000001: 'No',
    100000002: 'Not Applicable (No trial/conviction)',
  }

  public WillBeTakingLegalAction = {
    0: '--',
    100000000: 'Yes',
    100000001: 'No',
    100000002: 'Unsure',
  }

  public WereYouEmployedAtTimeOfCrime = {
    0: '--',
    100000000: 'No',
    100000001: 'Yes',
  }

  public AllowCvapStaffSharing = {
    0: '--',
    100000000: 'No',
    100000001: 'Yes-Person',
    100000002: 'Yes-Agency',
  }

  public AllowCvapStaffSharingValues = {
    'No': 100000000,
    'Yes_Person': 100000001,
    'Yes_Agency': 100000002,
  }

  public boolEnum = {
    0: '--',
    100000000: 'No',
    100000001: 'Yes',
  }

  public boolValues = {
    No: 100000000,
    Yes: 100000001
  }

  public CompletingOnBehalfOf = {
    0: '--',
    100000000: 'Completing this application for myself',
    100000001: 'A Victim Service Worker or other person helping a victim complete this application',
    100000002: 'A parent completing this application for my minor child (under 19 years of age)',
    100000003: 'A legal representative or legal guardian completing this application on behalf of someone else',
  }

  public ProviderSpecialistType = {
    0: '--',
    100000001: 'Specialist',
    100000002: 'Counsellor / Psychologist',
    100000003: 'Dentist',
    100000004: 'Other',
  }

  public InvoiceCounsellingType = {
    0: '--',
    100000000: 'Counselling Session',
    100000001: 'Court Supporting Counselling',
    100000002: 'Psycho-educational sessions',
  }
}

export enum CRMBoolean {
  True = 100000001,
  False = 100000000,
}
export enum CRMMultiBoolean {
  True = 100000000,
  False = 100000001,
  Undecided = 100000002
}

export enum ApplicationType {
  Victim_Application = 100000002,
  IFM_Application = 100000001,
  Witness_Application = 100000000
}

export enum OnBehalfOf {
  Myself = 100000000,
  Parent = 100000002,
  Legal_Guardian = 100000003
}
