/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
const $moduleName = '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999::gov';
export const FBpsUpdated = new MoveStruct({ name: `${$moduleName}::FBpsUpdated`, fields: {
        vault_id: bcs.Address,
        old_value: bcs.u64(),
        new_value: bcs.u64()
    } });
export const MaxExposureBpsUpdated = new MoveStruct({ name: `${$moduleName}::MaxExposureBpsUpdated`, fields: {
        vault_id: bcs.Address,
        old_value: bcs.u64(),
        new_value: bcs.u64()
    } });
export const RecommendedLadderSizeUpdated = new MoveStruct({ name: `${$moduleName}::RecommendedLadderSizeUpdated`, fields: {
        vault_id: bcs.Address,
        old_value: bcs.u64(),
        new_value: bcs.u64()
    } });
export const LadderBandUpdated = new MoveStruct({ name: `${$moduleName}::LadderBandUpdated`, fields: {
        vault_id: bcs.Address,
        old_lo_bps: bcs.u64(),
        new_lo_bps: bcs.u64(),
        old_hi_bps: bcs.u64(),
        new_hi_bps: bcs.u64()
    } });
export interface SetFBpsOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>,
        RawTransactionArgument<number | bigint>
    ];
}
export function setFBps(options: SetFBpsOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gov',
        function: 'set_f_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface SetMaxExposureBpsOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>,
        RawTransactionArgument<number | bigint>
    ];
}
export function setMaxExposureBps(options: SetMaxExposureBpsOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gov',
        function: 'set_max_exposure_bps',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface SetRecommendedLadderSizeOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>,
        RawTransactionArgument<number | bigint>
    ];
}
export function setRecommendedLadderSize(options: SetRecommendedLadderSizeOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null,
        'u64'
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gov',
        function: 'set_recommended_ladder_size',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface SetLadderBandOptions {
    package?: string;
    arguments: [
        RawTransactionArgument<string>,
        RawTransactionArgument<number | bigint>,
        RawTransactionArgument<number | bigint>
    ];
}
export function setLadderBand(options: SetLadderBandOptions) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    const argumentsTypes = [
        null,
        'u64',
        'u64'
    ] satisfies (string | null)[];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gov',
        function: 'set_ladder_band',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
    });
}
export interface MaxFBpsOptions {
    package?: string;
    arguments?: [
    ];
}
export function maxFBps(options: MaxFBpsOptions = {}) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gov',
        function: 'max_f_bps',
    });
}
export interface MinMaxExposureBpsOptions {
    package?: string;
    arguments?: [
    ];
}
export function minMaxExposureBps(options: MinMaxExposureBpsOptions = {}) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gov',
        function: 'min_max_exposure_bps',
    });
}
export interface MaxMaxExposureBpsOptions {
    package?: string;
    arguments?: [
    ];
}
export function maxMaxExposureBps(options: MaxMaxExposureBpsOptions = {}) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gov',
        function: 'max_max_exposure_bps',
    });
}
export interface MinRecommendedLadderSizeOptions {
    package?: string;
    arguments?: [
    ];
}
export function minRecommendedLadderSize(options: MinRecommendedLadderSizeOptions = {}) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gov',
        function: 'min_recommended_ladder_size',
    });
}
export interface MaxRecommendedLadderSizeOptions {
    package?: string;
    arguments?: [
    ];
}
export function maxRecommendedLadderSize(options: MaxRecommendedLadderSizeOptions = {}) {
    const packageAddress = options.package ?? '0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'gov',
        function: 'max_recommended_ladder_size',
    });
}