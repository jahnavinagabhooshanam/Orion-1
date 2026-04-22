import { ListRecentTransactionsData, CreateNewUserData, CreateNewUserVariables, GetUserFraudAlertsData, UpdateRuleStatusData, UpdateRuleStatusVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListRecentTransactions(options?: useDataConnectQueryOptions<ListRecentTransactionsData>): UseDataConnectQueryResult<ListRecentTransactionsData, undefined>;
export function useListRecentTransactions(dc: DataConnect, options?: useDataConnectQueryOptions<ListRecentTransactionsData>): UseDataConnectQueryResult<ListRecentTransactionsData, undefined>;

export function useCreateNewUser(options?: useDataConnectMutationOptions<CreateNewUserData, FirebaseError, CreateNewUserVariables>): UseDataConnectMutationResult<CreateNewUserData, CreateNewUserVariables>;
export function useCreateNewUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewUserData, FirebaseError, CreateNewUserVariables>): UseDataConnectMutationResult<CreateNewUserData, CreateNewUserVariables>;

export function useGetUserFraudAlerts(options?: useDataConnectQueryOptions<GetUserFraudAlertsData>): UseDataConnectQueryResult<GetUserFraudAlertsData, undefined>;
export function useGetUserFraudAlerts(dc: DataConnect, options?: useDataConnectQueryOptions<GetUserFraudAlertsData>): UseDataConnectQueryResult<GetUserFraudAlertsData, undefined>;

export function useUpdateRuleStatus(options?: useDataConnectMutationOptions<UpdateRuleStatusData, FirebaseError, UpdateRuleStatusVariables>): UseDataConnectMutationResult<UpdateRuleStatusData, UpdateRuleStatusVariables>;
export function useUpdateRuleStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateRuleStatusData, FirebaseError, UpdateRuleStatusVariables>): UseDataConnectMutationResult<UpdateRuleStatusData, UpdateRuleStatusVariables>;
