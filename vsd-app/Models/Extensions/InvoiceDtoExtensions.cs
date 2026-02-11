using System;
using System.Linq;
using Database.Model;
using Gov.Cscp.VictimServices.Public.Models.Enums;
using Microsoft.Xrm.Sdk;

namespace Gov.Cscp.VictimServices.Public.Models.Extensions
{
    public static class InvoiceDtoExtensions
    {
        public static Vsd_SubmitCounselorInvoiceRequest ConvertToDynamicsRequest(this InvoiceDto model)
        {
            var request = new Vsd_SubmitCounselorInvoiceRequest
            {
                VendorNumber = model.InvoiceDetails.VendorNumber ?? string.Empty,
                VendorPostalCode = model.InvoiceDetails.VendorPostalCode ?? string.Empty,
                CounselorNumber = model.InvoiceDetails.CounsellorRegistrationNumber ?? string.Empty,
                CounselorLastName = model.InvoiceDetails.CounsellorLastName ?? string.Empty,
                ClaimNumber = model.InvoiceDetails.ClaimNumber ?? string.Empty,
                ClaimantFirstName = model.InvoiceDetails.ClaimantsFirstName ?? string.Empty,
                ClaimantLastName = model.InvoiceDetails.ClaimantsLastName ?? string.Empty,
                InvoiceNumber = model.InvoiceDetails.InvoiceNumber ?? string.Empty,
                InvoicedAte = model.InvoiceDetails.InvoiceDate,
                ExemptFromGst = model.InvoiceDetails.ExemptFromGst,
                SubmitterFullName = model.InvoiceDetails.SubmitterFullName ?? string.Empty,
                SubmitterEmailAddress = model.InvoiceDetails.SubmitterEmailAddress ?? string.Empty,
                InvoiceLineItems = new EntityCollection(),
                DocumentCollection = new EntityCollection(),
            };

            if (model.InvoiceDetails.LineItems?.Any() == true)
            {
                foreach (var lineItem in model.InvoiceDetails.LineItems)
                {
                    var invoiceLineDetail = new Vsd_InvoiceLineDetail
                    {
                        Vsd_Cvap_CounsellingType = Enum.Parse<Vsd_InvoiceLineDetail_Vsd_Cvap_CounsellingType>(
                            lineItem.CounsellingType.ToString()
                        ), //.ToDynamicsEnum(), use later when enum replaced with name values
                        Vsd_Cvap_SessionDate = lineItem.SessionDate,
                        Vsd_Cvap_SessionDuration = lineItem.SessionHours,
                        Vsd_MissedSession = lineItem.MissedSession,
                        // TODO: lineItem.AttendingSupportPerson
                    };

                    request.InvoiceLineItems.Entities.Add(invoiceLineDetail);
                }
            }

            if (model.DocumentCollection?.Any() == true)
            {
                foreach (var doc in model.DocumentCollection)
                {
                    // Use "activitymimeattachment" as the logical name (from Documentcollection.odatatype)
                    var entity = new Entity("activitymimeattachment");
                    entity["filename"] = doc.Filename;
                    entity["body"] = doc.Body;
                    entity["subject"] = doc.Subject ?? string.Empty;
                    request.DocumentCollection.Entities.Add(entity);
                }
            }

            return request;
        }

        public static Vsd_InvoiceLineDetail_Vsd_Cvap_CounsellingType ToDynamicsEnum(
            this CounsellingType counsellingType
        )
        {
            return counsellingType switch
            {
                CounsellingType.CounsellingSession => Vsd_InvoiceLineDetail_Vsd_Cvap_CounsellingType.CounsellingSession,
                CounsellingType.CourtSupportCounselling =>
                    Vsd_InvoiceLineDetail_Vsd_Cvap_CounsellingType.CourtSupportCounselling,
                CounsellingType.PsychoEducationalSession =>
                    Vsd_InvoiceLineDetail_Vsd_Cvap_CounsellingType.PsychoEducationalSession,
                _ => throw new ArgumentException($"Unknown counselling type: {counsellingType}"),
            };
        }
    }
}
