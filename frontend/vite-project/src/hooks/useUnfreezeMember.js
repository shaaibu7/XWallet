import { toast } from "react-toastify";
import useContract from "./useContract";

const useUnfreezeMember = () => {
    const contract = useContract(false);

    const unfreezeMember = async (memberAddress) => {
        if (!contract) {
            toast.error("Contract not available");
            return;
        }

        try {
            console.log("Unfreezing member:", memberAddress);

            // Estimate gas for the transaction
            const estimatedGas = await contract.unfreezeMember.estimateGas(memberAddress);

            // Execute the transaction with 20% gas buffer
            const tx = await contract.unfreezeMember(memberAddress, {
                gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
            });

            console.log("Transaction sent:", tx.hash);
            toast.info("Unfreezing member... Please wait for confirmation.");

            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log("Transaction confirmed:", receipt);

            toast.success("Member unfrozen successfully!");
            return receipt;

        } catch (error) {
            console.error("Error unfreezing member:", error);
            
            let errorMessage = "Failed to unfreeze member";
            if (error.reason) {
                errorMessage = error.reason;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
            throw error;
        }
    };

    return unfreezeMember;
};

export default useUnfreezeMember;