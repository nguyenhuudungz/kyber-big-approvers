import { ChangeEvent, useState } from "react";
import { gql, request } from "graphql-request";
import { ethers } from "ethers";
import erc20 from "./ERC20.json";

const ROUTER_ADDRESS = "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5";

type Chain = {
  id: string;
  name: string;
  aggregatorSubgraphUrl: string;
  rpcUrl: string;
};

const CHAINS: Chain[] = [
  {
    id: "1",
    name: "Ethereum",
    aggregatorSubgraphUrl: "https://ethereum-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-ethereum",
    rpcUrl: "https://eth.llamarpc.com",
  },
  {
    id: "56",
    name: "BSC",
    aggregatorSubgraphUrl: "https://bsc-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-bsc",
    rpcUrl: "https://1rpc.io/bnb",
  },
  {
    id: "137",
    name: "Polygon",
    aggregatorSubgraphUrl: "https://polygon-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-polygon",
    rpcUrl: "https://polygon-bor.publicnode.com",
  },
  {
    id: "43114",
    name: "Avalanche",
    aggregatorSubgraphUrl: "https://avalanche-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-avalanche",
    rpcUrl: "https://avalanche-c-chain.publicnode.com",
  },
  {
    id: "42161",
    name: "Arbitrum",
    aggregatorSubgraphUrl: "https://arbitrum-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-arbitrum",
    rpcUrl: "https://endpoints.omniatech.io/v1/arbitrum/one/public",
  },
  {
    id: "10",
    name: "Optimism",
    aggregatorSubgraphUrl: "https://optimism-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-optimism",
    rpcUrl: "https://opt-mainnet.g.alchemy.com/v2/N7gZFcuMkhLTTpdsRLEcDXYIJssj6GsI",
  },
  {
    id: "199",
    name: "BitTorrent",
    aggregatorSubgraphUrl: "https://bttc-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-bttc",
    rpcUrl: "https://rpc.bittorrentchain.io",
  },
  {
    id: "42262",
    name: "Oasis",
    aggregatorSubgraphUrl: "https://oasis-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-oasis",
    rpcUrl: "https://emerald.oasis.dev\t",
  },
  {
    id: "250",
    name: "Fantom",
    aggregatorSubgraphUrl: "https://fantom-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-fantom",
    rpcUrl: "https://rpc.ftm.tools",
  },
  {
    id: "25",
    name: "Cronos",
    aggregatorSubgraphUrl: "https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-cronos",
    rpcUrl: "https://cronos-evm.publicnode.com",
  },
];

function App() {
  const [selectedChain, setSelectedChain] = useState<Chain>(CHAINS[0]);
  const [tokenAddress, setTokenAddress] = useState("0xdac17f958d2ee523a2206206994597c13d831ec7");
  const [result, setResult] = useState<any[]>([]);
  const [isFinding, setIsFinding] = useState(false);

  const onSelectChain = (e: ChangeEvent<HTMLInputElement>) => setSelectedChain(() => CHAINS.find((chain) => chain.id === e.target.value) || CHAINS[0]);

  const q1 = () => gql`
query MyQuery {
  routerSwappeds(
    orderBy: amountIn
    orderDirection: desc
    first: 1000
    where: {tokenIn: "${tokenAddress}"}
  ) {
    userAddress
  }
}
`;

  const q2 = () => gql`
query MyQuery {
  routerSwappeds(
    orderBy: amountOut
    orderDirection: desc
    first: 1000
    where: {tokenOut: "${tokenAddress}"}
  ) {
    userAddress
  }
}
`;

  const onFind = async () => {
    setIsFinding(true);
    setResult([]);

    try {
      const set = new Set<string>();
      let response: any;

      response = await request<any>(selectedChain.aggregatorSubgraphUrl, q1());
      response.routerSwappeds.map((ele: any) => ele.userAddress).forEach((address: string) => set.add(address));
      response = await request<any>(selectedChain.aggregatorSubgraphUrl, q2());
      response.routerSwappeds.map((ele: any) => ele.userAddress).forEach((address: string) => set.add(address));

      let arr = Array.from(set).map((ele) => ({
        address: ele,
        balance: BigInt(0),
      }));

      const provider = ethers.getDefaultProvider(selectedChain.rpcUrl);
      const contract = new ethers.Contract(tokenAddress, erc20, provider);

      let promises = arr.map((ele) => new Promise((resolve, reject) => resolve(contract["balanceOf"](ele.address))));
      let data: bigint[] = (await Promise.all(promises)) as bigint[];
      data.forEach((ele, i) => (arr[i].balance = ele));
      arr = arr.filter((ele, i) => arr[i].balance != 0n);
      arr.sort((a: any, b: any) => Number(b.balance - a.balance));

      promises = arr.map((ele) => new Promise((resolve, reject) => resolve(contract["allowance"](ele.address, ROUTER_ADDRESS))));
      data = (await Promise.all(promises)) as bigint[];
      arr = arr.filter((ele, i) => data[i] >= arr[i].balance);

      setResult(arr);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFinding(false);
    }
  };

  return (
    <div>
      <h1>KYBER BIG APPROVERS</h1>
      {CHAINS.map((chain, index) => (
        <div key={index}>
          <input type="radio" name="chain" value={chain.id} onChange={onSelectChain} checked={selectedChain.id === chain.id} /> {chain.name}
        </div>
      ))}
      <div>
        Token Address
        <input type="text" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} style={{ width: "333px" }} />
      </div>
      <button onClick={onFind}>Find</button>
      <div>Result: {isFinding ? "Finding..." : ""}</div>
      {result.map((ele) => (
        <div key={ele.address}>
          {ele.address} _____________ {(ele.balance as bigint).toString(10)}
        </div>
      ))}
    </div>
  );
}

export default App;
