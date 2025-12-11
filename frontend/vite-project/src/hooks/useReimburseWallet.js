import { useCallback } from "react";
import { toast } from "react-toastify";
import useContract from "./useContract";
import useTokenContract from "./useTokenContract";
import { useAppKitAccount } from "@reown/appkit/react";
import { useAppKitNetwork } from "@reown/appkit/react";
import { baseSepolia } from "@reown/appkit/networks";
import { parseEther, parseUnits } from "ethers";

const useReimburseWallet = () => {
    const contract = useContract(true);
    const tokenContract = useTokenContract(true);
    const { address } = useAppKitAccount();
    const { chainId } = useAppKitNetwork();
    return useCallback(
        async (reimburseAmount) => {
            if (
                !reimburseAmount
            ) {
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

                const parsedPayment = parseUnits(reimburseAmount.toString(), 18);

                if (!tokenContract) {
                    toast.error("Token contract not initialized. Please reconnect wallet.");
                    return;
                }

                const approveToken = await tokenContract.approve("0x2FaFA6557dFf892CB35A8A1024f564C6b0de45D1", parsedPayment);

                const tokenReciept = await approveToken.wait();

                const parsedAmount = BigInt(reimburseAmount);

                const estimatedGas = await contract.reimburseOrganization.estimateGas(
                    parsedAmount
                );
                const tx = await contract.reimburseOrganization(
                    parsedAmount,
                    {
                        gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
                    }
                );
                const reciept = await tx.wait();


                if (reciept.status === 1) {
                    toast.success("Reimburse wallet successful");
                    return;
                }
                toast.error("Reimburse wallet failed");
                return;
            } catch (error) {
                console.trace(error)
                console.error("error while reimbursing wallet: ", error);
                toast.error("Reimbursing wallet errored");
            }
        },
        [address, chainId, contract]
    );
};

export default useReimburseWallet;