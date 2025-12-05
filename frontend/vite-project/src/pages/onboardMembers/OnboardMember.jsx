import React, { useState } from "react";
import { IconUserPlus, IconLoader } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom"; // Added import for navigation
import useOnboardMember from "../../hooks/useOnboardMember";

const OnboardMembers = () => {
  const handleOnboardMember = useOnboardMember();
  const navigate = useNavigate(); // Initialize navigation
  const [member, setMember] = useState({
    walletAddress: "",
    memberName: "",
    fundAmount: 0,
    memberId: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (name, e) => {
    setMember((preState) => ({ ...preState, [name]: e.target.value }));
  };

  const { walletAddress, memberName, fundAmount, memberId } = member;