using System;

namespace Gov.Cscp.VictimServices.Public.ViewModels
{
    public class CounsellorInvoiceFormModel
    {
        public Invoicedetails InvoiceDetails { get; set; }
    }

    public class Invoicedetails
    {
        public bool registeredCounsellorWithCvap { get; set; }  // Not used in transfer to Dynamics
        public bool doYouHaveCvapCounsellorNumber { get; set; }  // Not used in transfer to Dynamics
        public bool doYouHaveVendorNumberOnFile { get; set; }  // Not used in transfer to Dynamics
        public string counsellorRegistrationNumber { get; set; }
        public string counsellorFirstName { get; set; }
        public string counsellorLastName { get; set; }
        public string counsellorEmail { get; set; }
        public string vendorNumber { get; set; }
        public string vendorName { get; set; }
        public string vendorEmail { get; set; }
        public string claimNumber { get; set; }
        public string claimantsName { get; set; }
        public string invoiceNumber { get; set; }
        public DateTime invoiceDate { get; set; }
        public string descriptionOfServicesProvided { get; set; }
        public bool exemptFromGst { get; set; }
        public Lineitem[] lineItems { get; set; }
        public bool declaredAndSigned { get; set; }  // Not used in transfer to Dynamics
        public string signature { get; set; }
    }

    public class Lineitem
    {
        public int counsellingType { get; set; }
        public DateTime sessionDate { get; set; }
        public float sessionHours { get; set; }
        public int sessionAmount { get; set; }  // Not used in transfer to Dynamics
    }
}