// src/services/WalletAddrService.ts

import { SOL_WALLET_ADDR_STORAGE_KEY } from "../../constants";

export class WalletService {
  private static instance: WalletService | null = null;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
        WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  private constructor() {}

  getWalletAddr(): string | null {
    return localStorage.getItem(SOL_WALLET_ADDR_STORAGE_KEY);
  }

  saveWalletAddr(walletAddr: string): void {
    localStorage.setItem(SOL_WALLET_ADDR_STORAGE_KEY, walletAddr);
  }

  removeWalletAddr(): void {
    localStorage.removeItem(SOL_WALLET_ADDR_STORAGE_KEY);
  }

  checkSavedWalletAddr(): boolean {
    return !!this.getWalletAddr();
  }
}
