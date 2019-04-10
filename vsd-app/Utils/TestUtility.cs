using System;
using System.Reflection;

namespace Gov.Cscp.VictimServices.Public.Utils
{
    public class TestUtility
    {
		public static bool InUnitTestMode()
        {
            foreach (var assem in Assembly.GetEntryAssembly().GetReferencedAssemblies())
            {
                if (assem.FullName.ToLowerInvariant().StartsWith("microsoft.testplatform"))
                {
                    return true;
                }
            }
            return false;
        }
    }
}
