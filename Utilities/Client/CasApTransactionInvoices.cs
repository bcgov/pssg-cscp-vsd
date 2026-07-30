using System;
using System.Collections.Generic;

namespace Manager.Contract;

public class CasApTransactionInvoices
{
    public bool IsBlockSupplier { get; set; }

    public string InvoiceType { get; set; } = string.Empty;

    public string SupplierNumber { get; set; } = string.Empty;

    public int SupplierSiteNumber { get; set; }

    public DateTime InvoiceDate { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public decimal InvoiceAmount { get; set; }

    public string PayGroup { get; set; } = string.Empty;

    public DateTime DateInvoiceReceived { get; set; }

    public DateTime? DateGoodsReceived { get; set; }

    public string RemittanceCode { get; set; } = string.Empty;

    public bool SpecialHandling { get; set; }

    public string NameLine1 { get; set; } = string.Empty;

    public string NameLine2 { get; set; } = string.Empty;

    public string AddressLine1 { get; set; } = string.Empty;

    public string AddressLine2 { get; set; } = string.Empty;

    public string AddressLine3 { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string Country { get; set; } = string.Empty;

    public string Province { get; set; } = string.Empty;

    public string PostalCode { get; set; } = string.Empty;

    public string QualifiedReceiver { get; set; } = string.Empty;

    public string Terms { get; set; } = string.Empty;

    public string PayAloneFlag { get; set; } = string.Empty;

    public string PaymentAdviceComments { get; set; } = string.Empty;

    public string RemittanceMessage1 { get; set; } = string.Empty;

    public string RemittanceMessage2 { get; set; } = string.Empty;

    public string RemittanceMessage3 { get; set; } = string.Empty;

    public DateTime? GLDate { get; set; }

    public string InvoiceBatchName { get; set; } = string.Empty;

    public string CurrencyCode { get; set; } = string.Empty;

    public string AccountNumber { get; set; } = string.Empty;

    private string _transitNumber = string.Empty;
    public string TransitNumber
    {
        get
        {
            if (!string.IsNullOrEmpty(_transitNumber))
            {
                if (_transitNumber.Length < 5)
                {
                    List<string> concat = new List<string>();
                    for (int i = 0; i < (5 - _transitNumber.Length); i++)
                    {
                        concat.Add("0");
                    }
                    concat.Add(_transitNumber);
                    return string.Join("", concat);
                }
            }

            return _transitNumber;
        }

        set
        {
            _transitNumber = value;
        }
    }

    private string _institutionNumber = string.Empty;
    public string InstitutionNumber
    {
        get
        {
            if (!string.IsNullOrEmpty(_institutionNumber))
            {
                if (_institutionNumber.Length < 4)
                {
                    List<string> concat = new List<string>();
                    for (int i = 0; i < (4 - _institutionNumber.Length); i++)
                    {
                        concat.Add("0");
                    }
                    concat.Add(_institutionNumber);
                    return string.Join("", concat);
                }
            }

            return _institutionNumber;
        }

        set
        {
            _institutionNumber = value;
        }
    }

    public string EFTAdvice { get; set; } = string.Empty;

    public string EmailAddress { get; set; } = string.Empty;

    public List<CasApTransactionInvoiceLineDetail> InvoiceLineDetails { get; set; } = new();

    public string ToJSONString()
    {
        string dateFormat = "dd-MMM-yyyy";
        string amountFormat = "0.00";

        List<string> lines = new List<string>();
        foreach (var invoiceLineItem in InvoiceLineDetails)
        {
            lines.Add(invoiceLineItem.ToJSONString());
        }

        if (!string.IsNullOrEmpty(InstitutionNumber) && !string.IsNullOrEmpty(TransitNumber) && !string.IsNullOrEmpty(AccountNumber))
        {
            return string.Format("$!$\r\n \"invoiceType\": \"{0}\",\r\n \"supplierNumber\": \"{1}\",\r\n \"supplierSiteNumber\": \"{2}\",\r\n \"invoiceDate\": \"{3}\",\r\n \"invoiceNumber\": \"{4}\",\r\n \"invoiceAmount\": {5},\r\n \"payGroup\": \"{6}\",\r\n \"dateInvoiceReceived\": \"{7}\",\r\n \"dateGoodsReceived\": \"{8}\",\r\n \"remittanceCode\": \"{9}\",\r\n \"specialHandling\": \"{10}\",\r\n \"nameLine1\": \"{11}\",\r\n \"nameLine2\": \"{12}\",\r\n \"addressLine1\": \"{13}\",\r\n \"addressLine2\": \"{14}\",\r\n \"addressLine3\": \"{15}\",\r\n \"city\": \"{16}\",\r\n \"country\": \"{17}\",\r\n \"province\": \"{18}\",\r\n \"postalCode\": \"{19}\",\r\n \"qualifiedReceiver\": \"{20}\",\r\n \"terms\": \"{21}\",\r\n \"payAloneFlag\": \"{22}\",\r\n \"paymentAdviceComments\": \"{23}\",\r\n \"remittanceMessage1\": \"{24}\",\r\n \"remittanceMessage2\": \"{25}\",\r\n \"remittanceMessage3\": \"{26}\",\r\n \"glDate\": \"{27}\",\r\n \"invoiceBatchName\": \"{28}\",\r\n \"currencyCode\": \"{29}\",\r\n \"bankNumber\": \"{30}\",\r\n \"branchNumber\": \"{31}\",\r\n \"accountNumber\": \"{32}\",\r\n \"eftAdviceFlag\": \"{33}\",\r\n \"eftEmailAddress\": \"{34}\",\r\n \"invoiceLineDetails\": [{35}]\r\n$&$",
                InvoiceType,
                SupplierNumber,
                SupplierSiteNumber.ToString("000"),
                InvoiceDate.ToLocalTime().ToString(dateFormat),
                InvoiceNumber,
                InvoiceAmount.ToString(amountFormat),
                PayGroup,
                DateInvoiceReceived.ToLocalTime().ToString(dateFormat),
                DateGoodsReceived.HasValue ? DateGoodsReceived.Value.ToLocalTime().ToString(dateFormat) : "",
                RemittanceCode,
                (SpecialHandling ? "D" : "N"),
                NameLine1,
                NameLine2,
                AddressLine1,
                AddressLine2,
                AddressLine3,
                City,
                Country,
                Province,
                string.IsNullOrEmpty(PostalCode) ? "" : PostalCode.Replace(" ", ""),
                QualifiedReceiver,
                Terms,
                PayAloneFlag,
                PaymentAdviceComments,
                RemittanceMessage1,
                RemittanceMessage2,
                RemittanceMessage3,
                GLDate.HasValue ? GLDate.Value.ToLocalTime().ToString(dateFormat) : "",
                InvoiceBatchName,
                CurrencyCode,
                InstitutionNumber,
                TransitNumber,
                AccountNumber,
                EFTAdvice,
                EmailAddress,
                string.Join(",", lines)
                ).Replace("$!$", "{").Replace("$&$", "}");
        }
        else
        {
            return string.Format("$!$\r\n \"invoiceType\": \"{0}\",\r\n \"supplierNumber\": \"{1}\",\r\n \"supplierSiteNumber\": \"{2}\",\r\n \"invoiceDate\": \"{3}\",\r\n \"invoiceNumber\": \"{4}\",\r\n \"invoiceAmount\": {5},\r\n \"payGroup\": \"{6}\",\r\n \"dateInvoiceReceived\": \"{7}\",\r\n \"dateGoodsReceived\": \"{8}\",\r\n \"remittanceCode\": \"{9}\",\r\n \"specialHandling\": \"{10}\",\r\n \"nameLine1\": \"{11}\",\r\n \"nameLine2\": \"{12}\",\r\n \"addressLine1\": \"{13}\",\r\n \"addressLine2\": \"{14}\",\r\n \"addressLine3\": \"{15}\",\r\n \"city\": \"{16}\",\r\n \"country\": \"{17}\",\r\n \"province\": \"{18}\",\r\n \"postalCode\": \"{19}\",\r\n \"qualifiedReceiver\": \"{20}\",\r\n \"terms\": \"{21}\",\r\n \"payAloneFlag\": \"{22}\",\r\n \"paymentAdviceComments\": \"{23}\",\r\n \"remittanceMessage1\": \"{24}\",\r\n \"remittanceMessage2\": \"{25}\",\r\n \"remittanceMessage3\": \"{26}\",\r\n \"glDate\": \"{27}\",\r\n \"invoiceBatchName\": \"{28}\",\r\n \"currencyCode\": \"{29}\",\r\n \"invoiceLineDetails\": [{30}]\r\n$&$",
                InvoiceType,
                SupplierNumber,
                SupplierSiteNumber.ToString("000"),
                InvoiceDate.ToLocalTime().ToString(dateFormat),
                InvoiceNumber,
                InvoiceAmount.ToString(amountFormat),
                PayGroup,
                DateInvoiceReceived.ToLocalTime().ToString(dateFormat),
                DateGoodsReceived.HasValue ? DateGoodsReceived.Value.ToLocalTime().ToString(dateFormat) : "",
                RemittanceCode,
                (SpecialHandling ? "D" : "N"),
                NameLine1,
                NameLine2,
                AddressLine1,
                AddressLine2,
                AddressLine3,
                City,
                Country,
                Province,
                string.IsNullOrEmpty(PostalCode) ? "" : PostalCode.Replace(" ", ""),
                QualifiedReceiver,
                Terms,
                PayAloneFlag,
                PaymentAdviceComments,
                RemittanceMessage1,
                RemittanceMessage2,
                RemittanceMessage3,
                GLDate.HasValue ? GLDate.Value.ToLocalTime().ToString(dateFormat) : "",
                InvoiceBatchName,
                CurrencyCode,
                string.Join(",", lines)
                ).Replace("$!$", "{").Replace("$&$", "}");
        }
    }
}
