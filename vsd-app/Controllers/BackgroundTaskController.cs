using Gov.Cscp.VictimServices.Public.Models;
using Gov.Cscp.VictimServices.Public.Services;
using Gov.Cscp.VictimServices.Public.BackgroundWorkItem;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Serilog;
using System.Threading.Tasks;
using System;
using System.Net;
using System.Text.Json;
using System.Collections.Generic;

namespace Gov.Cscp.VictimServices.Public.Controllers
{
    public class Incident
    {
        public string TicketNumber { get; set; }
        public Guid IncidentId { get; set; }
        public int StatusCode { get; set; }
    }

    [Route("api/[controller]")]
    public class BackgroundTaskController : Controller
    {
        private readonly IConfiguration configuration;
        private readonly IDynamicsResultService _dynamicsResultService;
        private readonly ILogger _logger;
        private readonly IBackgroundTaskQueue _backgroundWorkerQueue;


        public BackgroundTaskController(IConfiguration configuration, IDynamicsResultService dynamicsResultService, IBackgroundTaskQueue backgroundWorkerQueue)
        {
            this.configuration = configuration;
            this._dynamicsResultService = dynamicsResultService;
            _logger = Log.Logger;
            _backgroundWorkerQueue = backgroundWorkerQueue;
        }

        private async Task<bool> IsCaseInactive(Guid incidentId)
        {
            try
            {
                string endpointAction = $"incidents({incidentId})/Microsoft.Dynamics.CRM.vsd_IsCaseInactive";
                DynamicsResult result = await _dynamicsResultService.Post(endpointAction, "{}");
                if (result.statusCode != HttpStatusCode.OK)
                {
                    _logger.Error($"Failed to check if case is inactive. Status code: {result.statusCode}");
                    return false;
                }
                // Log the result
                _logger.Information($"IsCaseInactive result: {result.result}");
                return result.result["IsInactive"].ToObject<bool>();
            }
            catch (Exception e)
            {
                _logger.Error(e, "Error in IsCaseInactive");
                return false;
            }
        }

        [HttpPost("CaseClosure")]
        public async Task<IActionResult> CaseClosure()
        {
            // _backgroundWorkerQueue.QueueBackgroundWorkItem(async token => 
            // {
                try {
                    const string fetchXml = @"
                    <fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
                        <entity name='incident'>
                            <attribute name='ticketnumber'/>
                            <attribute name='incidentid'/>
                            <attribute name='statuscode'/>
                            <order attribute='ticketnumber' descending='false'/>
                            <filter type='and'>
                            <condition attribute='vsd_programunit' operator='eq' value='100000000'/>
                            <condition attribute='ticketnumber' operator='not-like' value='VSD%'/>
                            <condition attribute='statuscode' operator='in'>
                                <value>1</value>
                                <value>4</value>
                                <value>3</value>
                            </condition>
                            <condition attribute='createdon' operator='olderthan-x-months' value='6'/>
                            <condition attribute='vsd_cvap_pensionfile' operator='ne' value='1'/>
                            <condition attribute='vsd_cvap_entitlements' operator='in'>
                                <value>100000006</value>
                                <value>100000007</value>
                            </condition>
                            </filter>
                        </entity>
                    </fetch>";

                    string fetchEndpointUrl = $"incidents?fetchXml={Uri.EscapeDataString(fetchXml)}";

                    DynamicsResult result = await _dynamicsResultService.Get(fetchEndpointUrl);

                    _logger.Information("Result from Dynamics: " + result.result);

                    if (result.statusCode != HttpStatusCode.OK)
                    {
                        _logger.Error($"Failed to retrieve incidents. Status code: {result.statusCode}");
                    }

                    var incidents = result.result["value"].ToObject<List<Incident>>();
                    if (incidents == null || incidents.Count == 0)
                    {
                        _logger.Information("No incidents found for the given criteria.");
                    }
                    
                    // Log the GUIDs of the fetched incidents
                    // _logger.Information($"Incident GUIDs: {JsonSerializer.Serialize(incidents)}");

                    // Iterate through each fetched incident
                    foreach (var incident in incidents)
                    {
                    // log the incident details
                    // _logger.Information($"Incident details: {JsonSerializer.Serialize(incident)}");
                    
                    // Check if the case is inactive
                    bool isCaseInactive = await IsCaseInactive(incident.IncidentId);

                    // Log the value of the incident id with the returned value
                    // _logger.Information($"IncidentId: {incident.IncidentId}, IsCaseInactive: {isCaseInactive}");

                    /* statuscode:
                        - 100,000,001: Draft
                        - 100,000,004: Processing
                        - 2: On Hold
                        - 100,000,003: New
                        - 1: In Progress
                        - 4: Waiting for Details
                        - 3: Idle
                    */

                    /* vsd_cvap_entitlements
                        - 100,000,000: Intake
                        - 100,000,001: Ready for Original Decision
                        - 100,000,002: Ready for Reassessment
                        - 100,000,003: Ready for Reconsideration
                        - 100,000,004: Queued for Adjudication
                        - 100,000,005: Adjudication In Progress
                        - 100,000,006: Ongoing Administration
                        - 100,000,007: Claim Ineligible
                        - 100,000,008: Queued for Reassessment
                        - 100,000,009: Reassessment In Progress
                        - 100,000,010: Closed
                    */

                    /* vsd_caseresolution
                        - 100,000,000: Abandoned
                        - 100,000,001: Withdrawn
                        - 100,000,002: Fulfilled/Concluded
                        - 100,000,003: Denied
                        - 100,000,004: Archived
                        - 100,000,005: Created in Error
                        - 100,000,006: Duplicate
                        - 100,000,007: No Action Required
                    */

                    /* vsd_resolvecase
                        - 100,000,000: No
                        - 100,000,001: Yes
                    */

                    if (true) 
                    {
                        if (incident.StatusCode == 1)
                        {
                            // const string patchJson = "{\"vsd_cvap_entitlements\": 100000010, \"vsd_caseconclusionresult\": \"Case is auto closed due to inactivity from 6 months.\", \"vsd_caseresolution\": 100000002, \"vsd_resolvecase\": 100000001}";
                            _logger.Information("Updating case status to closed for incident: " + incident.IncidentId);
                            string patchJson = JsonSerializer.Serialize(new { description = "Test description!" });
                            _logger.Information("Patch JSON: " + patchJson);
                            DynamicsResult patchResult = await _dynamicsResultService.Patch($"incidents({incident.IncidentId})", patchJson);
                            
                            _logger.Information("1 Patch Result from Dynamics: " + patchResult.result);

                            // Update case:
                            // Update Claim Progress Status to "Closed" -> vsd_cvap_entitlements (option set)
                            // Update Case Conclusion Result to "Case is auto closed due to inactivity from 6 months." -> vsd_caseconclusionresult (text)
                            // Update Case Resolution to "Fulfilled/Concluded" -> vsd_caseresolution (option set)
                            // Update Resolve Case to "Yes" -> vsd_resolvecase (option set)

                        }
                        else if (incident.StatusCode == 3 || incident.StatusCode == 4 || incident.StatusCode == 100000003) 
                        {
                            // const string patchJson = "{\"statuscode\": 1, \"vsd_cvap_entitlements\": 100000010, \"vsd_caseconclusionresult\": \"Case is auto closed due to inactivity from 6 months.\", \"vsd_caseresolution\": 100000002, \"vsd_resolvecase\": 100000001}";
                            _logger.Information("Updating case status to closed for incident: " + incident.IncidentId);
                            string patchJson = JsonSerializer.Serialize(new { description = "Test description!" });
                            _logger.Information("Patch JSON: " + patchJson);
                            DynamicsResult patchResult = await _dynamicsResultService.Patch($"incidents({incident.IncidentId})", patchJson);
                            _logger.Information("2 Patch Result from Dynamics: " + patchResult.result);

                            // Change record status to 1 (In Progress) -> statuscode
                            // Update case: 
                            // Update Claim Progress Status to "Closed" -> vsd_cvap_entitlements (option set)
                            // Update Case Conclusion Result to "Case is auto closed due to inactivity from 6 months." -> vsd_caseconclusionresult (text)
                            // Update Case Resolution to "Fulfilled/Concluded" -> vsd_caseresolution (option set)
                            // Update Resolve Case to "Yes" -> vsd_resolvecase (option set)

                        }
                    }
                }
            } catch (Exception e) {
                _logger.Error(e, "Error in CaseClosure");
            }
        // }); 
        return Ok();
        }
    }
}
