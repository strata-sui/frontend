import { describe, it, expect } from "vitest";
import {
  PACKAGE_ID,
  VAULT_ID,
  VAULT_COIN_TYPE,
  DUSDC_TYPE,
  MICRO,
  NETWORK,
} from "@/lib/config";

const HEX_OBJECT = /^0x[0-9a-f]{64}$/;

describe("canonical config (v0.1.0-contracts-testnet)", () => {
  it("pins testnet network", () => {
    expect(NETWORK).toBe("testnet");
  });

  it("package + vault ids are valid 32-byte hex object ids", () => {
    expect(PACKAGE_ID).toMatch(HEX_OBJECT);
    expect(VAULT_ID).toMatch(HEX_OBJECT);
  });

  it("share coin type derives from the package id", () => {
    expect(VAULT_COIN_TYPE).toBe(`${PACKAGE_ID}::vault::VAULT`);
  });

  it("dUSDC type is the canonical testnet quote asset", () => {
    expect(DUSDC_TYPE).toContain("::dusdc::DUSDC");
  });

  it("micro divisor matches the 6-decimal fixed point", () => {
    expect(MICRO).toBe(1_000_000);
  });
});
