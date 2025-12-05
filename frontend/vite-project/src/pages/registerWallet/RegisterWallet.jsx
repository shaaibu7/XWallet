import React, { useState, useEffect } from "react";
import { IconCheck, IconWallet, IconLoader } from "@tabler/icons-react";
import useRegisterWallet from "../../hooks/useRegisterWallet";

const RegisterWallet = () => {
  const handleRegisterWallet = useRegisterWallet();
  const [wallet, setWallet] = useState({
    walletName: "",
    fundAmount: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (name, e) => {
    console.log(e.target.name);
    setWallet((preState) => ({ ...preState, [name]: e.target.value }));
  };

  const { walletName, fundAmount } = wallet;

  useEffect(() => {
    console.log(wallet);
  }, [wallet]);
