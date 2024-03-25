"use client";
import { Suspense, useMemo, useCallback } from "react";
import Header from "./Header";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

require("@solana/wallet-adapter-react-ui/styles.css");

const CustomLayout = ({ children }: { children: React.ReactNode }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      // new SaifuWalletAdapter(),
      // new SolflareWalletAdapter(),
      // new TorusWalletAdapter(),
      // new SaifuWalletAdapter()
    ],
    [network]
  );

  const onError = useCallback(
    (error: WalletError) => {
        toast.error(error.message ? `${error.name}: ${error.message}` : error.name);
    },
    []
);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>
          <Suspense>
            <div className="bg-[#0d131c]">
              <Header />
              {children}
              <ToastContainer 
                position = "top-right"
                autoClose = {5000}
                hideProgressBar = {false}
                closeOnClick = {true}
                pauseOnHover = {true}
                draggable = {true}
                theme = "dark"
              />
            </div>
          </Suspense>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default CustomLayout;
