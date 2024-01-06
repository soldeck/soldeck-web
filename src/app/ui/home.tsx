import { Typography } from "antd";

export const Home = () => {
  return (
    <div style={{ width: 800 }}>
      <div className="py-5"></div>
      <Typography.Title level={3}>How to use?</Typography.Title>
      <ol className="list-decimal list-inside">
        <li>
          Go to "Settings" page, fill your "Helius API key" and "Birdeye API
          key".
        </li>
        <li>Go to "Profiles" page, adding wallet addresses in your profile.</li>
        <li>
          Go to "Portfolio" page, and see the SOL & token balance & values.
        </li>
      </ol>
      <div className="py-5">
        <hr />
      </div>
      <Typography.Title level={3}>Supported features</Typography.Title>
      <ol className="list-decimal list-inside">
        <li>List wallets' aggregated SOL balances & breakdowns.</li>
        <li>List wallets' aggregated token balances & breakdowns.</li>
      </ol>
      <div className="py-5">
        <hr />
      </div>
      <Typography.Title level={3}>Upcoming features</Typography.Title>
      <ol className="list-decimal list-inside">
        <li>List wallets' DEFI assets.</li>
        <li>List wallets' NFTs.</li>
      </ol>
    </div>
  );
};

{
  /* 使用方式:
1) 到"Settings"頁, 填上你的helius API key及birdeye API key.
2) 到"Profiles"頁, 填上你的wallets (每行一個wallet).
3) 到"Portfolio"頁, 就能看到multi-wallets整合sol/token balance及價值. */
}
