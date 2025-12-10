import { useCallback } from "react";
import { toast } from "react-toastify";
import useContract from "./useContract";
import { parseUnits } from "ethers";

const useMemberWithdrawal = () => {
    const contract = useContract(true);

    return useCallback(
        async (amount, receiver) => {
            if (!amount || !receiver) {
                toast.error("Missing field(s)");
                return;
            }

            if (!contract) {
                toast.error("Cannot get contract!");
                return;
            }

            try {
                const parsedAmount = BigInt(amount);

                const estimatedGas = await contract.memberWithdrawal.estimateGas(
                    parsedAmount,
                    receiver
                );

                const tx = await contract.memberWithdrawal(parsedAmount, receiver, {
                    gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
                });

                const receipt = await tx.wait();

                if (receipt.status === 1) {
                    toast.success("Withdrawal successful");
                    return;
                }

                toast.error("Withdrawal failed");
            } catch (error) {
                console.error("Error during withdrawal: ", error);
                toast.error("Withdrawal errored");
            }
        },
        [contract]
    );
};

