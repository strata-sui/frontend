/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as balance from './deps/0x0000000000000000000000000000000000000000000000000000000000000002/balance';
import * as coin from './deps/0x0000000000000000000000000000000000000000000000000000000000000002/coin';
const $moduleName = '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999::vault';
export const VAULT = new MoveStruct({ name: `${$moduleName}::VAULT`, fields: {
        dummy_field: bcs.bool()
    } });
export const Vault = new MoveStruct({ name: `${$moduleName}::Vault`, fields: {
        id: bcs.Address,
        admin: bcs.Address,
        plp_held: balance.Balance,
        dusdc_held_value: bcs.u64(),
        share_treasury: coin.TreasuryCap,
        total_max_payout: bcs.u64(),
        total_mtm: bcs.u64(),
        f_bps: bcs.u64(),
        max_exposure_bps: bcs.u64(),
        predict_manager_id: bcs.option(bcs.Address),
        dusdc_in_manager: bcs.u64(),
        recommended_ladder_size: bcs.u64(),
        ladder_band_lo_bps: bcs.u64(),
        ladder_band_hi_bps: bcs.u64()
    } });
export const VaultInitialised = new MoveStruct({ name: `${$moduleName}::VaultInitialised`, fields: {
        vault_id: bcs.Address,
        admin: bcs.Address,
        f_bps: bcs.u64(),
        max_exposure_bps: bcs.u64()
    } });
export const Supply = new MoveStruct({ name: `${$moduleName}::Supply`, fields: {
        vault_id: bcs.Address,
        actor: bcs.Address,
        dusdc_amount: bcs.u64(),
        plp_minted: bcs.u64(),
        strata_shares_minted: bcs.u64(),
        share_price_micro: bcs.u64()
    } });
export const Redeem = new MoveStruct({ name: `${$moduleName}::Redeem`, fields: {
        vault_id: bcs.Address,
        actor: bcs.Address,
        strata_shares_burned: bcs.u64(),
        plp_burned: bcs.u64(),
        dusdc_paid_out: bcs.u64(),
        share_price_micro: bcs.u64()
    } });
export interface SharePriceMicroOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function sharePriceMicro(options: SharePriceMicroOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'share_price_micro',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface AvailableForWithdrawOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function availableForWithdraw(options: AvailableForWithdrawOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'available_for_withdraw',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface SupplyOptions {
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
export function supply(options: SupplyOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'supply',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
        typeArguments: options.typeArguments
    });
}
export interface RedeemOptions {
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
export function redeem(options: RedeemOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null,
        null,
        null,
        '0x2::clock::Clock'
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'redeem',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
        typeArguments: options.typeArguments
    });
}
export interface WithinMaxExposureOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function withinMaxExposure(options: WithinMaxExposureOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'within_max_exposure',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface AssertWithinMaxExposureOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function assertWithinMaxExposure(options: AssertWithinMaxExposureOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'assert_within_max_exposure',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface AdminOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function admin(options: AdminOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'admin',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface FBpsOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function fBps(options: FBpsOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'f_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface MaxExposureBpsOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function maxExposureBps(options: MaxExposureBpsOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'max_exposure_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface TotalMaxPayoutOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function totalMaxPayout(options: TotalMaxPayoutOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'total_max_payout',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface TotalMtmOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function totalMtm(options: TotalMtmOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'total_mtm',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface PlpValueOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function plpValue(options: PlpValueOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'plp_value',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface DusdcHeldValueOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function dusdcHeldValue(options: DusdcHeldValueOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'dusdc_held_value',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface DusdcInManagerOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function dusdcInManager(options: DusdcInManagerOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'dusdc_in_manager',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface PredictManagerIdOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function predictManagerId(options: PredictManagerIdOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'predict_manager_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface HasPredictManagerOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function hasPredictManager(options: HasPredictManagerOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'has_predict_manager',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface RecommendedLadderSizeOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function recommendedLadderSize(options: RecommendedLadderSizeOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'recommended_ladder_size',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface LadderBandLoBpsOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function ladderBandLoBps(options: LadderBandLoBpsOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'ladder_band_lo_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface LadderBandHiBpsOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>
    ];
}
export function ladderBandHiBps(options: LadderBandHiBpsOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'vault',
        function: 'ladder_band_hi_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}