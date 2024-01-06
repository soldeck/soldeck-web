import { Typography } from "antd";
import { useProfiles } from "../profiles/profiles-utils";
import { useMemo } from "react";
import { SolBalanceAssetDisplay } from "./sol-balance-ui";
import { TokenBalanceAssetDisplay } from "./token-balance-ui";

export const PortfolioPage = () => {
  const profileContext = useProfiles();

  const activeProfile = useMemo(
    () => profileContext.getActiveProfile(),
    [profileContext]
  );

  return (
    <div>
      <div
        className="mx-auto py-6 sm:px-6 lg:px-8 text-center"
        style={{ width: 1200 }}
      >
        <div className="py-10 m-auto">
          <span>
            <Typography.Title level={5}>
              Current Profile:{" "}
              <Typography.Text code>{activeProfile?.name}</Typography.Text>
            </Typography.Title>
          </span>
        </div>

        <hr className="py-5" />

        <div className="py-3 m-auto">
          <SolBalanceAssetDisplay />
        </div>

        <hr className="py-5" />

        <div className="py-3 m-auto">
          <TokenBalanceAssetDisplay />
        </div>
      </div>
    </div>
  );
};
