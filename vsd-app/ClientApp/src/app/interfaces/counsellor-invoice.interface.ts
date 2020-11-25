export interface CounsellorInvoice {
  InvoiceDetails: InvoiceDetails;
}
export interface InvoiceDetails {
  registeredCounsellorWithCvap: boolean;  // Not used in transfer to Dynamics
  doYouHaveCvapCounsellorNumber: boolean;  // Not used in transfer to Dynamics
  doYouHaveVendorNumberOnFile: boolean;  // Not used in transfer to Dynamics
  counsellorRegistrationNumber: string;
  counsellorLastName: string;
  vendorNumber: string;
  vendorPostalCode: string;
  claimNumber: string;
  claimantsFirstName: string;
  claimantsLastName: string;
  claimantsFullName?: string;
  invoiceNumber: string;
  invoiceDate: Date;
  submitterFullName: string;
  submitterEmailAddress: string;
  exemptFromGst: boolean;
  gstApplicable: boolean;
  lineItems: LineItem[];
  declaredAndSigned: boolean;  // Not used in transfer to Dynamics
}
export interface LineItem {
  counsellingType: number;
  counsellingTypeName?: string;
  sessionDate: Date;
  sessionHours: number;
  sessionAmount: number;  // Not used in transfer to Dynamics
  missedSession: boolean;
}
