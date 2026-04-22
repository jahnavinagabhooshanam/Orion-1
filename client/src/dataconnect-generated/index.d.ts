import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateNewUserData {
  user_insert: User_Key;
}

export interface CreateNewUserVariables {
  username: string;
  email: string;
  passwordHash: string;
}

export interface FraudAlert_Key {
  id: UUIDString;
  __typename?: 'FraudAlert_Key';
}

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

export interface RuleTrigger_Key {
  fraudAlertId: UUIDString;
  ruleId: UUIDString;
  __typename?: 'RuleTrigger_Key';
}

export interface Rule_Key {
  id: UUIDString;
  __typename?: 'Rule_Key';
}

export interface Transaction_Key {
  id: UUIDString;
  __typename?: 'Transaction_Key';
}

export interface UpdateRuleStatusData {
  rule_update?: Rule_Key | null;
}

export interface UpdateRuleStatusVariables {
  ruleId: UUIDString;
  isEnabled: boolean;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListRecentTransactionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRecentTransactionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListRecentTransactionsData, undefined>;
  operationName: string;
}
export const listRecentTransactionsRef: ListRecentTransactionsRef;

export function listRecentTransactions(options?: ExecuteQueryOptions): QueryPromise<ListRecentTransactionsData, undefined>;
export function listRecentTransactions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListRecentTransactionsData, undefined>;

interface CreateNewUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
  operationName: string;
}
export const createNewUserRef: CreateNewUserRef;

export function createNewUser(vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;
export function createNewUser(dc: DataConnect, vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface GetUserFraudAlertsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserFraudAlertsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserFraudAlertsData, undefined>;
  operationName: string;
}
export const getUserFraudAlertsRef: GetUserFraudAlertsRef;

export function getUserFraudAlerts(options?: ExecuteQueryOptions): QueryPromise<GetUserFraudAlertsData, undefined>;
export function getUserFraudAlerts(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserFraudAlertsData, undefined>;

interface UpdateRuleStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRuleStatusVariables): MutationRef<UpdateRuleStatusData, UpdateRuleStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateRuleStatusVariables): MutationRef<UpdateRuleStatusData, UpdateRuleStatusVariables>;
  operationName: string;
}
export const updateRuleStatusRef: UpdateRuleStatusRef;

export function updateRuleStatus(vars: UpdateRuleStatusVariables): MutationPromise<UpdateRuleStatusData, UpdateRuleStatusVariables>;
export function updateRuleStatus(dc: DataConnect, vars: UpdateRuleStatusVariables): MutationPromise<UpdateRuleStatusData, UpdateRuleStatusVariables>;

