using System;
using System.Xml.Serialization;

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
        public string counsellorLastName { get; set; }
        public string vendorNumber { get; set; }
        public string vendorPostalCode { get; set; }
        public string claimNumber { get; set; }
        public string claimantsFirstName { get; set; }
        public string claimantsLastName { get; set; }
        public string invoiceNumber { get; set; }
        public DateTime invoiceDate { get; set; }
        public string submitterFullName { get; set; }
        public string submitterEmailAddress { get; set; }
        public bool exemptFromGst { get; set; }

        [XmlArrayItem("element")]
        public Lineitem[] lineItems { get; set; }
        
        public bool declaredAndSigned { get; set; }  // Not used in transfer to Dynamics
    }

    public class Lineitem
    {
        public int counsellingType { get; set; }
        public DateTime sessionDate { get; set; }
        public float sessionHours { get; set; }
        public int sessionAmount { get; set; }  // Not used in transfer to Dynamics
        public bool missedSession { get; set; }
    }
}