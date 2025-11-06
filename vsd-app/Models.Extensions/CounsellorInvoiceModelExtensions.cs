using System;
using System.Collections.Generic;
using Gov.Cscp.VictimServices.Public.JsonObjects;
using Gov.Cscp.VictimServices.Public.ViewModels;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Gov.Cscp.VictimServices.Public.Models.Extensions
{
    public static class CounsellorInvoiceModelExtensions
    {
        public static CounsellorInvoiceDynamicsModel ToDynamicsModel(this CounsellorInvoiceFormModel model)
        {
            CounsellorInvoiceDynamicsModel outputModel = new CounsellorInvoiceDynamicsModel();
            if (model == null || model.InvoiceDetails == null)
                return outputModel;

            Invoicedetails invoiceDetails = model.InvoiceDetails;
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

            List<CounsellorInvoiceLineItem> lineItems = new List<CounsellorInvoiceLineItem>();
            foreach (Lineitem lineItem in invoiceDetails.lineItems)
            {
                lineItems.Add(
                    new CounsellorInvoiceLineItem
                    {
                        vsd_cvap_counsellingtype = lineItem.counsellingType,
                        vsd_cvap_sessiondate = lineItem.sessionDate,
                        vsd_cvap_sessionduration = lineItem.sessionHours,
                        vsd_missedsession = lineItem.missedSession,
                    }
                );
            }
            outputModel.InvoiceLineItems = lineItems.ToArray();

            //uncomment this one the document collection is added to the API
            if (model.DocumentCollection.Length > 0)
            {
                outputModel.DocumentCollection = new Documentcollection[model.DocumentCollection.Length];

                int documentIndex = 0;
                for (int i = 0; i < model.DocumentCollection.Length; ++i)
                {
                    Documentcollection tempDocumentCollection = new Documentcollection();
                    tempDocumentCollection.body = model.DocumentCollection[i].body;
                    tempDocumentCollection.filename = model.DocumentCollection[i].fileName;
                    tempDocumentCollection.subject = model.DocumentCollection[i].subject;
                    outputModel.DocumentCollection[documentIndex] = tempDocumentCollection;
                    ++documentIndex;
                }
            }

            return outputModel;
        }

        public static CounsellorInvoiceFormModel ToFormModel(this CounsellorInvoiceFormDynamicsModel dynamicsModel)
        {
            CounsellorInvoiceFormModel outputModel = new CounsellorInvoiceFormModel();
            if (dynamicsModel == null)
                return outputModel;

            Invoicedetails invoiceDetails = new Invoicedetails();

            invoiceDetails.vendorNumber = dynamicsModel.vsd_payeenumber;
            invoiceDetails.vendorPostalCode = dynamicsModel.vsd_emailaddress;

            invoiceDetails.counsellorRegistrationNumber = dynamicsModel.vsd_cvap_counsellorregistrationnumber;
            invoiceDetails.counsellorLastName = dynamicsModel.vsd_cvap_nameofcounsellortext;

            invoiceDetails.claimNumber = dynamicsModel.vsd_claimnumbertext;
            invoiceDetails.claimantsFirstName = dynamicsModel.vsd_claimantnametext;
            invoiceDetails.claimantsLastName = dynamicsModel.vsd_claimantlastnametext;
            invoiceDetails.claimantsFullName =
                $"{dynamicsModel.vsd_claimantnametext} {dynamicsModel.vsd_claimantlastnametext}";

            invoiceDetails.invoiceNumber = dynamicsModel.vsd_payeeinvoicenumber;
            invoiceDetails.invoiceDate = DateTime.Parse(dynamicsModel.vsd_invoicedate);

            invoiceDetails.submitterFullName = dynamicsModel.vsd_signature;
            invoiceDetails.submitterEmailAddress = dynamicsModel.vsd_cvap_counselloremailtext;

            if (dynamicsModel.InvoiceLineItems != null && dynamicsModel.InvoiceLineItems.Length > 0)
            {
                List<Lineitem> lineItems = new List<Lineitem>();
                foreach (var item in dynamicsModel.InvoiceLineItems)
                {
                    var counsellingTypeEnum = (CounsellingTypeEnum?)item.vsd_cvap_counsellingtype;
                    lineItems.Add(
                        new Lineitem
                        {
                            counsellingTypeName =
                                counsellingTypeEnum != null ? counsellingTypeEnum.GetDescription() : null,
                            sessionHours = item.vsd_cvap_sessionduration,
                            missedSession = item.vsd_missedsession,
                            sessionDate = item.vsd_cvap_sessiondate,
                        }
                    );
                }
                invoiceDetails.lineItems = lineItems.ToArray();
            }
            outputModel.InvoiceDetails = invoiceDetails;
            return outputModel;
        }
    }
}
