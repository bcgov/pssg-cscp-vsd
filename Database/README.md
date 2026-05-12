## Generate Entities

### Prerequisites

- [XrmToolbox](https://www.xrmtoolbox.com/) with [Early Bound Generator V2 plugin](https://www.xrmtoolbox.com/plugins/DLaB.Xrm.EarlyBoundGeneratorV2/)
  Download the latest version on the XrmToolbox home page. To install the plugin, open XrmToolbox, click on "Configuration -> Tool Library" and search for "Early Bound Generator V2" and install it.
  You can also use Tool Library to update the existing plugins.
- Cisco vpn.gov.bc.ca connection

### How to generate entities

1. Open XrmToolbox, add connection, select connection string, and then add the following connection string replacing the placeholders with your IDIR login:
   `authtype=AD;url=https://cscp-vs.dev.jag.gov.bc.ca;domain=https://ststest.gov.bc.ca/adfs/oauth2/token;username=<idir_username>@gov.bc.ca;password=<password>`
2. Open DLaB.EarlyBoundGeneratorV2.DefaultSettings.xml and then click "Generate" button.
   This will generate the entities, messages, optionsets in their corresponding folders and DatabaseContext.

NOTE in theory, you could add your authentication profile to PAC using your connection string and then use the command lines found in the generated code. If you do try this, please update this ReadMe.md with your findings.

## Troubleshooting

If you encounter a user authentication error and the authentication hasn't changed and your VPN is connected, try restarting the XrmToolbox application. I find this happens often but restarting always fixes the issue.

## Dataverse Cheatsheet

.AddLink - Adds a link between two entity instances that already exist in database
.AddRelatedObject - Adds a new related entity to an existing entity

## Dataverse Authentication

This project supports both **on-premise (ADFS)** and **cloud (Entra ID)** authentication for Dataverse.

### Configuration

#### On-Premise (ADFS) Authentication

```json
{
  "Dynamics": {
    "AuthenticationType": "OnPremise",
    "DynamicsApiEndpointUrl": "http://dev-coast-dataverse-proxy.silver.devops.bcgov/api/data/v9.0/",
    "ADFS": {
      "OAuth2TokenEndpoint": "https://ststest.gov.bc.ca/adfs/oauth2/token",
      "ClientId": "<onpremise-client-id>",
      "ClientSecret": "<onpremise-client-secret>",
      "ServiceAccountName": "<onpremise-service-account-name>",
      "ServiceAccountPassword": "<onpremise-service-account-password>",
      "ResourceName": "https://cscp-vs.dev.jag.gov.bc.ca/api/data/v9.0/"
    }
  }
}
```

#### Cloud (Entra ID) Authentication

```json
{
  "Dynamics": {
    "AuthenticationType": "Cloud",
    "DynamicsApiEndpointUrl": "https://cscp-dev.api.crm3.dynamics.com/api/data/v9.2/",
    "EntraId": {
      "TenantId": "<cloud-tenant-id>",
      "ClientId": "<cloud-client-id>",
      "ClientSecret": "<cloud-client-secret>",
      "ResourceName": "https://cscp-dev.api.crm3.dynamics.com"
    }
  }
}
```

**Notes:**

- Use `AuthenticationType: "OnPremise"` for ADFS authentication (on-premise Dataverse)
- Use `AuthenticationType: "Cloud"` for Entra ID authentication (cloud Dataverse)
- Tokens are cached for 5 minutes to improve performance
- Store sensitive configuration values (ClientId, ClientSecret, passwords) in user secrets or environment variables, not in appsettings.json
