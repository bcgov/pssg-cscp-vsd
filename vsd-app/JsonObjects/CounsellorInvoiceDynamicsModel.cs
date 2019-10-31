using System;

namespace Gov.Cscp.VictimServices.Public.JsonObjects
{
    public class CounsellorInvoiceDynamicsModel
    {
        public string VendorNumber { get; set; }
        public string VendorName { get; set; }
        public string VendorEmail { get; set; }
        public string VendorPhoneNumber { get; set; }  // Not used
        public string CounselorNumber { get; set; }
        public string CounselorName { get; set; }
        public string CounselorPhoneNumber { get; set; } // Not used
        public string CounselorEmail { get; set; }
        public string ClaimNumber { get; set; }
        public string ClaimantName { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string DescriptionOfServices { get; set; }
        public bool ExemptFromGST { get; set; }
        public string Signature { get; set; }
        public CounsellorInvoiceLineItem[] InvoiceLineItems { get; set; }
    }

    public class CounsellorInvoiceLineItem
    {
        public string odatatype => "Microsoft.Dynamics.CRM.vsd_invoicelinedetail";

        public int vsd_cvap_counsellingtype { get; set; }
        public DateTime vsd_cvap_sessiondate { get; set; }
        public float vsd_cvap_sessionduration { get; set; }
    }
}