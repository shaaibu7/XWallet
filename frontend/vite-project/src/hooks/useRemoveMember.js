import { toast } from "react-toastify";
import useContract from "./useContract";

const useRemoveMember = () => {
    const contract = useContract(false);

    const removeMember = async (memberAddress) => {
        if (!contract) {
            toast.error("Contract not available");
            return;
        }

        try {
            console.log("Removing member:", memberAddress);

            // Estimate gas for the transaction
            const estimatedGas = await contract.removeMember.estimateGas(memberAddress);

            // Execute the transaction with 20% gas buffer
            const tx = await contract.removeMember(memberAddress, {
                gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
            });

            console.log("Transaction sent:", tx.hash);
            toast.info("Removing member... Please wait for confirmation.");

            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log("Transaction confirmed:", receipt);

            toast.success("Member removed successfully!");
            return receipt;

        } catch (error) {
            console.error("Error removing member:", error);
            
            let errorMessage = "Failed to remove member";
            if (error.reason) {
                errorMessage = error.reason;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
            throw error;
        }
    };

    return removeMember;
};

export default useRemoveMember;