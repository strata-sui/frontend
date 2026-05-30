/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct } from '../../../utils/index';
import { bcs } from '@mysten/sui/bcs';
const $moduleName = '0x2::balance';
export const Balance = new MoveStruct({ name: `${$moduleName}::Balance<phantom T0>`, fields: {
        value: bcs.u64()
    } });
export const Supply = new MoveStruct({ name: `${$moduleName}::Supply<phantom T0>`, fields: {
        value: bcs.u64()
    } });