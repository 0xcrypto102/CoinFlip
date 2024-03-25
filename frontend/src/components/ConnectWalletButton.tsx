import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

export const ConnectWalletButton = () => {
    return (
      <div className=" float-right">
        <div className="rounded-md border bg-gray-600 text-base">
          <WalletMultiButtonDynamic />
        </div>
      </div>
    );
}