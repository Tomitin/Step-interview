import { FC, useEffect } from "react";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const AppBar: FC = (props) => {
  return (
    <div>
      {/* NavBar / Header */}
      <div className="navbar flex flex-row shadow-lg text-neutral-content">
        {/* Wallet & Settings */}
        <div className="navbar-start"></div>
        <div className="navbar-end">
          <WalletMultiButton className="btn btn-ghost" />
        </div>
      </div>
      {props.children}
    </div>
  );
};
