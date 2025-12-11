import { useCallback } from "react";
import { toast } from "react-toastify";
import useContract from "./useContract";
import useTokenContract from "./useTokenContract";
import { useAppKitAccount } from "@reown/appkit/react";
import { useAppKitNetwork } from "@reown/appkit/react";
import { baseSepolia } from "@reown/appkit/networks";
import { parseUnits } from "ethers";

const useReimburseMember = () => {
    const contract = useContract(true);
    const tokenContract = useTokenContract(true);
    const { address } = useAppKitAccount();
    const { chainId } = useAppKitNetwork();

    return useCallback(
        async (memberIdentifier, reimburseAmount) => {
            if (!memberIdentifier || !reimburseAmount) {
                toast.error("Missing field(s)");
                return;
            }
            if (!address) {
                toast.error("Connect your wallet!");
                return;
            }
            if (Number(chainId) !== baseSepolia.chainId) {
                toast.error("You are not connected to the right network");
                return;
            }

            if (!contract) {
                toast.error("Cannot get contract!");
                return;
            }

            try {
               
                const tx = await contract.reimburseMember(
                    memberIdentifier,
                    reimburseAmount,
                    {
                        gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
                    }
                );
                const receipt = await tx.wait();

                if (receipt.status === 1) {
                    toast.success("Reimburse member successful");
                    return;
                }
                toast.error("Reimburse member failed");
                return;
            } catch (error) {
                console.trace(error);
                console.error("Error while reimbursing member: ", error);
                toast.error("Reimbursing member errored");
            }
        },
        [address, chainId, contract]
    );
};

export default useReimburseMember;