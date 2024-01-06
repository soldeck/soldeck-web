import { Skeleton, Table, Tooltip, Typography } from "antd";
import { useProfiles } from "../profiles/profiles-utils";
import { useGetBalanceQueries } from "../assets/useGetBalance";
import { useMemo } from "react";
import BigNumber from "bignumber.js";
import { ellipsify } from "../ui-layout";
import { ZoomInOutlined } from "@ant-design/icons";
import {
  TokenPriceInfo,
  useGetTokensPriceQuery,
} from "../assets/useGetTokensPrice";
import { UseQueryResult } from "@tanstack/react-query";

export const SolBalanceAssetDisplay = () => {
  const profileContext = useProfiles();

  const activeProfile = useMemo(
    () => profileContext.getActiveProfile(),
    [profileContext]
  );

  const balanceQueries = useGetBalanceQueries({
    addresses: activeProfile?.walletAddresses ?? [],
  });

  const solPriceQuery: UseQueryResult<Record<string, TokenPriceInfo>> =
    useGetTokensPriceQuery({
      tokenAddresses: ["So11111111111111111111111111111111111111112"],
    });
  const solPrice =
    solPriceQuery.data?.["So11111111111111111111111111111111111111112"] ?? null;

  const isLoading: boolean = useMemo(
    () =>
      !solPriceQuery.isSuccess ||
      !!balanceQueries.find((value) => !value.isSuccess),
    [balanceQueries, solPriceQuery.isSuccess]
  );

  const sortedWalletSolBalances = useMemo(
    () =>
      balanceQueries
        .map((result, i) => {
          return {
            address: activeProfile?.walletAddresses[i],
            balance: result.data,
          };
        })
        .filter((_) => _?.balance)
        .sort((a, b) => {
          return +b.balance! - +a.balance!;
        }),
    [activeProfile?.walletAddresses, balanceQueries]
  );

  const sumSolAmounts = useMemo(
    () =>
      sortedWalletSolBalances
        .map((_) => new BigNumber(_.balance!))
        .reduce((prev, curr) => prev.plus(curr), new BigNumber(0))
        .toString(),
    [sortedWalletSolBalances]
  );

  const breakdownRecordElements = useMemo(
    () =>
      sortedWalletSolBalances
        .map((_) => {
          return {
            address: _.address,
            balance: _.balance,
            pc: +sumSolAmounts
              ? new BigNumber("" + _.balance!)
                  .multipliedBy(new BigNumber(100))
                  .dividedBy(new BigNumber(sumSolAmounts))
                  .toFixed(2)
              : null,
          };
        })
        .map((_) => (
          <div key={_.address}>
            {ellipsify(_.address)} : {_.balance} ({_.pc}%)
          </div>
        )),
    [sortedWalletSolBalances, sumSolAmounts]
  );

  const dataSource = [
    {
      key: "sol",
      amount: <>{sumSolAmounts}</>,
      breakdown: (
        <>
          <Tooltip
            title={breakdownRecordElements}
            overlayInnerStyle={{ minWidth: 600 }}
          >
            <ZoomInOutlined />
          </Tooltip>
        </>
      ),
      value:
        solPrice != null
          ? "$" +
            new BigNumber(solPrice.value)
              .multipliedBy(new BigNumber(sumSolAmounts))
              .toFixed(5)
          : "-",
    },
  ];

  const columns = [
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: "200px",
    },
    {
      title: "Breakdown",
      dataIndex: "breakdown",
      key: "breakdown",
      width: "100px",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      width: "200px",
    },
  ];

  return (
    <div style={{ width: 500 }} className="m-auto">
      <Typography.Title level={3}>SOL Balance</Typography.Title>

      {isLoading ? (
        <Skeleton paragraph={{ rows: 4 }} />
      ) : (
        <Table
          bordered
          pagination={false}
          dataSource={dataSource}
          columns={columns}
          size="small"
        />
      )}
    </div>
  );
};
