# NN-GC-Add-ins

OAuthClient required scopes:
analytics:readonly, conversations, groups:readonly, routing:readonly, architect:readonly

QueryString parameters to be configured:
Required by all:
- gcClientId: oAuth client id.
- wcPath: Relative path to whichever module we want to load (/dashboard or /email-widget)
Email-Widget add-in only:
- wcEmailFwdAddr: Address for forwarding the email once the form is fulfilled.
- wcEmailApiAddr: Address of the NN-Wrapper-API service.
- wcEmailDtId: GC datatable id which acts as an index for all the other necessary datatables for the dropdown options management.
