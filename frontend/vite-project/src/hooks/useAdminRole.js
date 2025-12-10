import { useState, useEffect } from "react";
import useContract from "./useContract";

const useAdminRole = (userAddress) => {
    const [adminRole, setAdminRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const contract = useContract(true); // Use contract with signer

    useEffect(() => {
        if (!contract || !userAddress) return;

        const fetchAdminRole = async () => {
            setLoading(true);
            setError(null);
            try {
                const role = await contract.getAdminRole(userAddress);
                setAdminRole(role);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminRole();
    }, [contract, userAddress]);

    return { adminRole, loading, error };
};

export default useAdminRole;