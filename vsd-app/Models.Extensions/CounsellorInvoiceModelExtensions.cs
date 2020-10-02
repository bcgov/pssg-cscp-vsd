using Gov.Cscp.VictimServices.Public.JsonObjects;
using Gov.Cscp.VictimServices.Public.ViewModels;
using System.Collections.Generic;

namespace Gov.Cscp.VictimServices.Public.Models.Extensions
{
    public static class CounsellorInvoiceModelExtensions
    {
        public static CounsellorInvoiceDynamicsModel ToDynamicsModel(this CounsellorInvoiceFormModel model)
        {
            var outputModel = new CounsellorInvoiceDynamicsModel();
            if (model == null || model.InvoiceDetails == null)
                return outputModel;

            var invoiceDetails = model.InvoiceDetails;
            outputModel.VendorNumber = invoiceDetails.vendorNumber;
            outputModel.VendorPostalCode = invoiceDetails.vendorPostalCode;

            outputModel.CounselorNumber = invoiceDetails.counsellorRegistrationNumber;
            outputModel.CounselorLastName = invoiceDetails.counsellorLastName;

            outputModel.ClaimNumber = invoiceDetails.claimNumber;
            outputModel.ClaimantFirstName = invoiceDetails.claimantsFirstName;
            outputModel.ClaimantLastName = invoiceDetails.claimantsLastName;

            outputModel.InvoiceNumber = invoiceDetails.invoiceNumber;
            outputModel.InvoiceDate = invoiceDetails.invoiceDate;

            outputModel.SubmitterFullName = invoiceDetails.submitterFullName;
            outputModel.SubmitterEmailAddress = invoiceDetails.submitterEmailAddress;

            outputModel.ExemptFromGST = invoiceDetails.exemptFromGst;

            var lineItems = new List<CounsellorInvoiceLineItem>();
            foreach (var lineItem in invoiceDetails.lineItems)
            {
                lineItems.Add(new CounsellorInvoiceLineItem
                {
                    vsd_cvap_counsellingtype = lineItem.counsellingType,
                    vsd_cvap_sessiondate = lineItem.sessionDate,
                    vsd_cvap_sessionduration = lineItem.sessionHours,
                    vsd_missedsession = lineItem.missedSession,
                });
            }
            outputModel.InvoiceLineItems = lineItems.ToArray();

            return outputModel;
        }
    }
}
