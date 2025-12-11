import { useCallback } from "react";
import { toast } from "react-toastify";
import useContract from "./useContract";
import useTokenContract from "./useTokenContract";
import { useAppKitAccount } from "@reown/appkit/react";
import { useAppKitNetwork } from "@reown/appkit/react";
import { baseSepolia } from "@reown/appkit/networks";
import { parseEther, parseUnits } from "ethers";

const useRegisterWallet = () => {
    const contract = useContract(true);
    const tokenContract = useTokenContract(true);
    const { address } = useAppKitAccount();
    const { chainId } = useAppKitNetwork();
    return useCallback(
        async (walletName, fundAmount) => {
            if (
                !walletName ||
                !fundAmount
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

                const parsedPayment = parseUnits(fundAmount.toString(), 18);

                if (!tokenContract) {
                    toast.error("Token contract not initialized. Please reconnect wallet.");
                    return;
                }

                
                const tx = await contract.registerWallet(
                    walletName,
                    parsedAmount,
                    {
                        gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
                    }
                );
                const reciept = await tx.wait();


                if (reciept.status === 1) {
                    toast.success("Wallet Registered successful");
                    return;
                }
                toast.error("Wallet registration failed");
                return;
            } catch (error) {
                console.trace(error)
                console.error("error while registering wallet: ", error);
                toast.error("Registering wallet errored");
            }
        },
        [address, chainId, contract]
    );
};

export default useRegisterWallet;