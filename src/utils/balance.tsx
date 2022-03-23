import CoinGecko from "coingecko-api";
import BN from "bn.js";
import { TokenBalance } from "models/tokens";

export const numberToUSDFormat = (number: number | string): string => {
  const formattedNumber: number = Number(number);
  return formattedNumber.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const formatNumberToPercentage = (number: number): string => {
  // Takes 1 as the base percentage(0%)
  return `${((number - 1) * 100).toFixed(2)}%`;
};

export const formatTokenBalance = (
  token: TokenBalance,
  tokenPrice: number
): number => {
  const tokenBalance = new BN(token.balance);
  const decimals = new BN(10).pow(token.decimals);
  const tokensHeld = tokenBalance.div(decimals).toNumber();

  return tokensHeld * tokenPrice;
};

export const percentageOfNumber = (
  number: number,
  numberToCompare: number
): string => {
  return `${(Number(number) / Number(numberToCompare)) * 100}%`;
};

// Receive a list of public keys(addresses) and return their prices
export const getTokenPrices = async (tokensAddressList: Set<string[]>) => {
  const CoinGeckoClient = new CoinGecko();

  try {
    const tokenList = JSON.parse(localStorage.getItem("tokenList"));
    const tokensToSearch = tokenList.filter((token) => {
      return (
        !!token.extensions &&
        !!token.extensions.coingeckoId &&
        tokensAddressList.has(token.address)
      );
    });

    const coinGeckoIdsToSearch = tokensToSearch.map(
      (token) => token.extensions.coingeckoId
    );

    const fetchedPrices = (
      await CoinGeckoClient.simple.price({
        ids: coinGeckoIdsToSearch,
        vs_currencies: "usd",
      })
    ).data;

    // Map public key with its price
    const mappedPrices = tokensToSearch.reduce((accumulator, token) => {
      return {
        ...accumulator,
        [token.address]: fetchedPrices[token.extensions.coingeckoId].usd,
      };
    }, {});

    return mappedPrices;
  } catch (err) {
    console.error("failed to getTokenPrices");
    return {};
  }
};
