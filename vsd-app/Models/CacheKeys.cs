using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Gov.Cscp.VictimServices.Public.Models
{
    public static class CacheKeys
    {
        public static string PolicyDocumentPrefix { get { return "_PD_"; } }
        public static string PolicyDocumentCategoryPrefix { get { return "_PDC_"; } }
    }
}
