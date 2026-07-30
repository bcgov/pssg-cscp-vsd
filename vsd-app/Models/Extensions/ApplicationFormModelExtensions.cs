using System.Linq;
using System.Reflection;
using Database.Model;
using Gov.Cscp.VictimServices.Public.JsonObjects;
using Gov.Cscp.VictimServices.Public.ViewModels;
#nullable enable annotations
using Microsoft.Xrm.Sdk;

namespace Gov.Cscp.VictimServices.Public.Models.Extensions;

public static class ApplicationFormModelExtensions
{
    /// <summary>
    /// Converts an <see cref="ApplicationFormModel"/> to a <see cref="Vsd_CreateCvapClaimRequest"/>
    /// by delegating field mapping to the existing <c>ToVsdVictimsModel()</c> pipeline and then
    /// converting that intermediate model into typed Dataverse SDK entities.
    /// </summary>
    public static Vsd_CreateCvapClaimRequest ConvertToDynamicsRequest(this ApplicationFormModel formModel)
    {
        var dynamics = formModel.ToVsdVictimsModel();

        return new Vsd_CreateCvapClaimRequest
        {
            Application = dynamics.Application?.ToEntity("vsd_application"),
            PoliceFileNumberCollection = dynamics.PoliceFileNumberCollection.ToEntityCollection(
                "vsd_applicationpolicenumber"
            ),
            CourtInfoCollection = dynamics.CourtInfoCollection.ToEntityCollection("vsd_applicationcourtinformation"),
            ProviderCollection = dynamics.ProviderCollection.ToEntityCollection("vsd_participant"),
            DocumentCollection = dynamics.DocumentCollection.ToEntityCollection("activitymimeattachment"),
        };
    }

    /// <summary>
    /// Fields in the Application model that are serialised as comma-separated option-code strings
    /// in the intermediate JSON model but must be sent to Dataverse as <see cref="OptionSetValueCollection"/>.
    /// </summary>
    private static readonly System.Collections.Generic.HashSet<string> MultiSelectOptionSetFields =
        new System.Collections.Generic.HashSet<string>(System.StringComparer.OrdinalIgnoreCase)
        {
            "vsd_cvap_benefitsrequested",
            "vsd_cvap_otherbenefits",
        };

    /// <summary>
    /// Converts any plain-old CLR object into a Dataverse <see cref="Entity"/> by reflecting over its
    /// writable properties and setting each non-null value as an entity attribute.
    /// Read-only properties (e.g. <c>odatatype</c>) are automatically skipped.
    /// </summary>
    private static Entity ToEntity<T>(this T source, string logicalName)
    {
        var entity = new Entity(logicalName);

        foreach (PropertyInfo prop in typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            // Skip read-only computed properties such as `odatatype`
            if (!prop.CanWrite)
                continue;

            var value = prop.GetValue(source);
            if (value == null)
                continue;

            // Multi-select option sets are stored as CSV integer strings in the intermediate model
            if (value is string csvString && MultiSelectOptionSetFields.Contains(prop.Name))
            {
                var collection = new OptionSetValueCollection();
                collection.AddRange(
                    csvString
                        .Split(',', System.StringSplitOptions.RemoveEmptyEntries)
                        .Select(code => new OptionSetValue(int.Parse(code.Trim())))
                );
                entity[prop.Name] = collection;
                continue;
            }

            // Dataverse expects option set integers as OptionSetValue, not raw int
            entity[prop.Name] = value switch
            {
                int i => new OptionSetValue(i),
                _ => value,
            };
        }

        return entity;
    }

    private static EntityCollection ToEntityCollection<T>(this T[]? items, string logicalName)
    {
        var collection = new EntityCollection { EntityName = logicalName };

        if (items is null)
            return collection;

        foreach (var item in items)
            collection.Entities.Add(item.ToEntity(logicalName));

        return collection;
    }
}
