'use client'
import Link from "next/link";
import { Icon } from "@iconify/react";
import { ConnectWalletButton } from "./ConnectWalletButton";

const Header = () => {
    return (
        <div className="flex md:flex-row flex-col items-center py-8 px-16 bg-main-back justify-between">
            <Link href="/" className="flex flex-row items-center">
                <div className="text-3xl text-white font-extrabold">SOLANA COIN FLIP</div>
                <div className="text-3xl rounded-md ml-2 px-2"><Icon icon="emojione-v1:fire" className="mr-1"/></div>
            </Link>
            <div className="flex flex-row items-center gap-4 mt-4 md:m-0">
                <ConnectWalletButton />
            </div>
        </div>
    );
}

export default Header;