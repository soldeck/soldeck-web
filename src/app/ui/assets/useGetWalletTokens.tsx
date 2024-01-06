import { UseQueryResult, useQueries, useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { heliusApiEndpointUrlAtom } from "../shared/atoms";
import BigNumber from "bignumber.js";
import { axiosInstance as axios } from "../../lib/axios-default";

export function useGetWalletTokensQuery({
  address,
}: {
  address: string;
}): UseQueryResult<WalletTokenInfo[]> {
  const heliusApiEndpointUrl = useAtomValue(heliusApiEndpointUrlAtom);

  return useQuery<WalletTokenInfo[]>({
    queryKey: [
      "get-wallet-tokens",
      { endpoint: heliusApiEndpointUrl, address },
    ],
    queryFn: async (): Promise<WalletTokenInfo[]> => {
      if (!heliusApiEndpointUrl) {
        return [];
      }
      const response = await axios.request({
        url: heliusApiEndpointUrl,
        method: "POST",
        data: {
          jsonrpc: "2.0",
          id: "0",
          method: "searchAssets",
          params: {
            ownerAddress: address,
            page: 1,
            limit: 1000,
            tokenType: "fungible",
          },
        },
      });
      return (response.data as HeliusWalletTokenQueryResult).result.items.map(
        convertDto
      );
    },
    enabled: !!address,
  });
}

export function useGetWalletTokensQueries({
  addresses,
}: {
  addresses: string[];
}): UseQueryResult<WalletTokenInfo[]>[] {
  const heliusApiEndpointUrl = useAtomValue(heliusApiEndpointUrlAtom);

  return useQueries<WalletTokenInfo[]>({
    queries: addresses.map((address) => {
      return {
        queryKey: [
          "get-wallet-tokens",
          { endpoint: heliusApiEndpointUrl, address },
        ],
        queryFn: async (): Promise<WalletTokenInfo[]> => {
          if (!heliusApiEndpointUrl) {
            return [];
          }
          const response = await axios.request({
            url: heliusApiEndpointUrl,
            method: "POST",
            data: {
              jsonrpc: "2.0",
              id: "0",
              method: "searchAssets",
              params: {
                ownerAddress: address,
                page: 1,
                limit: 1000,
                tokenType: "fungible",
              },
            },
          });

          return (
            response.data as HeliusWalletTokenQueryResult
          ).result.items.map(convertDto);
        },
        enabled: !!address,
      };
    }),
  }) as UseQueryResult<WalletTokenInfo[]>[];
}

export type WalletTokenInfo = {
  tokenAddress: string;
  tokenInfo: TokenInfo;
  balance: string;
  valuation: {
    amount: string;
    currency: string;
  } | null;
};

export type TokenInfo = {
  name: string;
  symbol: string | null;
  image: string | null;
  decimals: number;
  price: {
    pricePerToken: string;
    currency: string;
  } | null;
};

type HeliusWalletTokenQueryResult = {
  result: {
    total: number;
    limit: number;
    page: number;
    items: HeliusWalletTokenQueryResultRecord[];
  };
};

type HeliusWalletTokenQueryResultRecord = {
  interface: string;
  id: string;
  content: {
    metadata: {
      name: string;
    };
    links: {
      image: string;
    };
  };
  token_info: {
    symbol: string;
    balance: number;
    decimals: number;
    price_info?: {
      price_per_token: number;
      total_price: number;
      currency: string;
    };
  };
};

function convertDto(
  apiResultRecord: HeliusWalletTokenQueryResultRecord
): WalletTokenInfo {
  return {
    tokenAddress: apiResultRecord.id,
    tokenInfo: {
      name: apiResultRecord.content?.metadata?.name ?? apiResultRecord.id,
      symbol: apiResultRecord.token_info.symbol ?? null,
      image: apiResultRecord.content?.links?.image,
      decimals: apiResultRecord.token_info.decimals,
      price: apiResultRecord.token_info.price_info
        ? {
            pricePerToken:
              "" + apiResultRecord.token_info.price_info.price_per_token,
            currency: apiResultRecord.token_info.price_info.currency,
          }
        : null,
    },
    balance: new BigNumber(apiResultRecord.token_info.balance)
      .dividedBy(new BigNumber(10).pow(apiResultRecord.token_info.decimals))
      .toString(),
    valuation: apiResultRecord.token_info.price_info?.total_price
      ? {
          amount: "" + apiResultRecord.token_info.price_info.total_price,
          currency: apiResultRecord.token_info.price_info.currency,
        }
      : null,
  };
}
