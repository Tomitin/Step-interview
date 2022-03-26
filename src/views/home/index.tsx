// Next, React
import { FC, useEffect, useState } from "react";
import { Collapse, Popover, Spin, Table } from "antd";
import {
  formatNumberToPercentage,
  formatTokenBalance,
  getTokenPrices,
  numberToUSDFormat,
  percentageOfNumber,
} from "utils/balance";
import { Button } from "antd";
import {
  BulbIcon,
  InformationIcon,
  PlatformCellContainer,
  PlatformNameContainer,
  SimpleText,
  SpinnerContainer,
  TableContainer,
  TableContentContainer,
  TableDataContainer,
  TableSummaryContainer,
  TableTitle,
  TableTitleContainer,
  TotalBalance,
  TotalBalanceContainer,
} from "./styled";
import Text from "antd/lib/typography/Text";
import Link from "antd/lib/typography/Link";
import { InvestinClient } from "../../investin-sdk/src/index";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { INVESTMENT_MODEL } from "../../investin-sdk/src/types";
import { ManagedFund } from "models/funds";
import CollapsePanel from "antd/lib/collapse/CollapsePanel";
import { ColumnsType } from "antd/lib/table";
import FundPopover from "components/FundPopover";

const investinFundInfoURL = (fundAddress: string) =>
  `https://capitalfund-api-1-8ftn8.ondigitalocean.app/fund/${fundAddress}/decentralised`;

export const HomeView: FC = ({}) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [managedFundsList, setManagedFundsList] = useState<ManagedFund[]>([]);
  const [totalPortfolioAmount, setTotalPortfolioAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getPortfolioByAddress = async (address: string) => {
    const investinClient = new InvestinClient(connection);
    const investorPublicKey = new PublicKey(address);
    let investmentList: INVESTMENT_MODEL[] = [];
    try {
      investmentList = await investinClient.getInvestmentsByInvestorAddress(
        investorPublicKey
      );
    } catch (error) {
      console.error("getInvestmentsByInvestorAddress", error);
    }

    // Get all tokens adresses from all funds
    const tokensAddressList = investmentList.flatMap((investment) =>
      investment.tokens.map((token) => token.mint.toString())
    );
    // In order to optimize as much as possible, all tokens in all funds are listed in this array
    // so tokenList with 10k+ items is iterated only once
    const uniqueAddressTokens: Set<any[]> = new Set(tokensAddressList);
    const tokenPrices = await getTokenPrices(uniqueAddressTokens);

    let totalPortfolioAmount = 0;
    const investmentsPromiseList = investmentList.map(
      async (investment, index) => {
        totalPortfolioAmount += Number(investment.currentReturns);
        try {
          const fundResponse = await fetch(
            investinFundInfoURL(investment.fundAddress)
          );
          const fundData = await fundResponse.json();

          // Calculate the sum of all tokens held by the fund
          const totalFundAllocationsAmount = investment.tokens.reduce(
            (accumulator, token) => {
              const tokenKey = token.mint.toString();
              return (
                accumulator + formatTokenBalance(token, tokenPrices[tokenKey])
              );
            },
            0
          );
          const formattedFunds = investment.tokens.map((token) => {
            const tokenKey = token.mint.toString();
            //Percentage of token being held across of all tokens held by the fund
            const tokenPercentage =
              formatTokenBalance(token, tokenPrices[tokenKey]) /
              totalFundAllocationsAmount;

            // Get the amount of tokens held by fund relative with what the user has invested into the fund
            const tokenAmount = investment.currentReturns * tokenPercentage;

            return {
              tokenAmount,
              tokenName: token.symbol,
              tokenPercentage,
            };
          });
          return {
            key: index,
            platform: {
              name: "Investin",
            },
            fund: {
              name: fundData.fund.name,
              address: investment.fundAddress,
            },
            currentPerformance:
              Number(investment.currentReturns) / Number(investment.amount),
            positionValue: {
              currentReturns: investment.currentReturns,
              fundAllocations: formattedFunds,
            },
          };
        } catch (error) {
          console.log(error);
        }
        return [];
      }
    );

    const formattedInvestmentList = await Promise.all(investmentsPromiseList);
    return {
      totalPortfolioAmount,
      investmentList: formattedInvestmentList as unknown as ManagedFund[],
    };
  };

  useEffect(() => {
    const setPortfolio = async () => {
      setIsLoading(true);
      // many accounts "6KQDNrJoPJRa1UHX7C4Wf5FHgjvnswLMTePyUTySFKeQ"
      // 2 accounts "2hdvQWjkeUCav82PPRKaRs1Xem5Ftkui65qQ8GwmFrZR"
      // 1 account  "8gpJoXXcYHKKe7ZVihEmP99SRAkqEmbsEb4Qr5fqFQga"

      // For own wallet
      const portfolio = await getPortfolioByAddress(
        wallet.publicKey.toString()
      );
      // const portfolio = await getPortfolioByAddress(
      //   "6F49KZQJBJmZ6Nn7JnxheWQa8xPxu37x7FYLHM2QiX1s"
      // );
      setIsLoading(false);
      setManagedFundsList(portfolio.investmentList);
      setTotalPortfolioAmount(portfolio.totalPortfolioAmount);
    };

    if (!wallet.connecting && wallet.connected && !wallet.disconnecting) {
      setPortfolio();
    } else {
      setManagedFundsList([]);
      setTotalPortfolioAmount(0);
      setIsLoading(false);
    }
  }, [wallet]);

  const columns: ColumnsType<any> = [
    {
      title: <SimpleText color="#B2B2B2">Platform</SimpleText>,
      dataIndex: "platform",
      render: (platform) => (
        <PlatformCellContainer>
          <img
            width={20}
            src="https://raw.githubusercontent.com/Investin-pro/Investin_docs/main/site/assets/logo.png"
          />
          <PlatformNameContainer>
            <Text>{platform.name}</Text>
          </PlatformNameContainer>
        </PlatformCellContainer>
      ),
    },
    {
      title: <SimpleText color="#B2B2B2">Fund Name</SimpleText>,
      dataIndex: "fund",
      sorter: {
        compare: (a, b) => a.fund.name.localeCompare(b.fund.name),
      },
      render: (fund) => (
        <Link
          href={`https://sol.beta.investin.pro/fund-details/${fund.address}`}
          target="_blank"
        >
          {fund.name}
        </Link>
      ),
    },
    {
      title: <SimpleText color="#B2B2B2">Fund Performance</SimpleText>,
      dataIndex: "currentPerformance",
      sorter: {
        compare: (a, b) => a.currentPerformance - b.currentPerformance,
      },
      render: (positionValue) => (
        <Text>{formatNumberToPercentage(positionValue)}</Text>
      ),
    },
    {
      title: <SimpleText color="#B2B2B2">Value of Your Position</SimpleText>,
      dataIndex: "positionValue",
      sorter: {
        compare: (a, b) =>
          a.positionValue.currentReturns - b.positionValue.currentReturns,
      },
      align: "right",
      render: (positionValue) => (
        <div>
          <TableDataContainer>
            <SimpleText fontWeight="800" fontSize="14px">
              {numberToUSDFormat(positionValue.currentReturns)}
            </SimpleText>
          </TableDataContainer>
          <TableDataContainer>
            <SimpleText>
              Across {positionValue.fundAllocations.length} assets
            </SimpleText>
            <Popover
              align={{ offset: [-12, 3] }}
              placement="bottomLeft"
              overlayClassName=""
              content={
                <FundPopover fundsAllocations={positionValue.fundAllocations} />
              }
              getPopupContainer={(container) => container}
            >
              <InformationIcon></InformationIcon>
            </Popover>
          </TableDataContainer>
          <TableDataContainer>
            <Button type="primary" style={{ marginRight: "12px" }} disabled>
              Step in
            </Button>
            <Button type="primary">Step out</Button>
          </TableDataContainer>
        </div>
      ),
    },
  ];

  return (
    <>
      {isLoading ? (
        <SpinnerContainer>
          <Spin tip="Loading..." />
        </SpinnerContainer>
      ) : (
        <TableContainer>
          <Collapse defaultActiveKey={["1"]} expandIconPosition="right" ghost>
            <CollapsePanel
              key={1}
              header={
                <TableSummaryContainer>
                  <TableTitleContainer>
                    <BulbIcon />
                    <TableTitle>Managed Funds</TableTitle>
                  </TableTitleContainer>
                </TableSummaryContainer>
              }
              extra={
                <TotalBalanceContainer>
                  <TotalBalance>
                    {numberToUSDFormat(totalPortfolioAmount)}
                  </TotalBalance>
                </TotalBalanceContainer>
              }
            >
              <TableContentContainer>
                <Table
                  pagination={false}
                  columns={columns}
                  dataSource={managedFundsList}
                ></Table>
              </TableContentContainer>
            </CollapsePanel>
          </Collapse>
        </TableContainer>
      )}
    </>
  );
};
