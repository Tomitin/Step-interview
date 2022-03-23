import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Step Finance</title>
        <meta name="description" content="Step Finance" />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
