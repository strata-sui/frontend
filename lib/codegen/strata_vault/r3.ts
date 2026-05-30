/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction, type TransactionArgument } from '@mysten/sui/transactions';
const $moduleName = '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999::r3';
export const R3LiquidityRealized = new MoveStruct({ name: `${$moduleName}::R3LiquidityRealized`, fields: {
        vault_id: bcs.Address,
        manager_id: bcs.Address,
        oracle_id: bcs.Address,
        strike: bcs.u64(),
        is_up: bcs.bool(),
        quantity_redeemed: bcs.u64(),
        liquid_cash_delta: bcs.u64(),
        executor: bcs.Address
    } });
export interface RedeemPermissionlessOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>,
        RawTransactionArgument<string>,
        RawTransactionArgument<string>,
        RawTransactionArgument<string>,
        TransactionArgument,
        RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function redeemPermissionless(options: RedeemPermissionlessOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        null,
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'r3',
        function: 'redeem_permissionless',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
        typeArguments: options.typeArguments
    });
}