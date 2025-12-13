import { toast } from "react-toastify";
import useContract from "./useContract";

const useFreezeMember = () => {
    const contract = useContract(false);

    const freezeMember = async (memberAddress) => {
        if (!contract) {
            toast.error("Contract not available");
            return;
        }

        try {
            console.log("Freezing member:", memberAddress);

            // Estimate gas for the transaction
            const estimatedGas = await contract.freezeMember.estimateGas(memberAddress);

            // Execute the transaction with 20% gas buffer
            const tx = await contract.freezeMember(memberAddress, {
                gasLimit: (estimatedGas * BigInt(120)) / BigInt(100),
            });

            console.log("Transaction sent:", tx.hash);
            toast.info("Freezing member... Please wait for confirmation.");

            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log("Transaction confirmed:", receipt);

            toast.success("Member frozen successfully!");
            return receipt;

        } catch (error) {
            console.error("Error freezing member:", error);
            
            let errorMessage = "Failed to freeze member";
            if (error.reason) {
                errorMessage = error.reason;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
            throw error;
        }
    };

    return freezeMember;
};

export default useFreezeMember;