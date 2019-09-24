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
            outputModel.CounselorNumber = invoiceDetails.counsellorRegistrationNumber;
            outputModel.CounselorName = $"{invoiceDetails.counsellorFirstName} {invoiceDetails.counsellorLastName}"?.Trim();
            outputModel.CounselorEmail = invoiceDetails.counsellorEmail;

            outputModel.VendorName = invoiceDetails.vendorName;
            outputModel.VendorNumber = invoiceDetails.vendorNumber;
            outputModel.VendorEmail = invoiceDetails.vendorEmail;

            outputModel.ClaimNumber = invoiceDetails.claimNumber;
            outputModel.ClaimantName = invoiceDetails.claimantsName;

            outputModel.InvoiceNumber = invoiceDetails.invoiceNumber;
            outputModel.InvoiceDate = invoiceDetails.invoiceDate;

            outputModel.DescriptionOfServices = invoiceDetails.descriptionOfServicesProvided;
            outputModel.ExemptFromGST = invoiceDetails.exemptFromGst;
            outputModel.Signature = invoiceDetails.signature;

            var lineItems = new List<CounsellorInvoiceLineItem>();
            foreach(var lineItem in invoiceDetails.lineItems)
            {
                lineItems.Add(new CounsellorInvoiceLineItem
                {
                    vsd_cvap_counsellingtype = lineItem.counsellingType,
                    vsd_cvap_sessiondate = lineItem.sessionDate,
                    vsd_cvap_sessionduration = lineItem.sessionHours
                });
            }
            outputModel.InvoiceLineItems = lineItems.ToArray();

            return outputModel;
        }
    }
}
