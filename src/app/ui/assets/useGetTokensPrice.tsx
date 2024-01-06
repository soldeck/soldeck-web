import {
  QueriesResults,
  UseQueryResult,
  useQueries,
  useQuery,
} from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { birdEyeApiKeyAtom } from "../shared/atoms";
import { axiosInstance as axios } from "../../lib/axios-default";
import { chunkItems } from "../../lib/utils";

export function useGetTokensPriceQuery({
  tokenAddresses,
}: {
  tokenAddresses: string[];
}): UseQueryResult<Record<string, TokenPriceInfo>> {
  const birdEyeApiKey = useAtomValue(birdEyeApiKeyAtom);

  return useQuery<Record<string, TokenPriceInfo>>({
    queryKey: ["get-tokens-price", { tokenAddresses }],
    queryFn: async (): Promise<Record<string, TokenPriceInfo>> => {
      if (!birdEyeApiKey) {
        return {};
      }

      const response = await axios.request({
        url: `https://public-api.birdeye.so/public/multi_price`,
        method: "GET",
        headers: { "x-chain": "solana", "X-API-KEY": birdEyeApiKey },
        params: {
          list_address: tokenAddresses.join(","),
        },
      });

      if (response.data?.success) {
        return convertToPriceMap(
          convertDto(
            tokenAddresses,
            response.data as BirdeyeTokenPriceQueryResult
          )
        );
      } else {
        return {};
      }
    },
    enabled: tokenAddresses && tokenAddresses.length > 0,
  });
}

export function useGetTokensPriceQueries({
  tokenAddresses,
}: {
  tokenAddresses: string[];
  //}): UseQueryResult<Record<string, TokenPriceInfo>, Error>[] {
}): {
  isSuccess: boolean;
  data: Record<string, TokenPriceInfo> | null;
} {
  const birdEyeApiKey = useAtomValue(birdEyeApiKeyAtom);

  const addressesBatches = chunkItems<string>(tokenAddresses, 100);

  return useQueries({
    queries: addressesBatches.map((addressesBatch) => {
      return {
        queryKey: ["get-tokens-price", { addressesBatch }],
        queryFn: async (): Promise<Record<string, TokenPriceInfo>> => {
          if (!birdEyeApiKey) {
            return {};
          }

          const response = await axios.request({
            url: `https://public-api.birdeye.so/public/multi_price`,
            method: "GET",
            headers: { "x-chain": "solana", "X-API-KEY": birdEyeApiKey },
            params: {
              list_address: addressesBatch.join(","),
            },
          });

          if (response.data?.success) {
            return convertToPriceMap(
              convertDto(
                addressesBatch,
                response.data as BirdeyeTokenPriceQueryResult
              )
            );
          } else {
            return {};
          }
        },
        enabled: addressesBatch && addressesBatch.length > 0,
      };
    }),
    combine: (
      results: QueriesResults<Record<string, TokenPriceInfo>[]>
    ): {
      isSuccess: boolean;
      data: Record<string, TokenPriceInfo> | null;
    } => {
      const combinedResult: Record<string, TokenPriceInfo> = {};

      const anyNotSuccess = !!results.find((_) => !_.isSuccess);
      if (anyNotSuccess) {
        return {
          data: null,
          isSuccess: false,
        };
      }

      for (const result of results) {
        Object.assign(combinedResult, result.data);
      }
      return {
        data: combinedResult,
        isSuccess: true,
      };
    },
  });
}

export type TokenPriceInfo = {
  token: string;
  value: string;
  refTime: number;
};

type BirdeyeTokenPriceQueryResult = {
  data: Record<
    string,
    {
      value: number;
      updateUnixTime: number;
      updateHumanTime: string;
      priceChange24h: number;
    } | null
  >;
  success: boolean;
};

export function convertToPriceMap(
  prices: TokenPriceInfo[]
): Record<string, TokenPriceInfo> {
  const priceMap: Record<string, TokenPriceInfo> = {};
  for (const price of prices) {
    priceMap[price.token] = price;
  }
  return priceMap;
}

export function convertDto(
  tokenAddresses: string[],
  resData: BirdeyeTokenPriceQueryResult
): TokenPriceInfo[] {
  const result: TokenPriceInfo[] = [];
  for (const tokenAddress of tokenAddresses) {
    if (resData.data[tokenAddress]) {
      result.push({
        token: tokenAddress,
        value: "" + resData.data[tokenAddress]!.value,
        refTime: resData.data[tokenAddress]!.updateUnixTime * 1000,
      });
    }
  }
  return result;
}
