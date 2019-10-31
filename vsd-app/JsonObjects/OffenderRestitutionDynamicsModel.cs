using System;

namespace Gov.Cscp.VictimServices.Public.JsonObjects
{
    public class OffenderRestitutionDynamicsModel
    {
        public Application Application { get; set; }
        public Courtinfocollection[] CourtInfoCollection { get; set; }
        public Providercollection[] ProviderCollection { get; set; }
        public Documentcollection[] DocumentCollection { get; set; }
    }

}


