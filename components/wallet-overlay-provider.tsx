"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronDown } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState, type WalletName } from "@solana/wallet-adapter-base";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useIsClient } from "@/hooks/use-is-client";
import { Button } from "@/components/ui/button";

interface WalletOverlayContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const WalletOverlayContext = createContext<WalletOverlayContextValue | null>(
  null
);

export function useWalletOverlay() {
  const ctx = useContext(WalletOverlayContext);
  if (!ctx) {
    throw new Error(
      "useWalletOverlay must be used within WalletOverlayProvider"
    );
  }
  return ctx;
}

export function WalletOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <WalletOverlayContext.Provider value={{ isOpen, open, close }}>
      {children}
      <WalletSelectionOverlay open={isOpen} onClose={close} />
    </WalletOverlayContext.Provider>
  );
}

interface WalletSelectionOverlayProps {
  open: boolean;
  onClose: () => void;
}

function WalletSelectionOverlay({
  open,
  onClose,
}: WalletSelectionOverlayProps) {
  const isClient = useIsClient();
  const {
    wallets,
    select,
    connect,
    connecting,
    connected,
    wallet,
    disconnect,
  } = useWallet();
  const { setVisible } = useWalletModal();
  const [pendingWallet, setPendingWallet] = useState<WalletName | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedWallets = useMemo(() => {
    return [...wallets].sort((a, b) => {
      const order = (readyState: WalletReadyState) => {
        switch (readyState) {
          case WalletReadyState.Installed:
            return 0;
          case WalletReadyState.Loadable:
            return 1;
          case WalletReadyState.NotDetected:
            return 2;
          default:
            return 3;
        }
      };
      return order(a.readyState) - order(b.readyState);
    });
  }, [wallets]);

  const visibleWallets = useMemo(
    () => sortedWallets.slice(0, 3),
    [sortedWallets]
  );

  const getReadyLabel = (state: WalletReadyState) => {
    switch (state) {
      case WalletReadyState.Installed:
        return "Installed";
      case WalletReadyState.Loadable:
        return "Available";
      case WalletReadyState.NotDetected:
        return "Install to continue";
      default:
        return "Unavailable";
    }
  };

  const handleConnect = async (walletName: WalletName) => {
    try {
      setPendingWallet(walletName);
      setError(null);
      await select(walletName);
      await connect();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed";
      setError(message);
    } finally {
      setPendingWallet(null);
    }
  };

  if (!open || !isClient) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg px-4">
      <div className="relative w-full max-w-[500px] min-h-[348px] rounded-[24px] border-2 border-white/10 bg-[#171719]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <button
          type="button"
          aria-label="Close wallet selector"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-2 pr-8">
          <h2 className="text-2xl font-semibold text-white">Connect Wallet</h2>
        </div>

        <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
          <div className="space-y-4">
            {visibleWallets.map((walletOption, index) => {
              const adapterName = walletOption.adapter.name as WalletName;
              const isActive =
                wallet?.adapter.name === adapterName && connected;
              return (
                <div
                  key={adapterName}
                  className={`flex items-center justify-between pb-4 ${
                    index !== visibleWallets.length - 1
                      ? "border-b border-white/10"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/5">
                      {walletOption.adapter.icon ? (
                        <Image
                          src={walletOption.adapter.icon}
                          alt={`${walletOption.adapter.name} logo`}
                          fill
                          sizes="40px"
                          className="object-contain"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                          {walletOption.adapter.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-base font-medium text-white">
                        {walletOption.adapter.name}
                      </p>
                      <p className="text-xs text-white/60">
                        {getReadyLabel(walletOption.readyState)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={
                      !isActive && (connecting || pendingWallet === adapterName)
                    }
                    onClick={() =>
                      isActive
                        ? void disconnect().then(onClose)
                        : handleConnect(adapterName)
                    }
                    className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isActive
                      ? "Disconnect"
                      : pendingWallet === adapterName || connecting
                      ? "Connecting..."
                      : "Connect"}
                  </button>
                </div>
              );
            })}

            {visibleWallets.length === 0 && (
              <p className="text-sm text-white/60">
                No wallets available. Install a Solana wallet extension to
                continue.
              </p>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>

        <div className="mt-6 flex justify-center text-sm text-white/70">
          <button
            type="button"
            onClick={() => setVisible(true)}
            className="flex h-6 w-[131px] items-center justify-center gap-1.5 text-base font-medium text-white transition hover:text-white/80"
          >
            <span>More options</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
              <ChevronDown className="h-3.5 w-3.5 text-white" strokeWidth={2} />
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
