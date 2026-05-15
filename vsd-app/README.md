# vsd-app

## Local Development

### Pre-reqs

- Node 12.x
- npm 6.x

#### For those using [NVM](https://github.com/nvm-sh/nvm)

```bash
nvm install 12.22.12
nvm use 12.22.12
```

## Running the application locally

### NPM Install

From the `vsu-cornet/ClientApp` folder

```
npm install
```

### DotNet Secrets

[Setup secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets?view=aspnetcore-9.0&tabs=windows#secret-manager)

#### Secrets Template

```JSON
{
  "BASE_PATH": "/cvapwebforms",

  "AEM_INTERFACE_URI": "<aem_interface_url",

  "CONFIGURATION_OUTAGEINFORMATION_MESSAGE": "",
  "CONFIGURATION_OUTAGEINFORMATION_STARTDATE": "",
  "CONFIGURATION_OUTAGEINFORMATION_ENDDATE": "",

  "CVAP_COUNSELLING_EMAIL": "",
  "CVAP_EMAIL": "",

  "Dynamics": {
    "AuthenticationType": "OnPremise",
    "ADFS": {
      "DynamicsApiEndpointUrl": "http://dev-coast-dataverse-proxy.silver.devops.bcgov/api/data/v9.0/",
      "OAuth2TokenEndpoint": "https://ststest.gov.bc.ca/adfs/oauth2/token",
      "ClientId": "<onpremise_client_id>",
      "ClientSecret": "<onpremise_client_secret>",
      "ServiceAccountName": "<onpremise_service_account_username>",
      "ServiceAccountPassword": "<onpremise_service_account_password>",
      "ResourceName": "https://cscp-vs.dev.jag.gov.bc.ca/api/data/v9.0/"
    },
    "EntraId": {
      "DynamicsApiEndpointUrl": "https://cscp-dev.api.crm3.dynamics.com/api/data/v9.2/",,
      "TenantId": "<cloud_tenant_id>",
      "ClientId": "<cloud_client_id>",
      "ClientSecret": "<cloud_client_secret>",
      "ResourceName": "https://cscp-dev.api.crm3.dynamics.com"
    }
  }
}
```

### Start the app

#### Backend

From the `vsu-cornet` folder.

```bash
dotnet run
```

The backend should now be available at `localhost:4200/api`.

#### Frontend

From the `vsu-cornet/ClientApp` folder.

```bash
npm start
```

The frontend should now be available at `localhost:4200`.

# PDF Microservice

This project uses a [Weasyprint](http://weasyprint.org/) microservice to generate PDF documents.

The PDF Microservice is currently using the [aquavitae/weasyprint](https://hub.docker.com/r/aquavitae/weasyprint/) image. This is a simple microservice that works in an OpenShift environment.

The microservice is exposed internally to the project on http://weasyprint:5001 or at http://localhost:8083 if you are using the docker-compose development environment.

The following endpoints are available:

```
POST to /pdf?filename=myfile.pdf. The body should contain html

POST to /multiple?filename=myfile.pdf. The body should contain a JSON list of html strings. They will each be rendered and combined into a single pdf
```

By default the deployment configuration does not configure a route to the microservice; therefore it is only accessible internally to the project. If you need an external route for conveyance you can add one manually, but this should only ever be done for a DEV environment.

## Testing

Use Postman or some other tool to post the following html to the deployed pdf microservice. In Postman use `Send and Download` to save the resulting pdf to disk.

Headers to set:

```
Accept: application/pdf
```

Sample html:

```
<!DOCTYPE html>
<html>
<head>
    <title>Test File</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>
```

## References

- Project: [Weasyprint](http://weasyprint.org/)
- Image: [aquavitae/weasyprint](https://hub.docker.com/r/aquavitae/weasyprint/)
- Source: [aquavitae/docker-weasyprint](https://github.com/aquavitae/docker-weasyprint)

## Dataverse How-To

Query
1-1 and N-1 mappings use Join method, see
1-N and N-N mappings query see PaymentRepository.Query method

Insert with children see PaymentRepository.Insert method

### TIPS

For joins, try using anonymous types instead of creating a new class; otherwise you might get object reference not set to an instance of an object errors

Query a join table (you shouldn't need to use this, but just in case)

```
var queryResults = _databaseContext
    .CreateQuery(Vsd_Payment.Fields.Vsd_Vsd_Payment_Vsd_Invoice.ToLower())
    .Where(x => x.Attributes[Vsd_Payment.Fields.Vsd_PaymentId] == paymentQuery.Id);
```

### HELPFUL LINKS

[Dynamics365-Apps-Samples](https://github.com/microsoft/Dynamics365-Apps-Samples/blob/master/samples-from-msdn/EarlyBound/BasicContextExamples.cs)
[Message Execute](https://learn.microsoft.com/en-us/dotnet/api/microsoft.xrm.sdk.iorganizationservice.execute?view=dataverse-sdk-latest)
[Early bound entity classes](https://learn.microsoft.com/en-us/dynamics365/customerengagement/on-premises/developer/org-service/create-early-bound-entity-classes-code-generation-tool?view=op-9-1)
[OrganizationServiceContext LINQ](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/org-service/build-queries-with-linq-net-language-integrated-query)

## CAS Integration

To request support from Mid-Tier/Finance team, add a ticket in Jira project https://jag.gov.bc.ca/jira/browse/VS
Add a comment and tag someone from the Mid-Tier/Finance team. On Jan 6, 2025 that person was Bonnie, Lo; but it may change.

## DYNAMICS AND SCHEDULED JOBS

This repository has the latest code. It was based off of CPU project and contains all of the code from CPU project.
Originally, this repository and CPU were designed to run from different databases.
But since they both use the same database, and so do the other sister projects VSD, VPU, etc; going forward, we should move the following projects to a shared repository that can be used by all of the projects:

- Database
- Manager
- Manager.Contract
- Resources
- Shared.Contract
- Shared.Database
- Tests
- Utilities
  These projects were originally designed to have the Shared.X in the shared repository but now all of them can be shared. So, there is opportunity to consolidate the projects now.
  Consider consolidating Database and Shared.Database, and, Manager.Contract and Shared.Contract

## AUTOMAPPER OPTIMIZATIONS

The following was attempted but the following line would not work because it is unknown which library it is using:
https://ahmadreza.com/2014/09/automapper-and-mapping-expressions/
The BaseRepository can map Expression<DTO, bool> to Expression<Entity, bool> for use with Find, Query, etc.
But there is currently no way to map Expression<DTO, object> to Expression<Entity, object> for use with Update. If this was accomplished, QueryRepository could be removed.
