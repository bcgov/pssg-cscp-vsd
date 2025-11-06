using System;

namespace Gov.Cscp.VictimServices.Public.JsonObjects
{
    public class CounsellorInvoiceDynamicsModel
    {
        public string VendorNumber { get; set; }
        public string VendorPostalCode { get; set; }
        public string CounselorNumber { get; set; }
        public string CounselorLastName { get; set; }
        public string ClaimNumber { get; set; }
        public string ClaimantFirstName { get; set; }
        public string ClaimantLastName { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string SubmitterFullName { get; set; }
        public string SubmitterEmailAddress { get; set; }
        public bool ExemptFromGST { get; set; }
        public CounsellorInvoiceLineItem[] InvoiceLineItems { get; set; }

        public Documentcollection[] DocumentCollection { get; set; }
    }

    public class CounsellorInvoiceLineItem
    {
        public string odatatype => "Microsoft.Dynamics.CRM.vsd_invoicelinedetail";

        public int? vsd_cvap_counsellingtype { get; set; }
        public DateTime? vsd_cvap_sessiondate { get; set; }
        public float? vsd_cvap_sessionduration { get; set; }
        public bool? vsd_missedsession { get; set; }
    }

    public class CounsellorInvoiceFormDynamicsModel
    {
        public string vsd_payeenumber { get; set; }
        public string vsd_emailaddress { get; set; }
        public string vsd_cvap_counsellorregistrationnumber { get; set; }
        public string vsd_cvap_nameofcounsellortext { get; set; }
        public string vsd_claimnumbertext { get; set; }
        public string vsd_claimantnametext { get; set; }
        public string vsd_claimantlastnametext { get; set; }
        public string vsd_payeeinvoicenumber { get; set; }
        public string vsd_invoicedate { get; set; }
        public string vsd_signature { get; set; }
        public string vsd_cvap_counselloremailtext { get; set; }
        public LineItemDynamicsModel[] InvoiceLineItems { get; set; }
    }

    public class LineItemDynamicsModel
    {
        public string odatatype => "Microsoft.Dynamics.CRM.vsd_invoicelinedetail";

        public string vsd_name { get; set; }
        public int? vsd_cvap_counsellingtype { get; set; }
        public float? vsd_cvap_sessionduration { get; set; }
        public bool? vsd_missedsession { get; set; }
        public DateTime? vsd_cvap_sessiondate { get; set; }
    }
}
