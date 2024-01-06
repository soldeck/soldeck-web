import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { connectionAtom } from "../shared/atoms";
import BigNumber from "bignumber.js";

// export function useGetBalanceQuery({ address }: { address: string }) {
//   const connection = useAtomValue(connectionAtom);

//   return useQuery<string | null>({
//     queryKey: ["get-balance", { endpoint: connection?.rpcEndpoint, address }],
//     queryFn: async (): Promise<string | null> => {
//       const balance = await connection?.getBalance(new PublicKey(address));
//       if (balance === undefined) {
//         return null;
//       }
//       return new BigNumber(balance)
//         .dividedBy(new BigNumber(LAMPORTS_PER_SOL))
//         .toString();
//     },
//   });
// }

export function useGetBalanceQueries({
  addresses,
}: {
  addresses: string[];
}): UseQueryResult<string | null, Error>[] {
  const connection = useAtomValue(connectionAtom);

  return useQueries({
    queries: addresses.map((address) => {
      return {
        queryKey: [
          "get-balance",
          { endpoint: connection?.rpcEndpoint, address },
        ],
        queryFn: async (): Promise<string | null> => {
          if (!connection?.rpcEndpoint) {
            return null;
          }
          const balance = await connection?.getBalance(new PublicKey(address));
          if (balance === undefined) {
            return null;
          }
          return new BigNumber(balance)
            .dividedBy(new BigNumber(LAMPORTS_PER_SOL))
            .toString();
        },
        enabled: addresses && addresses.length > 0,
      };
    }),
  });
}
