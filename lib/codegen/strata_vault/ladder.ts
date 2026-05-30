/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999::ladder';
export const PredictManagerLinked = new MoveStruct({ name: `${$moduleName}::PredictManagerLinked`, fields: {
        vault_id: bcs.Address,
        manager_id: bcs.Address,
        admin: bcs.Address
    } });
export const ManagerFunded = new MoveStruct({ name: `${$moduleName}::ManagerFunded`, fields: {
        vault_id: bcs.Address,
        manager_id: bcs.Address,
        amount: bcs.u64(),
        new_dusdc_in_manager: bcs.u64()
    } });
export const LadderLegOpened = new MoveStruct({ name: `${$moduleName}::LadderLegOpened`, fields: {
        vault_id: bcs.Address,
        manager_id: bcs.Address,
        oracle_id: bcs.Address,
        expiry: bcs.u64(),
        strike: bcs.u64(),
        leg_index: bcs.u64(),
        quantity: bcs.u64()
    } });
export const LadderOpened = new MoveStruct({ name: `${$moduleName}::LadderOpened`, fields: {
        vault_id: bcs.Address,
        manager_id: bcs.Address,
        oracle_id: bcs.Address,
        expiry: bcs.u64(),
        ladder_size: bcs.u64(),
        m_lo_bps: bcs.u64(),
        m_hi_bps: bcs.u64(),
        forward: bcs.u64(),
        sleeve_budget: bcs.u64(),
        legs_minted: bcs.u64()
    } });
export interface InitPredictManagerOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function initPredictManager(options: InitPredictManagerOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'ladder',
        function: 'init_predict_manager',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface FundManagerOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>,
        RawTransactionArgument<string>,
        RawTransactionArgument<string>
    ];
    typeArguments: [
        string
    ];
}
export function fundManager(options: FundManagerOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null,
        null,
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'ladder',
        function: 'fund_manager',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
        typeArguments: options.typeArguments
    });
}
export interface ComputeStrikesOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<number | bigint>,
        RawTransactionArgument<number | bigint>,
        RawTransactionArgument<number | bigint>,
        RawTransactionArgument<number | bigint>
    ];
}
export function computeStrikes(options: ComputeStrikesOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        'u64',
        'u64',
        'u64',
        'u64'
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'ladder',
        function: 'compute_strikes',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface ComputePerLegBudgetOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<number | bigint>,
        RawTransactionArgument<number | bigint>
    ];
}
export function computePerLegBudget(options: ComputePerLegBudgetOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        'u64',
        'u64'
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'ladder',
        function: 'compute_per_leg_budget',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface DefaultMLoBpsOptions {
    package?: string;
    arguments?: [
    ];
}
export function defaultMLoBps(options: DefaultMLoBpsOptions = {}) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'ladder',
        function: 'default_m_lo_bps',
    });
}
export interface DefaultMHiBpsOptions {
    package?: string;
    arguments?: [
    ];
}
export function defaultMHiBps(options: DefaultMHiBpsOptions = {}) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'ladder',
        function: 'default_m_hi_bps',
    });
}
export interface DefaultLadderSizeOptions {
    package?: string;
    arguments?: [
    ];
}
export function defaultLadderSize(options: DefaultLadderSizeOptions = {}) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'ladder',
        function: 'default_ladder_size',
    });
}
export interface MinLadderSizeOptions {
    package?: string;
    arguments?: [
    ];
}
export function minLadderSize(options: MinLadderSizeOptions = {}) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'ladder',
        function: 'min_ladder_size',
    });
}
export interface MaxLadderSizeOptions {
    package?: string;
    arguments?: [
    ];
}
export function maxLadderSize(options: MaxLadderSizeOptions = {}) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'ladder',
        function: 'max_ladder_size',
    });
}
export interface OpenHedgeLadderOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>,
        RawTransactionArgument<string>,
        RawTransactionArgument<string>,
        RawTransactionArgument<string>,
        RawTransactionArgument<number | bigint>,
        RawTransactionArgument<number | bigint>,
        RawTransactionArgument<number | bigint>,
        RawTransactionArgument<number | bigint>,
        RawTransactionArgument<number | bigint>,
        RawTransactionArgument<number | bigint>
    ];
    typeArguments: [
        string
    ];
}
export function openHedgeLadder(options: OpenHedgeLadderOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null,
        null,
        null,
        null,
        'u64',
        'u64',
        'u64',
        'u64',
        'u64',
        'u64',
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'ladder',
        function: 'open_hedge_ladder',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
        typeArguments: options.typeArguments
    });
}