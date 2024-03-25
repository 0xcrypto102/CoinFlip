'use client';
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getWalletSOLBalance, getResult } from "../api/utils.js";
import { toast } from "react-toastify";
import Win from "@/components/Win";
import Lost from "@/components/Lost";
import Flipping from "@/components/Flipping";
import CoinFlip from "@/components/CoinFlip";

export default function Home() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [selectedSide, setSelectedSide] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(false);
  
  useEffect(() => {
    if(wallet.connected)
      getSolBalance();
  }, [wallet])

  const getSolBalance = async () => {
    const balance:any = await getWalletSOLBalance(wallet.publicKey, connection);
    setBalance(parseFloat(balance));
    return balance;
  }

  const changeSelectedAmount = (option:any) => {
    setSelectedAmount(option);
  }

  const changeSelectedSide = (option:any) =>{
    setSelectedSide(option);
  }

  const handleStart = async () => {
    if(selectedSide === null) {
      toast.warning("Please select the side");
      return;
    }
    if(selectedAmount === null) {
      toast.warning("Please select the amount");
      return;
    }
    if(parseFloat(selectedAmount) > balance) {
      toast.error("Your balance is insufficient.");
      return;
    }
    setLoading(true);
    const result:any = await getResult(wallet, selectedAmount, selectedSide);
    setLoading(false);
    setResult(result);
    setShowResult(true);
    getSolBalance();
  }

  const setResultStatus = () => {
    setShowResult(false);
  }

  return (
    <>
      {
        showResult ? (result ? <Win setResultStatus = {setResultStatus} /> : <Lost setResultStatus = {setResultStatus}/>) : (
          !loading ? <CoinFlip selectedSide = {selectedSide} 
            selectedAmount ={selectedAmount}
            balance = {balance} 
            changeSelectedAmount = {changeSelectedAmount}
            changeSelectedSide = {changeSelectedSide}
            handleStart = {handleStart}
          /> : <Flipping />)
      }
    </>
  );
}
