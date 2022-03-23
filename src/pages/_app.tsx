import { AppProps } from "next/app";
import Head from "next/head";
import { FC, useEffect, useState } from "react";
import { ContextProvider } from "../contexts/ContextProvider";
import { AppBar } from "../components/AppBar";
import { ContentContainer } from "../components/ContentContainer";
import fs from "fs";
import styled from "@emotion/styled";
import { Spin } from "antd";

require("@solana/wallet-adapter-react-ui/styles.css");
require("antd/dist/antd.dark.css");
require("../styles/ant-replace.css");
require("../styles/globals.css");

export const SpinnerContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const setTokenListIntoCache = async () => {
      let tokenList;
      setIsLoading(true);
      try {
        const tokenListResponse = await fetch(
          "https://token-list.solana.com/solana.tokenlist.json"
        );
        const tokenListJson = await tokenListResponse.json();
        tokenList = tokenListJson.tokens;
      } catch (err) {
        // Fallback in case the endpoint with updated data doesn't work
        const tokenListResponse = JSON.parse(
          fs.readFileSync("./public/token-mapping.json", {
            encoding: "utf8",
            flag: "r",
          })
        );
        tokenList = tokenListResponse.tokens;
      }
      localStorage.setItem("tokenList", JSON.stringify(tokenList));
      setIsLoading(false);
    };

    const tokenList = localStorage.getItem("tokenList");
    if (!tokenList) {
      setTokenListIntoCache();
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Step Finance</title>
      </Head>

      <ContextProvider>
        <div className="flex flex-col h-screen">
          {isLoading ? (
            <SpinnerContainer>
              <Spin tip="Loading..." />
            </SpinnerContainer>
          ) : (
            <>
              <AppBar />
              <ContentContainer>
                <Component {...pageProps} />
              </ContentContainer>
            </>
          )}
        </div>
      </ContextProvider>
    </>
  );
};

export default App;
