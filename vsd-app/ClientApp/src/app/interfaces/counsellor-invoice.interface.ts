export interface CounsellorInvoice {
  InvoiceDetails: InvoiceDetails;
}
export interface InvoiceDetails {
  registeredCounsellorWithCvap: boolean;  // Not used in transfer to Dynamics
  doYouHaveCvapCounsellorNumber: boolean;  // Not used in transfer to Dynamics
  doYouHaveVendorNumberOnFile: boolean;  // Not used in transfer to Dynamics
  counsellorRegistrationNumber: string;
  counsellorFirstName: string;
  counsellorLastName: string;
  counsellorEmail: string;
  vendorNumber: string;
  vendorName: string;
  vendorEmail: string;
  claimNumber: string;
  claimantsName: string;
  invoiceNumber: string;
  invoiceDate: Date;
  descriptionOfServicesProvided: string;
  exemptFromGst: boolean;
  lineItems: LineItem[];
  declaredAndSigned: boolean;  // Not used in transfer to Dynamics
  signature: string;
}
export interface LineItem {
  counsellingType: number;
  sessionDate: Date;
  sessionHours: number;
  sessionAmount: number;  // Not used in transfer to Dynamics
}
