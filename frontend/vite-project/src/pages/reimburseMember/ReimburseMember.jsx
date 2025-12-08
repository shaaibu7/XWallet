import React, { useState, useCallback, useEffect } from "react";
import { IconUserDollar, IconLoader2, IconLoader } from "@tabler/icons-react";
import useContract from "../../hooks/useContract";
import useReimburseMember from "../../hooks/useReimburseMember";

const ReimburseMember = () => {
  const [selectedMember, setSelectedMember] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const readOnlyOnboardContract = useContract(true);
  const reimburseMember = useReimburseMember();
  const [members, setMembers] = useState([]);

  const fetchMembers = useCallback(async () => {
    if (!readOnlyOnboardContract) return;

    try {
      const data = await readOnlyOnboardContract.getMembers();
      const result = await data.toArray();

      console.log(result);

      const parsedMembers = result.map((member) => ({
        id: member[6],
        name: member[3],
      }));

      setMembers(parsedMembers);
    } catch (error) {
      console.log("Error fetching members: ", error);
    }
  }, [readOnlyOnboardContract]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleReimburse = async () => {
    if (!selectedMember || !amount) return;

    setIsProcessing(true);
    try {
      await reimburseMember(selectedMember, amount);
      // Clear the form fields after successful transaction
      setSelectedMember("");
      setAmount("");
    } catch (error) {
      console.error("Error during reimbursement: ", error);
    } finally {
      setIsProcessing(false);
    }
  };