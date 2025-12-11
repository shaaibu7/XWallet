import { useCallback } from "react";
import { toast } from "react-toastify";
import useContract from "./useContract";
import useTokenContract from "./useTokenContract";
import { useAppKitAccount } from "@reown/appkit/react";
import { useAppKitNetwork } from "@reown/appkit/react";
import { baseSepolia } from "@reown/appkit/networks";
import { parseEther, parseUnits } from "ethers";

const useOnboardMember = () => {
    const contract = useContract(true);
    const tokenContract = useTokenContract(true);
    const { address } = useAppKitAccount();
    const { chainId } = useAppKitNetwork();
    return useCallback(
        async (walletAddress, memberName, fundAmount, memberId) => {
            if (
                !walletAddress ||
                !memberName ||
                !fundAmount ||
                !memberId
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
               


                if (reciept.status === 1) {
                    toast.success("Member onboarding successful");
                    return;
                }
                toast.error("Member onboarding failed");
                return;
            } catch (error) {
                console.trace(error)
                console.error("error while onboarding member: ", error);
                toast.error("Onboarding member errored");
            }
        },
        [address, chainId, contract]
    );
};

export default useOnboardMember;