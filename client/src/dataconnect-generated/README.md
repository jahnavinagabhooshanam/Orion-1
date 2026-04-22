# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListRecentTransactions*](#listrecenttransactions)
  - [*GetUserFraudAlerts*](#getuserfraudalerts)
- [**Mutations**](#mutations)
  - [*CreateNewUser*](#createnewuser)
  - [*UpdateRuleStatus*](#updaterulestatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListRecentTransactions
You can execute the `ListRecentTransactions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listRecentTransactions(options?: ExecuteQueryOptions): QueryPromise<ListRecentTransactionsData, undefined>;

interface ListRecentTransactionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRecentTransactionsData, undefined>;
}
export const listRecentTransactionsRef: ListRecentTransactionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listRecentTransactions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListRecentTransactionsData, undefined>;

interface ListRecentTransactionsRef {
  ...
  (dc: DataConnect): QueryRef<ListRecentTransactionsData, undefined>;
}
export const listRecentTransactionsRef: ListRecentTransactionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listRecentTransactionsRef:
```typescript
const name = listRecentTransactionsRef.operationName;
console.log(name);
```

### Variables
The `ListRecentTransactions` query has no variables.
### Return Type
Recall that executing the `ListRecentTransactions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListRecentTransactionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListRecentTransactionsData {
  transactions: ({
    id: UUIDString;
    amount: number;
    currency: string;
    status: string;
    createdAt: TimestampString;
    customer?: {
      username: string;
    };
  } & Transaction_Key)[];
}
```
### Using `ListRecentTransactions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listRecentTransactions } from '@dataconnect/generated';


// Call the `listRecentTransactions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listRecentTransactions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listRecentTransactions(dataConnect);

console.log(data.transactions);

// Or, you can use the `Promise` API.
listRecentTransactions().then((response) => {
  const data = response.data;
  console.log(data.transactions);
});
```

### Using `ListRecentTransactions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listRecentTransactionsRef } from '@dataconnect/generated';


// Call the `listRecentTransactionsRef()` function to get a reference to the query.
const ref = listRecentTransactionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listRecentTransactionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.transactions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.transactions);
});
```

## GetUserFraudAlerts
You can execute the `GetUserFraudAlerts` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserFraudAlerts(options?: ExecuteQueryOptions): QueryPromise<GetUserFraudAlertsData, undefined>;

interface GetUserFraudAlertsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserFraudAlertsData, undefined>;
}
export const getUserFraudAlertsRef: GetUserFraudAlertsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserFraudAlerts(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserFraudAlertsData, undefined>;

interface GetUserFraudAlertsRef {
  ...
  (dc: DataConnect): QueryRef<GetUserFraudAlertsData, undefined>;
}
export const getUserFraudAlertsRef: GetUserFraudAlertsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserFraudAlertsRef:
```typescript
const name = getUserFraudAlertsRef.operationName;
console.log(name);
```

### Variables
The `GetUserFraudAlerts` query has no variables.
### Return Type
Recall that executing the `GetUserFraudAlerts` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserFraudAlertsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserFraudAlertsData {
  user?: {
    username: string;
    fraudAlerts_on_resolvedBy: ({
      alertId: string;
      status: string;
      createdAt: TimestampString;
      transaction: {
        transactionId: string;
        amount: number;
      };
    })[];
  };
}
```
### Using `GetUserFraudAlerts`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserFraudAlerts } from '@dataconnect/generated';


// Call the `getUserFraudAlerts()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserFraudAlerts();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserFraudAlerts(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getUserFraudAlerts().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUserFraudAlerts`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserFraudAlertsRef } from '@dataconnect/generated';


// Call the `getUserFraudAlertsRef()` function to get a reference to the query.
const ref = getUserFraudAlertsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserFraudAlertsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewUser
You can execute the `CreateNewUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewUser(vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface CreateNewUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
}
export const createNewUserRef: CreateNewUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewUser(dc: DataConnect, vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface CreateNewUserRef {
  ...
  (dc: DataConnect, vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
}
export const createNewUserRef: CreateNewUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewUserRef:
```typescript
const name = createNewUserRef.operationName;
console.log(name);
```

### Variables
The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewUserVariables {
  username: string;
  email: string;
  passwordHash: string;
}
```
### Return Type
Recall that executing the `CreateNewUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewUserData {
  user_insert: User_Key;
}
```
### Using `CreateNewUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewUser, CreateNewUserVariables } from '@dataconnect/generated';

// The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`:
const createNewUserVars: CreateNewUserVariables = {
  username: ..., 
  email: ..., 
  passwordHash: ..., 
};

// Call the `createNewUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewUser(createNewUserVars);
// Variables can be defined inline as well.
const { data } = await createNewUser({ username: ..., email: ..., passwordHash: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewUser(dataConnect, createNewUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createNewUser(createNewUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateNewUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewUserRef, CreateNewUserVariables } from '@dataconnect/generated';

// The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`:
const createNewUserVars: CreateNewUserVariables = {
  username: ..., 
  email: ..., 
  passwordHash: ..., 
};

// Call the `createNewUserRef()` function to get a reference to the mutation.
const ref = createNewUserRef(createNewUserVars);
// Variables can be defined inline as well.
const ref = createNewUserRef({ username: ..., email: ..., passwordHash: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewUserRef(dataConnect, createNewUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateRuleStatus
You can execute the `UpdateRuleStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateRuleStatus(vars: UpdateRuleStatusVariables): MutationPromise<UpdateRuleStatusData, UpdateRuleStatusVariables>;

interface UpdateRuleStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRuleStatusVariables): MutationRef<UpdateRuleStatusData, UpdateRuleStatusVariables>;
}
export const updateRuleStatusRef: UpdateRuleStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateRuleStatus(dc: DataConnect, vars: UpdateRuleStatusVariables): MutationPromise<UpdateRuleStatusData, UpdateRuleStatusVariables>;

interface UpdateRuleStatusRef {
  ...
  (dc: DataConnect, vars: UpdateRuleStatusVariables): MutationRef<UpdateRuleStatusData, UpdateRuleStatusVariables>;
}
export const updateRuleStatusRef: UpdateRuleStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateRuleStatusRef:
```typescript
const name = updateRuleStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateRuleStatus` mutation requires an argument of type `UpdateRuleStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateRuleStatusVariables {
  ruleId: UUIDString;
  isEnabled: boolean;
}
```
### Return Type
Recall that executing the `UpdateRuleStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateRuleStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateRuleStatusData {
  rule_update?: Rule_Key | null;
}
```
### Using `UpdateRuleStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateRuleStatus, UpdateRuleStatusVariables } from '@dataconnect/generated';

// The `UpdateRuleStatus` mutation requires an argument of type `UpdateRuleStatusVariables`:
const updateRuleStatusVars: UpdateRuleStatusVariables = {
  ruleId: ..., 
  isEnabled: ..., 
};

// Call the `updateRuleStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateRuleStatus(updateRuleStatusVars);
// Variables can be defined inline as well.
const { data } = await updateRuleStatus({ ruleId: ..., isEnabled: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateRuleStatus(dataConnect, updateRuleStatusVars);

console.log(data.rule_update);

// Or, you can use the `Promise` API.
updateRuleStatus(updateRuleStatusVars).then((response) => {
  const data = response.data;
  console.log(data.rule_update);
});
```

### Using `UpdateRuleStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateRuleStatusRef, UpdateRuleStatusVariables } from '@dataconnect/generated';

// The `UpdateRuleStatus` mutation requires an argument of type `UpdateRuleStatusVariables`:
const updateRuleStatusVars: UpdateRuleStatusVariables = {
  ruleId: ..., 
  isEnabled: ..., 
};

// Call the `updateRuleStatusRef()` function to get a reference to the mutation.
const ref = updateRuleStatusRef(updateRuleStatusVars);
// Variables can be defined inline as well.
const ref = updateRuleStatusRef({ ruleId: ..., isEnabled: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateRuleStatusRef(dataConnect, updateRuleStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.rule_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.rule_update);
});
```

