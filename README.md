# IO Functions template

Template per l'utilizzo di Azure Functions (e Durable Functions) all'interno del
progetto IO.

Una volta clonato il repo assicurarsi di:

- editare i metadati del repository nel file `package.json`

- specificare un nome per il
  [TaskHub](https://docs.microsoft.com/it-it/azure/azure-functions/durable/durable-functions-task-hubs)
  in host.json in modo da evitare di condividere lo stesso per function diverse
  che usano lo stesso storage

- effettuare il [tuning dei parametri per le durable
  function](https://docs.microsoft.com/it-it/azure/azure-functions/durable/durable-functions-bindings#host-json)

- impostare a `false` il parametro `FUNCTIONS_V2_COMPATIBILITY_MODE` nel file
  `local.settings.json` nel caso di upgrade a `azure-functions@3.x`

## Sviluppo in locale

- `cp local.settings.json.example local.settings.json`
- editare il parametro `AzureWebJobsStorage` e impostare la stringa di
  connessione a uno storage account Azure esistente
- eseguire `yarn dev`

## Deploy

Il deploy avviene tramite una [pipeline](./.circleci/config.yml)
(workflow) configurata su [CircleCI](https://circleci.com/).

A ogni push su master il workflow effettua il deploy sulle 
risorse di staging. Quando invece un branch è taggato con `latest`
il deploy avviene sulle functions in produzione.

Per il deploy è necessario che il job su CircleCI possa autenticarsi
tramite il client azure. Vanno quindi impostate le seguenti 
variabili di ambiente nei settings del progetto CircleCI:

```shell
AZURE_SP_TENANT="<tenantid>"
AZURE_SP="<service principal id>"
AZURE_SP_PASSWORD="<service principal password>"
AZURE_SUBSCRIPTION_ID="<subscription id>"
PRODUCTION_RESOURCE_GROUP_NAME="<production resource group>"
STAGING_RESOURCE_GROUP_NAME="<staging resource group>"
FUNCTION_APP_NAME="<function app name>"
```

## Esempi di function

Sono presenti alcune function di esempio che permettono di testare la corretta
esecuzione del runtime delle durable functions. Le funzioni attivate 
da [trigger HTTP](./HttpTriggerFunction) utilizzano il pacchetto
[io-functions-express](https://github.com/teamdigitale/io-functions-express).
