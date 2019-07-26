namespace Gov.Cscp.VictimServices.Public.ViewModels
{
    public class Address
    {
        public string line1 { get; set; }
        public string line2 { get; set; }
        public string city { get; set; }
        public string postalCode { get; set; }
        public string province { get; set; }
        public string country { get; set; }
    }

    public class Courtfile
    {
        public string courtFileNumber { get; set; }
        public string courtLocation { get; set; }
    }

    public class Providerfile
    {
        public string firstName { get; set; }
        public string relationship { get; set; }
    }
}