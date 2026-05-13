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

**Notes:**

- Use `AuthenticationType: "OnPremise"` for ADFS authentication (on-premise Dataverse)
- Use `AuthenticationType: "Cloud"` for Entra ID authentication (cloud Dataverse)
- Tokens are cached for 5 minutes to improve performance
- Store sensitive configuration values (ClientId, ClientSecret, passwords) in user secrets or environment variables, not in appsettings.json
