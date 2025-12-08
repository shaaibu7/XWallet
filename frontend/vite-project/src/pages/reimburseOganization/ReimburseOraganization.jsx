import React, { useState } from "react";
import { IconBuildingBank, IconLoader } from "@tabler/icons-react";
import useReimburseWallet from "../../hooks/useReimburseWallet";

const ReimburseOrganization = () => {
  const handleReimburseWallet = useReimburseWallet();
  const [reimburse, setReimburse] = useState({
    reimburseAmount: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (name, e) => {
    // console.log(e.target.name);
    setReimburse((preState) => ({ ...preState, [name]: e.target.value }));
  };

  const { reimburseAmount } = reimburse;

  