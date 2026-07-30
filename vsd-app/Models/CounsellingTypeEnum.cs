using System;
using System.ComponentModel;

#nullable enable annotations

namespace Gov.Cscp.VictimServices.Public.Models
{
    public enum CounsellingTypeEnum
    {
        [Description("Counselling Session")]
        CounsellingSession = 100000000,

        [Description("Court Support Counselling")]
        CourtSupportCounselling = 100000001,

        [Description("Psycho -educational Session")]
        PsychoEducationalSession = 100000002,
    }

    public static class EnumHelper
    {
        public static string GetDescription(this Enum? value)
        {
            var field = value.GetType().GetField(value.ToString());
            var attribute = (DescriptionAttribute)Attribute.GetCustomAttribute(field, typeof(DescriptionAttribute));
            return attribute?.Description ?? value.ToString();
        }
    }
}
