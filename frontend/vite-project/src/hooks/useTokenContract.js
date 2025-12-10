import { useMemo } from "react";
import useRunners from "./useRunners";
import { Contract } from "ethers";
import ABI from "../ABI/walletXToken.json";

const useTokenContract = (withSigner = false) => {
    const { readOnlyProvider, signer } = useRunners();

    return useMemo(() => {
        if (withSigner) {
            if (!signer) return null;
            return new Contract(
                import.meta.env.VITE_TOKEN_ADDRESS,
                ABI,
                signer
            );
        }
        return new Contract(
            import.meta.env.VITE_TOKEN_ADDRESS,
            ABI,
            readOnlyProvider
        );
    }, [readOnlyProvider, signer, withSigner]);
};

export default useTokenContract;