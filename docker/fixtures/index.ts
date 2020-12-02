/**
 * Insert fake data into CosmosDB database emulator.
 */

import { ContainerResponse } from "@azure/cosmos";
import { toError } from "fp-ts/lib/Either";
import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither";
import {
  NewProfile,
  PROFILE_COLLECTION_NAME,
  ProfileModel
} from "io-functions-commons/dist/src/models/profile";
import {
  NewService,
  SERVICE_COLLECTION_NAME,
  ServiceModel
} from "io-functions-commons/dist/src/models/service";
import { getConfigOrThrow } from "../../utils/config";
import { cosmosdbClient } from "../../utils/cosmosdb";

const config = getConfigOrThrow();
const cosmosDbName = config.COSMOSDB_NAME;

function createDatabase(databaseName: string): TaskEither<Error, void> {
  return tryCatch(
    () => cosmosdbClient.databases.createIfNotExists({ id: databaseName }),
    toError
  ).map(() => void 0);
}

function createCollection(
  databaseName: string,
  collectionName: string,
  partitionKey: string
): TaskEither<Error, ContainerResponse> {
  return tryCatch(
    () =>
      cosmosdbClient
        .database(databaseName)
        .containers.createIfNotExists({ id: collectionName, partitionKey }),
    toError
  );
}

const servicesContainer = cosmosdbClient
  .database(config.COSMOSDB_NAME)
  .container(SERVICE_COLLECTION_NAME);

const serviceModel = new ServiceModel(servicesContainer);

const aService: NewService = NewService.decode({
  authorizedCIDRs: [],
  authorizedRecipients: [],
  departmentName: "Deparment Name",
  isVisible: true,
  kind: "INewService",
  maxAllowedPaymentAmount: 100000,
  organizationFiscalCode: "01234567890",
  organizationName: "Organization name",
  requireSecureChannels: false,
  serviceId: process.env.REQ_SERVICE_ID,
  serviceName: "MyServiceName"
}).getOrElseL(() => {
  throw new Error("Cannot decode service payload.");
});

const profilesContainer = cosmosdbClient
  .database(config.COSMOSDB_NAME)
  .container(PROFILE_COLLECTION_NAME);

const profileModel = new ProfileModel(profilesContainer);

const aProfile: NewProfile = NewProfile.decode({
  acceptedTosVersion: 1,
  email: "email@example.com",
  fiscalCode: "AAAAAA00A00A000A",
  isEmailEnabled: true,
  isEmailValidated: true,
  isInboxEnabled: true,
  isWebhookEnabled: true,
  kind: "INewProfile"
}).getOrElseL(() => {
  throw new Error("Cannot decode profile payload.");
});

createDatabase(cosmosDbName)
  .chain(() => createCollection(cosmosDbName, "message-status", "messageId"))
  .chain(() => createCollection(cosmosDbName, "messages", "fiscalCode"))
  .chain(() =>
    createCollection(cosmosDbName, "notification-status", "notificationId")
  )
  .chain(() => createCollection(cosmosDbName, "notifications", "messageId"))
  .chain(() => createCollection(cosmosDbName, "profiles", "fiscalCode"))
  .chain(() =>
    createCollection(cosmosDbName, "sender-services", "recipientFiscalCode")
  )
  .chain(() => createCollection(cosmosDbName, "services", "serviceId"))
  .run()
  .then(() => serviceModel.create(aService))
  // tslint:disable-next-line: no-console
  .then(p => console.log(p.value))
  .then(() => profileModel.create(aProfile))
  // tslint:disable-next-line: no-console
  .then(s => console.log(s.value))
  // tslint:disable-next-line: no-console
  .catch(console.error);
