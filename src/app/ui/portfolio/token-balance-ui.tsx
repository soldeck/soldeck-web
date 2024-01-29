import { Skeleton, Table, Tooltip, Typography } from "antd";
import { useProfiles } from "../profiles/profiles-utils";
import { useCallback, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { ellipsify } from "../ui-layout";
import { ZoomInOutlined } from "@ant-design/icons";
import {
  TokenInfo,
  useGetWalletTokensQueries,
} from "../assets/useGetWalletTokens";
import { useGetTokensPriceQueries } from "../assets/useGetTokensPrice";
import Column from "antd/es/table/Column";
import Search from "antd/es/input/Search";
import {
  sumStrNumbers,
  multiStrNumbers,
  strNumberComparator,
} from "../../lib/numbers-utils";

export const TokenBalanceAssetDisplay = () => {
  const profileContext = useProfiles();

  const activeProfile = useMemo(
    () => profileContext.getActiveProfile(),
    [profileContext]
  );

  const tokenBalanceQueries = useGetWalletTokensQueries({
    addresses: activeProfile?.walletAddresses ?? [],
  });

  const isTokenBalanceQueriesLoading: boolean = useMemo(
    () => !!tokenBalanceQueries.find((value) => !value.isSuccess),
    [tokenBalanceQueries]
  );

  const tokenAddresses = useMemo(() => {
    if (isTokenBalanceQueriesLoading) {
      return [];
    }
    const tokensMap: Record<string, boolean> = {};
    tokenBalanceQueries
      .filter((_) => _.isSuccess && _.data)
      .map((_) => _.data)
      .forEach((v) => {
        if (v) {
          v.filter((_) => _.balance)
            .map((_) => _.tokenAddress)
            .forEach((tokenAddress) => {
              tokensMap[tokenAddress] = true;
            });
        }
      });
    return Object.keys(tokensMap).sort();
  }, [isTokenBalanceQueriesLoading, tokenBalanceQueries]);

  const tokensPriceQueries = useGetTokensPriceQueries({ tokenAddresses });

  const isTokenPriceQueriesLoading: boolean = useMemo(
    () => !tokensPriceQueries.isSuccess,
    [tokensPriceQueries]
  );

  const tokenBalanceSummaryRecords: TokenBalanceSummaryRecord[] =
    useMemo(() => {
      if (isTokenBalanceQueriesLoading) {
        return [];
      }

      const walletAddresses = activeProfile?.walletAddresses ?? [];

      const tokenBalanceMap: { [key: string]: TokenBalanceSummaryRecord } = {};

      for (let i = 0; i < walletAddresses.length; i++) {
        const walletAddress = walletAddresses[i];
        for (const walletTokenInfo of tokenBalanceQueries[i].data ?? []) {
          tokenBalanceMap[walletTokenInfo.tokenAddress] = tokenBalanceMap[
            walletTokenInfo.tokenAddress
          ] ?? {
            tokenAddress: walletTokenInfo.tokenAddress,
            balance: 0,
            value: null,
            TokenInfo: null,
            walletBreakdowns: [],
          };

          tokenBalanceMap[walletTokenInfo.tokenAddress].balance = sumStrNumbers(
            tokenBalanceMap[walletTokenInfo.tokenAddress].balance,
            walletTokenInfo.balance
          );

          if (!isTokenPriceQueriesLoading && tokensPriceQueries.data) {
            tokenBalanceMap[walletTokenInfo.tokenAddress].value = sumStrNumbers(
              tokenBalanceMap[walletTokenInfo.tokenAddress].value,
              multiStrNumbers(
                tokenBalanceMap[walletTokenInfo.tokenAddress].balance,
                tokensPriceQueries.data[walletTokenInfo.tokenAddress]?.value ??
                  null
              )
            );
          }

          tokenBalanceMap[walletTokenInfo.tokenAddress].tokenInfo =
            tokenBalanceMap[walletTokenInfo.tokenAddress].tokenInfo ??
            walletTokenInfo.tokenInfo;

          tokenBalanceMap[walletTokenInfo.tokenAddress].walletBreakdowns.push({
            walletAddress,
            balance: walletTokenInfo.balance,
          });
          tokenBalanceMap[walletTokenInfo.tokenAddress].walletBreakdowns.sort(
            (a, b) => +b.balance - +a.balance
          );
        }
      }

      return Object.values(tokenBalanceMap).sort((a, b) => {
        const valueDiff = +(b.value ?? "0") - +(a.value ?? "0");
        if (valueDiff !== 0) return valueDiff;
        if (b.tokenInfo?.symbol && a.tokenInfo?.symbol) {
          if (a.tokenInfo?.symbol < b.tokenInfo?.symbol) {
            return -1;
          } else if (a.tokenInfo?.symbol > b.tokenInfo?.symbol) {
            return 1;
          }
        }
        if (a.tokenAddress < b.tokenAddress) {
          return -1;
        } else if (a.tokenAddress > b.tokenAddress) {
          return 1;
        }
        return 0;
      });
    }, [
      activeProfile?.walletAddresses,
      isTokenBalanceQueriesLoading,
      isTokenPriceQueriesLoading,
      tokenBalanceQueries,
      tokensPriceQueries.data,
    ]);

  return (
    <div style={{ width: 1024 }} className="m-auto">
      <Typography.Title level={3}>Tokens Balance</Typography.Title>

      {isTokenBalanceQueriesLoading ? (
        <Skeleton paragraph={{ rows: 4 }} />
      ) : (
        <TokenBalanceSummaryRecordsTable
          tokenBalanceSummaryRecords={tokenBalanceSummaryRecords}
        />
      )}
    </div>
  );
};

const TokenBalanceSummaryRecordsTable = ({
  tokenBalanceSummaryRecords,
}: {
  tokenBalanceSummaryRecords: TokenBalanceSummaryRecord[];
}) => {
  const [searchFilterText, setSearchFilterText] = useState("");

  const buildBreakdownRecordElements = useCallback(
    (tokenBalanceSummaryRecord: TokenBalanceSummaryRecord) => {
      return tokenBalanceSummaryRecord.walletBreakdowns.map((_) => {
        const pc = tokenBalanceSummaryRecord.balance
          ? new BigNumber("" + _.balance!)
              .multipliedBy(new BigNumber(100))
              .dividedBy(new BigNumber(tokenBalanceSummaryRecord.balance))
              .toFixed(2)
          : null;
        return (
          <div key={_.walletAddress}>
            {ellipsify(_.walletAddress)} : {_.balance} ({pc}%)
          </div>
        );
      });
    },
    []
  );

  // onFilter={(
  //   value: boolean | React.Key,
  //   record: TokenBalanceSummaryRecord
  // ) => {
  //   const valueStr = "" + value;
  //   return (
  //     (record.tokenInfo?.name &&
  //       record.tokenInfo?.name.includes(valueStr)) ||
  //     (record.tokenInfo?.symbol &&
  //       record.tokenInfo?.symbol.includes(valueStr)) ||
  //     record.tokenAddress.includes(valueStr)
  //   );
  // }}

  const dataSource = useMemo(() => {
    return tokenBalanceSummaryRecords
      .map((_) => {
        return {
          key: _.tokenAddress,
          ..._,
        };
      })
      .filter((_: TokenBalanceSummaryRecord) => {
        if (searchFilterText.trim().length === 0) return true;
        const searchValue = searchFilterText.toLowerCase();
        if (_.tokenInfo?.name || _.tokenInfo?.name) {
          return (
            (_.tokenInfo?.name &&
              _.tokenInfo?.name.toLowerCase().includes(searchValue)) ||
            (_.tokenInfo?.symbol &&
              _.tokenInfo?.symbol.toLowerCase().includes(searchValue))
          );
        } else {
          return _.tokenAddress.toLowerCase().includes(searchValue);
        }
      });
  }, [searchFilterText, tokenBalanceSummaryRecords]);

  const onSearch = useCallback((e) => {
    setSearchFilterText(e);
  }, []);

  return (
    <>
      <div className="py-4">
        {/* <div className="inline-block">Search Filter: </div> */}
        <Search
          placeholder="Search token"
          onSearch={onSearch}
          style={{ width: 400 }}
          defaultValue={searchFilterText}
        />
      </div>
      <Table bordered pagination={false} dataSource={dataSource} size="middle">
        <Column
          title="Token"
          key="token"
          render={(_: any, record: TokenBalanceSummaryRecord) => {
            const tokenIcon = record.tokenInfo?.image ? (
              <img
                src={record.tokenInfo?.image}
                className="inline-block"
                style={{ width: 40, height: 40 }}
              />
            ) : null;

            return (
              <div className="inline-flex">
                <a
                  href={`https://birdeye.so/token/${record.tokenAddress}?chain=solana`}
                  target="_blank"
                >
                  <div
                    className="inline-flex"
                    style={{ width: 40, height: 40, alignItems: "center" }}
                  >
                    {tokenIcon}
                  </div>
                  <span className="inline-block w-4"></span>
                  <div className="inline-block">
                    <div>{record.tokenInfo?.name}</div>
                    <div>{record.tokenInfo?.symbol}</div>
                  </div>
                </a>
              </div>
            );
          }}
          // sorter={(
          //   a: TokenBalanceSummaryRecord,
          //   b: TokenBalanceSummaryRecord
          // ) => {
          //   return compareText(
          //     a.tokenInfo?.symbol ?? null,
          //     b.tokenInfo?.symbol ?? null
          //   );
          // }}
        />
        <Column title="Amount" key="amount" dataIndex="balance" />
        <Column
          title="Breakdown"
          key="breakdown"
          render={(_: any, record: TokenBalanceSummaryRecord) => (
            <>
              <Tooltip
                title={buildBreakdownRecordElements(record)}
                overlayInnerStyle={{ minWidth: 600 }}
              >
                <ZoomInOutlined />
              </Tooltip>
            </>
          )}
        />
        <Column
          title="Value"
          key="value"
          render={(_: any, record: TokenBalanceSummaryRecord) =>
            record.value ? `$${record.value}` : "-"
          }
          sorter={(
            a: TokenBalanceSummaryRecord,
            b: TokenBalanceSummaryRecord
          ) => {
            return strNumberComparator(a.value, b.value);
          }}
        />
      </Table>
    </>
  );
};

type TokenBalanceSummaryRecord = {
  tokenAddress: string;
  balance: string;
  value: string | null;
  tokenInfo: TokenInfo | null;
  walletBreakdowns: {
    walletAddress: string;
    balance: string;
  }[];
};
